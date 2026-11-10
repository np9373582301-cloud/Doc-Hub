import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
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
const EMPTY = { patient:'', diagnosis:'', treatmentType:'', toothNumber:'', treatmentDate:new Date().toISOString().split('T')[0], description:'', cost:'', status:'Completed', notes:'' };

export default function DentistTreatments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentistId, setDentistId] = useState('');
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/dentists/me').then(r => setDentistId(r.data.data._id)).catch(() => {});
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/treatments', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/treatments', { ...form, dentist: dentistId }); toast.success('Treatment added'); setModal(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Treatments</h1><p className="text-slate-500 text-sm">{total} records</p></div>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" /> Add Treatment</button>
      </div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="🩺" title="No treatments recorded" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Patient','Type','Diagnosis','Area / Tooth','Date','Cost','Status'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => (
                  <tr key={i._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{i.patient?.name}</td>
                    <td className="table-cell">{i.treatmentType}</td>
                    <td className="table-cell max-w-32 truncate">{i.diagnosis}</td>
                    <td className="table-cell">{i.toothNumber||'—'}</td>
                    <td className="table-cell">{format(new Date(i.treatmentDate),'dd MMM yy')}</td>
                    <td className="table-cell font-semibold">₹{i.cost?.toLocaleString('en-IN')}</td>
                    <td className="table-cell"><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Add Treatment">
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label">Patient *</label><select required className="input" value={form.patient} onChange={set('patient')}><option value="">Select...</option>{patients.map(p=><option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
          <div><label className="label">Treatment Type *</label><select required className="input" value={form.treatmentType} onChange={set('treatmentType')}><option value="">Select...</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="md:col-span-2"><label className="label">Diagnosis *</label><input required className="input" value={form.diagnosis} onChange={set('diagnosis')} /></div>
          <div><label className="label">Area / Tooth / Notes</label><input className="input" placeholder="e.g. Chest, Left Knee, Tooth 14" value={form.toothNumber} onChange={set('toothNumber')} /></div>
          <div><label className="label">Date</label><input type="date" className="input" value={form.treatmentDate} onChange={set('treatmentDate')} /></div>
          <div><label className="label">Cost (₹) *</label><input required type="number" min="0" className="input" value={form.cost} onChange={set('cost')} /></div>
          <div><label className="label">Status</label><select className="input" value={form.status} onChange={set('status')}>{['Planned','In Progress','Completed'].map(s=><option key={s}>{s}</option>)}</select></div>
          <div className="md:col-span-2"><label className="label">Description</label><textarea className="input" rows={2} value={form.description} onChange={set('description')} /></div>
          <div className="md:col-span-2 flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Treatment'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
