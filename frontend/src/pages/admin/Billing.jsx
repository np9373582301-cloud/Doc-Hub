import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon, TrashIcon, PrinterIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const METHODS = ['Cash','Card','UPI','Net Banking','Insurance','Razorpay'];
const STATUSES = ['Pending','Paid','Partially Paid'];
const EMPTY = { patient:'', items:[{ description:'', amount:'' }], discount:'0', tax:'0', paymentMethod:'Cash', paymentStatus:'Pending', notes:'' };

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(false);
  const [payModal, setPayModal] = useState(null);
  const [payMethod, setPayMethod] = useState('Cash');
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices', { params: { paymentStatus: filterStatus, page, limit: 10 } });
      setInvoices(data.data); setPages(data.pages); setTotal(data.total);
    } catch {} finally { setLoading(false); }
  }, [filterStatus, page]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { api.get('/patients', { params: { limit: 100 } }).then(r => setPatients(r.data.data)); }, []);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { description: '', amount: '' }] }));
  const removeItem = i => setForm(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));
  const setItem = (i, k, v) => setForm(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, [k]: v } : it) }));

  const subtotal = form.items.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);
  const totalAmount = subtotal - (parseFloat(form.discount) || 0) + (parseFloat(form.tax) || 0);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await api.post('/invoices', { ...form, subtotal, total: totalAmount });
      toast.success('Invoice created');
      setModal(false);
      setForm(EMPTY);
      fetchInvoices();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleMarkPaid = async () => {
    try {
      await api.put(`/invoices/${payModal._id}/pay`, { paymentMethod: payMethod });
      toast.success('Marked as paid');
      setPayModal(null);
      fetchInvoices();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/invoices/${deleteDialog._id}`);
      toast.success('Deleted');
      setDeleteDialog(null);
      fetchInvoices();
    } catch { toast.error('Failed'); }
    finally { setDeleting(false); }
  };

  const handlePrint = (inv) => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${inv.invoiceId}</title>
      <style>body{font-family:Arial;padding:24px;max-width:600px;margin:0 auto;} h2{color:#2563EB;} .header{display:flex;justify-content:space-between;margin-bottom:16px;} table{width:100%;border-collapse:collapse;margin-top:12px;} th,td{border:1px solid #ddd;padding:10px;text-align:left;} th{background:#f1f5f9;font-size:13px;} .total-row{font-weight:bold;font-size:16px;} .badge{padding:4px 10px;border-radius:20px;font-size:12px;background:${inv.paymentStatus==='Paid'?'#dcfce7':'#fef3c7'};color:${inv.paymentStatus==='Paid'?'#166534':'#92400e'};}</style>
      </head><body>
      <h2>🩺 DocHub – Invoice</h2>
      <div class="header">
        <div><p><strong>Invoice:</strong> ${inv.invoiceId}</p><p><strong>Patient:</strong> ${inv.patient?.name} (${inv.patient?.patientId})</p><p><strong>Phone:</strong> ${inv.patient?.phone||'—'}</p></div>
        <div><p><strong>Date:</strong> ${format(new Date(inv.createdAt),'dd MMM yyyy')}</p><p><strong>Status:</strong> <span class="badge">${inv.paymentStatus}</span></p>${inv.paymentMethod?`<p><strong>Payment:</strong> ${inv.paymentMethod}${inv.razorpayPaymentId ? ` <span style="font-size:11px;color:#64748b;">(${inv.razorpayPaymentId})</span>` : ''}</p>`:''}</div>
      </div>
      <table><tr><th>Description</th><th>Amount (₹)</th></tr>
      ${inv.items.map(it=>`<tr><td>${it.description}</td><td>₹${Number(it.amount).toLocaleString('en-IN')}</td></tr>`).join('')}
      <tr><td>Subtotal</td><td>₹${inv.subtotal?.toLocaleString('en-IN')}</td></tr>
      ${inv.discount?`<tr><td>Discount</td><td>- ₹${inv.discount}</td></tr>`:''}
      ${inv.tax?`<tr><td>Tax</td><td>+ ₹${inv.tax}</td></tr>`:''}
      <tr class="total-row"><td>Total</td><td>₹${inv.total?.toLocaleString('en-IN')}</td></tr>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8;text-align:center;">Thank you for choosing DocHub!</p>
      </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Billing & Invoices</h1>
          <p className="text-slate-500 text-sm">{total} invoices</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary">
          <PlusIcon className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      {/* Filter */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          <select className="input w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <span className="text-sm text-slate-500">{total} results</span>
        </div>

        {loading ? <LoadingSpinner /> : invoices.length === 0 ? (
          <EmptyState icon="🧾" title="No invoices found" description="Create your first invoice" action={<button onClick={() => { setForm(EMPTY); setModal(true); }} className="btn-primary text-sm"><PlusIcon className="w-4 h-4" />Create Invoice</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>{['Invoice ID','Patient','Subtotal','Discount','Total','Method','Status','Actions'].map(h => <th key={h} className="table-header">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{inv.invoiceId}</span></td>
                    <td className="table-cell">
                      <p className="font-medium text-slate-800">{inv.patient?.name}</p>
                      <p className="text-xs text-slate-400">{inv.patient?.patientId}</p>
                    </td>
                    <td className="table-cell">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                    <td className="table-cell">{inv.discount ? `₹${inv.discount}` : '—'}</td>
                    <td className="table-cell font-semibold text-slate-800">₹{inv.total?.toLocaleString('en-IN')}</td>
                    <td className="table-cell">{inv.paymentMethod || '—'}</td>
                    <td className="table-cell"><StatusBadge status={inv.paymentStatus} /></td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {inv.paymentStatus !== 'Paid' && (
                          <button onClick={() => { setPayModal(inv); setPayMethod('Cash'); }}
                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Mark as Paid">
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handlePrint(inv)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Print">
                          <PrinterIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteDialog(inv)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                          <TrashIcon className="w-4 h-4" />
                        </button>
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

      {/* Create Invoice Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create Invoice" size="lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Patient *</label>
            <select required className="input" value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))}>
              <option value="">Select patient...</option>
              {patients.map(p => <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>)}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Invoice Items</label>
              <button type="button" onClick={addItem} className="text-primary-600 text-sm font-medium hover:underline">+ Add Item</button>
            </div>
            {form.items.map((it, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <input required placeholder="Description *" className="input flex-1" value={it.description} onChange={e => setItem(i, 'description', e.target.value)} />
                <input required type="number" placeholder="Amount" className="input w-32" min="0" value={it.amount} onChange={e => setItem(i, 'amount', e.target.value)} />
                {form.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm font-medium">✕</button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div><label className="label">Discount (₹)</label><input type="number" min="0" className="input" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} /></div>
            <div><label className="label">Tax (₹)</label><input type="number" min="0" className="input" value={form.tax} onChange={e => setForm(p => ({ ...p, tax: e.target.value }))} /></div>
            <div className="flex items-end">
              <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 w-full">
                <p className="text-xs text-primary-600 font-medium">Total Amount</p>
                <p className="font-bold text-primary-700 text-lg">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Payment Status</label>
              <select className="input" value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div><label className="label">Notes</label><textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Invoice'}</button>
          </div>
        </form>
      </Modal>

      {/* Mark as Paid Modal */}
      {payModal && (
        <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Mark as Paid" size="sm">
          <div className="space-y-4">
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-slate-600 font-medium">{payModal.patient?.name}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">₹{payModal.total?.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-400 mt-1">{payModal.invoiceId}</p>
            </div>
            <div>
              <label className="label">Payment Method</label>
              <select className="input" value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                {METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPayModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleMarkPaid} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> Confirm Payment
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteDialog} onClose={() => setDeleteDialog(null)} onConfirm={handleDelete}
        title="Delete Invoice" message={`Are you sure you want to delete invoice ${deleteDialog?.invoiceId}?`}
        confirmText="Delete" loading={deleting} />
    </div>
  );
}
