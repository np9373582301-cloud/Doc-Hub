import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const EMPTY_FORM = { name:'', email:'', phone:'', dob:'', gender:'Male', bloodGroup:'', address:'', allergies:'', medicalHistory:'', currentMedications:'', emergencyContactName:'', emergencyContactPhone:'', emergencyContactRelation:'' };

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/patients', { params: { search, page, limit: 10 } });
      setPatients(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } catch { toast.error('Failed to load patients'); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { setEditPatient(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (p) => {
    setEditPatient(p);
    setForm({ ...EMPTY_FORM, ...p, dob: p.dob ? p.dob.split('T')[0] : '', allergies: p.allergies?.join(', ') || '',
      emergencyContactName: p.emergencyContact?.name || '', emergencyContactPhone: p.emergencyContact?.phone || '', emergencyContactRelation: p.emergencyContact?.relation || '' });
    setModal(true);
  };
  const closeModal = () => { setModal(false); setEditPatient(null); setForm(EMPTY_FORM); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()) : [], emergencyContact: { name: form.emergencyContactName, phone: form.emergencyContactPhone, relation: form.emergencyContactRelation } };
      if (editPatient) { await api.put(`/patients/${editPatient._id}`, payload); toast.success('Patient updated'); }
      else { await api.post('/patients', payload); toast.success('Patient added'); }
      closeModal(); fetchPatients();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/patients/${deleteDialog._id}`);
      toast.success('Patient deleted');
      setDeleteDialog(null);
      fetchPatients();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500 text-sm">{total} patients registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Patient</button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search by name, ID, phone..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        {loading ? <LoadingSpinner /> : patients.length === 0 ? <EmptyState icon="👤" title="No patients found" description="Add your first patient to get started" action={<button onClick={openAdd} className="btn-primary text-sm"><PlusIcon className="w-4 h-4" />Add Patient</button>} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Patient', 'ID', 'Phone', 'Gender', 'Blood Group', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">{p.name.charAt(0)}</div>
                        <div><p className="font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-400">{p.email}</p></div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{p.patientId}</span></td>
                    <td className="table-cell">{p.phone}</td>
                    <td className="table-cell">{p.gender}</td>
                    <td className="table-cell">{p.bloodGroup || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/admin/patients/${p._id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="View"><EyeIcon className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteDialog(p)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete"><TrashIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={closeModal} title={editPatient ? 'Edit Patient' : 'Add New Patient'} size="lg">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Full Name *</label><input required className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={set('email')} /></div>
          <div><label className="label">Phone *</label><input required className="input" value={form.phone} onChange={set('phone')} /></div>
          <div><label className="label">Date of Birth</label><input type="date" className="input" value={form.dob} onChange={set('dob')} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" value={form.gender} onChange={set('gender')}>
              {['Male','Female','Other'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Blood Group</label>
            <select className="input" value={form.bloodGroup} onChange={set('bloodGroup')}>
              <option value="">Select</option>
              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><label className="label">Address</label><textarea className="input" rows={2} value={form.address} onChange={set('address')} /></div>
          <div><label className="label">Allergies (comma separated)</label><input className="input" value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin, Latex" /></div>
          <div><label className="label">Current Medications</label><input className="input" value={form.currentMedications} onChange={set('currentMedications')} /></div>
          <div className="md:col-span-2"><label className="label">Medical History</label><textarea className="input" rows={2} value={form.medicalHistory} onChange={set('medicalHistory')} /></div>
          <div className="md:col-span-2"><p className="text-sm font-semibold text-slate-600 mt-2 mb-1">Emergency Contact</p></div>
          <div><label className="label">Contact Name</label><input className="input" value={form.emergencyContactName} onChange={set('emergencyContactName')} /></div>
          <div><label className="label">Contact Phone</label><input className="input" value={form.emergencyContactPhone} onChange={set('emergencyContactPhone')} /></div>
          <div><label className="label">Relation</label><input className="input" value={form.emergencyContactRelation} onChange={set('emergencyContactRelation')} /></div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editPatient ? 'Update Patient' : 'Add Patient'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete}
        title="Delete Patient" message={`Are you sure you want to delete ${deleteDialog?.name}? This cannot be undone.`}
        confirmText="Delete Patient" loading={deleting} />
    </div>
  );
}
