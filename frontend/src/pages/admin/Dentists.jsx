import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const EMPTY = { name:'', email:'', phone:'', specialization:'', experience:'', qualification:'', licenseNumber:'' };
const SPECS = [
  'General Physician',
  'Cardiology (Heart Specialist)',
  'Dermatology (Skin & Hair)',
  'Orthopedics (Bones & Joints)',
  'Pediatrics (Child Health)',
  'Neurology (Brain & Nerves)',
  'Gynecology & Obstetrics',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology (Eye Specialist)',
  'Dental Care & Oral Surgery',
  'Psychiatry & Mental Health',
  'Pulmonology (Lungs & Chest)',
  'Gastroenterology',
  'Oncology (Cancer Care)',
  'Urology',
];

export default function Dentists() {
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dentists', { params: { search, page, limit: 10 } });
      setDentists(data.data); setPages(data.pages); setTotal(data.total);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const openAdd = () => { setEditItem(null); setForm(EMPTY); setModal(true); };
  const openEdit = (d) => { setEditItem(d); setForm({ ...EMPTY, ...d }); setModal(true); };
  const close = () => { setModal(false); setEditItem(null); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editItem) { await api.put(`/dentists/${editItem._id}`, form); toast.success('Doctor updated'); }
      else { await api.post('/dentists', form); toast.success('Doctor added! Default password: DocHub@123'); }
      close(); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/dentists/${deleteDialog._id}`); toast.success('Doctor deleted'); setDeleteDialog(null); fetch(); }
    catch { toast.error('Delete failed'); } finally { setDeleting(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">Doctors & Specialists</h1><p className="text-slate-500 text-sm">{total} registered specialists</p></div>
        <button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Doctor</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b"><div className="relative max-w-sm"><MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search doctors by name or speciality..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div></div>
        {loading ? <LoadingSpinner /> : dentists.length === 0 ? <EmptyState icon="👨‍⚕️" title="No doctors found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Doctor','Specialization','Experience','Phone','License','Actions'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {dentists.map(d => (
                  <tr key={d._id} className="hover:bg-gray-50">
                    <td className="table-cell"><div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">{d.name.charAt(0)}</div>
                      <div><p className="font-medium">{d.name}</p><p className="text-xs text-slate-400">{d.email}</p></div>
                    </div></td>
                    <td className="table-cell"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{d.specialization}</span></td>
                    <td className="table-cell">{d.experience} yrs</td>
                    <td className="table-cell">{d.phone||'—'}</td>
                    <td className="table-cell font-mono text-xs">{d.licenseNumber||'—'}</td>
                    <td className="table-cell"><div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteDialog(d)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={modal} onClose={close} title={editItem ? 'Edit Doctor' : 'Add Doctor'}>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Full Name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email *</label><input required type="email" className="input" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Specialization *</label>
            <select required className="input" value={form.specialization} onChange={set('specialization')}>
              <option value="">Select Speciality...</option>
              {SPECS.map(s=><option key={s}>{s}</option>)}
            </select></div>
          <div><label className="label">Experience (years)</label><input type="number" min="0" className="input" value={form.experience} onChange={set('experience')} /></div>
          <div><label className="label">Qualification</label><input className="input" value={form.qualification} onChange={set('qualification')} /></div>
          <div><label className="label">License Number</label><input className="input" value={form.licenseNumber} onChange={set('licenseNumber')} /></div>
          {!editItem && <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg text-sm text-blue-700">ℹ️ Default password: <strong>DocHub@123</strong></div>}
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-4">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add Doctor'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete}
        title="Delete Doctor" message={`Delete ${deleteDialog?.name}?`} confirmText="Delete" loading={deleting} />
    </div>
  );
}
