import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const TYPES = [
  'General Medical Consultation',
  'Cardiology Evaluation & ECG',
  'Dermatology & Skin Treatment',
  'Orthopedic Joint Examination',
  'Pediatric Wellness Visit',
  'ENT Examination',
  'Eye Examination',
  'Dental Examination & Cleaning',
  'Root Canal Treatment',
  'Composite Filling',
  'X-Ray & Ultrasound Imaging',
  'Routine Blood Pressure & Diabetes Check',
  'Minor Surgical Procedure',
  'Follow-up Visit',
];
const STATUSES = ['Planned','In Progress','Completed'];
const EMPTY = { patient:'', dentist:'', diagnosis:'', treatmentType:'', toothNumber:'', treatmentDate:'', description:'', cost:'', status:'Completed', notes:'' };

export default function Treatments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/treatments', { params: { page, limit: 10 } });
      setItems(data.data); setPages(data.pages); setTotal(data.total);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data));
    api.get('/dentists', { params: { limit: 100 } }).then(r => setDentists(r.data.data));
  }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit = (i) => { setEditItem(i); setForm({ ...i, patient: i.patient?._id||'', dentist: i.dentist?._id||'', treatmentDate: i.treatmentDate?.split('T')[0]||'', cost: i.cost||'' }); setModal(true); };
  const close = () => { setModal(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await api.put(`/treatments/${editItem._id}`, form); toast.success('Updated'); }
      else { await api.post('/treatments', form); toast.success('Treatment added'); }
      close(); fetchItems();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/treatments/${deleteDialog._id}`); toast.success('Deleted'); setDeleteDialog(null); fetchItems(); }
    catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Treatments</h1><p className="text-slate-500 text-sm">{total} records</p></div>
        <button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Treatment</button>
      </div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="🩺" title="No treatments found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Patient','Doctor','Type','Diagnosis','Area / Tooth','Date','Cost','Status',''].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => (
                  <tr key={i._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{i.patient?.name}</td>
                    <td className="table-cell">{i.dentist?.name}</td>
                    <td className="table-cell">{i.treatmentType}</td>
                    <td className="table-cell max-w-32 truncate">{i.diagnosis}</td>
                    <td className="table-cell">{i.toothNumber||'—'}</td>
                    <td className="table-cell">{format(new Date(i.treatmentDate),'dd MMM yy')}</td>
                    <td className="table-cell font-semibold">₹{i.cost?.toLocaleString('en-IN')}</td>
                    <td className="table-cell"><StatusBadge status={i.status} /></td>
                    <td className="table-cell"><div className="flex gap-1">
                      <button onClick={() => openEdit(i)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteDialog(i)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>
      <Modal isOpen={modal} onClose={close} title={editItem ? 'Edit Treatment' : 'Add Treatment'}>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Patient *</label><select required className="input" value={form.patient} onChange={set('patient')}><option value="">Select...</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
          <div><label className="label">Doctor *</label><select required className="input" value={form.dentist} onChange={set('dentist')}><option value="">Select...</option>{dentists.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
          <div><label className="label">Treatment / Service Type *</label><select required className="input" value={form.treatmentType} onChange={set('treatmentType')}><option value="">Select...</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Area / Tooth / Notes (Optional)</label><input className="input" placeholder="e.g. Right shoulder, Tooth 16, Chest" value={form.toothNumber} onChange={set('toothNumber')} /></div>
          <div className="md:col-span-2"><label className="label">Diagnosis *</label><input required className="input" value={form.diagnosis} onChange={set('diagnosis')} /></div>
          <div><label className="label">Treatment Date</label><input type="date" className="input" value={form.treatmentDate} onChange={set('treatmentDate')} /></div>
          <div><label className="label">Cost (₹) *</label><input required type="number" min="0" className="input" value={form.cost} onChange={set('cost')} /></div>
          <div><label className="label">Status</label><select className="input" value={form.status} onChange={set('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="md:col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={set('description')} /></div>
          <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={set('notes')} /></div>
          <div className="md:col-span-2 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving?'Saving...':editItem?'Update':'Add'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete} title="Delete Treatment" message={`Delete this treatment record?`} loading={deleting} />
    </div>
  );
}
