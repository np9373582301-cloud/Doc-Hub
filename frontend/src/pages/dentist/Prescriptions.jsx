import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, PrinterIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const EMPTY = { patient: '', diagnosis: '', medicines: [{ ...EMPTY_MED }], notes: '' };

export default function DentistPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentistId, setDentistId] = useState('');
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/dentists/me').then(r => setDentistId(r.data.data._id)).catch(() => { });
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data));
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/prescriptions', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const addMed = () => setForm(p => ({ ...p, medicines: [...p.medicines, { ...EMPTY_MED }] }));
  const removeMed = i => setForm(p => ({ ...p, medicines: p.medicines.filter((_, idx) => idx !== i) }));
  const setMed = (i, k, v) => setForm(p => ({ ...p, medicines: p.medicines.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/prescriptions', { ...form, dentist: dentistId }); toast.success('Prescription saved'); setModal(false); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handlePrint = (rx) => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Prescription ${rx.prescriptionId}</title><style>body{font-family:Arial;padding:24px;} h2{color:#2563EB;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f1f5f9;}</style></head><body>
      <h2>🩺 DocHub – Prescription</h2><p><strong>ID:</strong> ${rx.prescriptionId} | <strong>Date:</strong> ${format(new Date(rx.date), 'dd MMM yyyy')}</p>
      <p><strong>Patient:</strong> ${rx.patient?.name} | <strong>Doctor:</strong> ${rx.dentist?.name}</p>
      ${rx.diagnosis ? `<p><strong>Diagnosis:</strong> ${rx.diagnosis}</p>` : ''}
      <table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>${rx.medicines.map(m => `<tr><td>${m.name}</td><td>${m.dosage || ''}</td><td>${m.frequency || ''}</td><td>${m.duration || ''}</td><td>${m.instructions || ''}</td></tr>`).join('')}</table>
    </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1><p className="text-slate-500 text-sm">{total} records</p></div>
        <button onClick={() => { setForm({ ...EMPTY, medicines: [{ ...EMPTY_MED }] }); setModal(true); }} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Prescription</button>
      </div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon="📋" title="No prescriptions" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['ID', 'Patient', 'Diagnosis', 'Medicines', 'Date', ''].map(h => <th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => (
                  <tr key={i._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{i.prescriptionId}</td>
                    <td className="table-cell font-medium">{i.patient?.name}</td>
                    <td className="table-cell max-w-40 truncate">{i.diagnosis || '—'}</td>
                    <td className="table-cell">{i.medicines?.length} med(s)</td>
                    <td className="table-cell">{format(new Date(i.date), 'dd MMM yy')}</td>
                    <td className="table-cell"><button onClick={() => handlePrint(i)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><PrinterIcon className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>
      <Modal isOpen={modal} onClose={() => setModal(false)} title="New Prescription" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="label">Patient *</label><select required className="input" value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))}><option value="">Select...</option>{patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
          <div><label className="label">Diagnosis</label><input className="input" value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} /></div>
          <div>
            <div className="flex justify-between mb-2"><label className="label !mb-0">Medicines</label><button type="button" onClick={addMed} className="text-primary-600 text-sm">+ Add</button></div>
            {form.medicines.map((m, i) => (
              <div key={i} className="border rounded-lg p-3 mb-2 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2"><input required placeholder="Medicine name" className="input text-sm" value={m.name} onChange={e => setMed(i, 'name', e.target.value)} /></div>
                  <input placeholder="Dosage" className="input text-sm" value={m.dosage} onChange={e => setMed(i, 'dosage', e.target.value)} />
                  <input placeholder="Frequency" className="input text-sm" value={m.frequency} onChange={e => setMed(i, 'frequency', e.target.value)} />
                  <input placeholder="Duration" className="input text-sm" value={m.duration} onChange={e => setMed(i, 'duration', e.target.value)} />
                  <input placeholder="Instructions" className="input text-sm" value={m.instructions} onChange={e => setMed(i, 'instructions', e.target.value)} />
                </div>
                {form.medicines.length > 1 && <button type="button" onClick={() => removeMed(i)} className="text-red-500 text-xs mt-1">Remove</button>}
              </div>
            ))}
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
