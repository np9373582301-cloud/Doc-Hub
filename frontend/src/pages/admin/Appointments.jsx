import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const EMPTY = { patient:'', dentist:'', date:'', timeSlot:'', treatmentType:'', notes:'', status:'Pending' };
const TREATMENTS = [
  'General Medical Consultation',
  'Cardiology Checkup & ECG Review',
  'Dermatology & Skin Consultation',
  'Orthopedic Joint Examination',
  'Pediatric Wellness Visit',
  'ENT Examination',
  'Eye & Vision Checkup',
  'Dental Checkup & Cleaning',
  'Full Body Health Screening',
  'Follow-up / Prescription Renewal',
  'Routine Blood Pressure & Diabetes Check',
  'Minor Surgical Procedure',
];
const STATUSES = ['Pending','Confirmed','Completed','Cancelled'];

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [slots, setSlots] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', { params: { status: filterStatus, page, limit: 10 } });
      setItems(data.data); setPages(data.pages); setTotal(data.total);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  }, [filterStatus, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data)).catch(() => {});
    api.get('/dentists', { params: { limit: 100 } }).then(r => setDentists(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.dentist && form.date) {
      api.get('/appointments/slots', { params: { dentistId: form.dentist, date: form.date } })
        .then(r => setSlots(r.data.data)).catch(() => setSlots([]));
    } else { setSlots([]); }
  }, [form.dentist, form.date]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setSlots([]); setModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ patient: item.patient?._id||'', dentist: item.dentist?._id||'', date: item.date?.split('T')[0]||'', timeSlot: item.timeSlot||'', treatmentType: item.treatmentType||'', notes: item.notes||'', status: item.status||'Pending' });
    setModal(true);
  };
  const close = () => { setModal(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await api.put(`/appointments/${editItem._id}`, form); toast.success('Appointment updated'); }
      else { await api.post('/appointments', form); toast.success('Appointment booked'); }
      close(); fetchItems();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/appointments/${deleteDialog._id}`); toast.success('Deleted'); setDeleteDialog(null); fetchItems(); }
    catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Appointments</h1><p className="text-slate-500 text-sm">{total} total</p></div>
        <button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Appointment</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48"><MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div>
          <select className="input w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon="📅" title="No appointments" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['ID','Patient','Doctor','Date','Time','Treatment / Service','Status','Actions'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{a.appointmentId}</td>
                    <td className="table-cell"><p className="font-medium">{a.patient?.name}</p><p className="text-xs text-slate-400">{a.patient?.patientId}</p></td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-800">{a.dentist?.name}</p>
                      <p className="text-xs text-slate-400">{a.dentist?.specialization}</p>
                    </td>
                    <td className="table-cell">{format(new Date(a.date),'dd MMM yyyy')}</td>
                    <td className="table-cell">{a.timeSlot}</td>
                    <td className="table-cell">{a.treatmentType||'—'}</td>
                    <td className="table-cell"><StatusBadge status={a.status} /></td>
                    <td className="table-cell"><div className="flex gap-1">
                      <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteDialog(a)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={close} title={editItem ? 'Edit Appointment' : 'New Appointment'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">Patient *</label>
            <select required className="input" value={form.patient} onChange={set('patient')}>
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select></div>
          <div><label className="label">Doctor *</label>
            <select required className="input" value={form.dentist} onChange={set('dentist')}>
              <option value="">Select doctor...</option>
              {dentists.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}
            </select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Date *</label><input required type="date" className="input" value={form.date} onChange={set('date')} min={new Date().toISOString().split('T')[0]} /></div>
            <div><label className="label">Time Slot *</label>
              {slots.length > 0 ? (
                <select required className="input" value={form.timeSlot} onChange={set('timeSlot')}>
                  <option value="">Select slot...</option>
                  {slots.map(s => <option key={s}>{s}</option>)}
                </select>
              ) : <input className="input" placeholder={form.dentist && form.date ? 'No slots' : 'Pick doctor & date'} value={form.timeSlot} onChange={set('timeSlot')} />}
            </div>
          </div>
          <div><label className="label">Consultation / Treatment Type</label>
            <select className="input" value={form.treatmentType} onChange={set('treatmentType')}>
              <option value="">Select...</option>
              {TREATMENTS.map(t => <option key={t}>{t}</option>)}
            </select></div>
          <div><label className="label">Status</label>
            <select className="input" value={form.status} onChange={set('status')}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select></div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={set('notes')} /></div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Book'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete}
        title="Delete Appointment" message={`Delete appointment ${deleteDialog?.appointmentId}?`} loading={deleting} />
    </div>
  );
}
