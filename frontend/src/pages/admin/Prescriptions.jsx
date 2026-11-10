import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const EMPTY_MED = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };
const EMPTY = { patient: '', dentist: '', diagnosis: '', medicines: [{ ...EMPTY_MED }], notes: '' };

export default function Prescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/prescriptions', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => {
    api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data));
    api.get('/dentists', { params: { limit: 100 } }).then(r => setDentists(r.data.data));
  }, []);

  const openAdd = () => { setForm({ ...EMPTY, medicines: [{ ...EMPTY_MED }] }); setModal(true); };
  const close = () => { setModal(false); };

  const addMed = () => setForm(p => ({ ...p, medicines: [...p.medicines, { ...EMPTY_MED }] }));
  const removeMed = (i) => setForm(p => ({ ...p, medicines: p.medicines.filter((_, idx) => idx !== i) }));
  const setMed = (i, k, v) => setForm(p => ({ ...p, medicines: p.medicines.map((m, idx) => idx === i ? { ...m, [k]: v } : m) }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.post('/prescriptions', form); toast.success('Prescription saved'); close(); fetchItems(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await api.delete(`/prescriptions/${deleteDialog._id}`); toast.success('Deleted'); setDeleteDialog(null); fetchItems(); }
    catch { toast.error('Failed'); } finally { setDeleting(false); }
  };

  const handlePrint = (rx) => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Prescription ${rx.prescriptionId}</title><style>body{font-family:Arial;padding:20px;} h2{color:#2563EB;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f1f5f9;}</style></head><body>
      <h2>🩺 DocHub – Prescription</h2>
      <p><strong>Prescription ID:</strong> ${rx.prescriptionId}</p>
      <p><strong>Date:</strong> ${format(new Date(rx.date), 'dd MMM yyyy')}</p>
      <p><strong>Patient:</strong> ${rx.patient?.name} (${rx.patient?.patientId})</p>
      <p><strong>Doctor:</strong> ${rx.dentist?.name}</p>
      <p><strong>Diagnosis:</strong> ${rx.diagnosis || '—'}</p>
      <h3>Medicines</h3>
      <table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>
      ${rx.medicines.map(m => `<tr><td>${m.name}</td><td>${m.dosage}</td><td>${m.frequency}</td><td>${m.duration}</td><td>${m.instructions || ''}</td></tr>`).join('')}
      </table>
      ${rx.notes ? `<p><strong>Notes:</strong> ${rx.notes}</p>` : ''}
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1><p className="text-slate-500 text-sm">{total} records</p></div>
        <button onClick={openAdd} className="btn-primary"><PlusIcon className="w-4 h-4" /> New Prescription</button>
      </div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState icon="📋" title="No prescriptions" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['ID', 'Patient', 'Doctor', 'Diagnosis', 'Medicines', 'Date', 'Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => (
                  <tr key={i._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{i.prescriptionId}</td>
                    <td className="table-cell font-medium">{i.patient?.name}</td>
                    <td className="table-cell">{i.dentist?.name}</td>
                    <td className="table-cell max-w-40 truncate">{i.diagnosis || '—'}</td>
                    <td className="table-cell">{i.medicines?.length} medicine(s)</td>
                    <td className="table-cell">{format(new Date(i.date), 'dd MMM yy')}</td>
                    <td className="table-cell"><div className="flex gap-1">
                      <button onClick={() => setViewModal(i)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">View</button>
                      <button onClick={() => handlePrint(i)} className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg"><PrinterIcon className="w-4 h-4" /></button>
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

      {/* Create Prescription Modal */}
      <Modal isOpen={modal} onClose={close} title="New Prescription" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Patient *</label><select required className="input" value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))}><option value="">Select...</option>{patients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}</select></div>
            <div><label className="label">Doctor *</label><select required className="input" value={form.dentist} onChange={e => setForm(p => ({ ...p, dentist: e.target.value }))}><option value="">Select...</option>{dentists.map(d => <option key={d._id} value={d._id}>{d.name} — {d.specialization}</option>)}</select></div>
          </div>
          <div><label className="label">Diagnosis</label><input className="input" value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} /></div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label !mb-0">Medicines</label><button type="button" onClick={addMed} className="text-primary-600 text-sm font-medium hover:underline">+ Add Medicine</button></div>
            {form.medicines.map((m, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 mb-2 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="md:col-span-2"><input placeholder="Medicine name *" required className="input text-sm" value={m.name} onChange={e => setMed(i, 'name', e.target.value)} /></div>
                  <div><input placeholder="Dosage" className="input text-sm" value={m.dosage} onChange={e => setMed(i, 'dosage', e.target.value)} /></div>
                  <div><input placeholder="Frequency" className="input text-sm" value={m.frequency} onChange={e => setMed(i, 'frequency', e.target.value)} /></div>
                  <div><input placeholder="Duration" className="input text-sm" value={m.duration} onChange={e => setMed(i, 'duration', e.target.value)} /></div>
                  <div><input placeholder="Instructions" className="input text-sm" value={m.instructions} onChange={e => setMed(i, 'instructions', e.target.value)} /></div>
                </div>
                {form.medicines.length > 1 && <button type="button" onClick={() => removeMed(i)} className="text-red-500 text-xs mt-2 hover:underline">Remove</button>}
              </div>
            ))}
          </div>
          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={close} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Prescription'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewModal && (
        <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`Prescription ${viewModal.prescriptionId}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
              <div><p className="text-xs text-slate-500">Patient</p><p className="font-medium">{viewModal.patient?.name}</p></div>
              <div><p className="text-xs text-slate-500">Doctor</p><p className="font-medium">{viewModal.dentist?.name}</p></div>
              <div><p className="text-xs text-slate-500">Date</p><p className="font-medium">{format(new Date(viewModal.date), 'dd MMM yyyy')}</p></div>
              <div><p className="text-xs text-slate-500">Diagnosis</p><p className="font-medium">{viewModal.diagnosis || '—'}</p></div>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-2">Medicines</p>
              {viewModal.medicines.map((m, i) => (
                <div key={i} className="border rounded-lg p-3 mb-2">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.dosage} · {m.frequency} · {m.duration}</p>
                  {m.instructions && <p className="text-xs text-slate-400 mt-1">{m.instructions}</p>}
                </div>
              ))}
            </div>
            {viewModal.notes && <p className="text-sm text-slate-600"><strong>Notes:</strong> {viewModal.notes}</p>}
            <div className="flex justify-end">
              <button onClick={() => handlePrint(viewModal)} className="btn-primary"><PrinterIcon className="w-4 h-4" /> Print</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete} title="Delete Prescription" message="Delete this prescription?" loading={deleting} />
    </div>
  );
}
