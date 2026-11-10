import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  CreditCardIcon,
  PrinterIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function MyBills() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/invoices', { params: { page, limit: 10 } });
      setInvoices(data.data || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      toast.error('Failed to load your bills');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const totalDue = invoices
    .filter((inv) => inv.paymentStatus !== 'Paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0);

  // Handle Online Payment with Razorpay
  const handlePayNow = async (inv) => {
    setPayingId(inv._id);
    try {
      // 1. Create order on backend
      const { data } = await api.post(`/invoices/${inv._id}/create-razorpay-order`);

      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      // 2. Open Razorpay Checkout modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || 'INR',
        name: 'DocHub Medical & Clinic',
        description: `Payment for Invoice #${data.invoice?.invoiceId || inv.invoiceId}`,
        order_id: data.orderId,
        prefill: {
          name: data.invoice?.patientName || user?.name || '',
          email: data.invoice?.patientEmail || user?.email || '',
          contact: data.invoice?.patientPhone || user?.phone || '',
        },
        theme: {
          color: '#0d9488', // Teal brand color
        },
        handler: async function (response) {
          try {
            await api.post(`/invoices/${inv._id}/verify-razorpay-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success(`Payment successful! Ref: ${response.razorpay_payment_id}`);
            fetch();
          } catch (verifyErr) {
            toast.error(verifyErr.response?.data?.message || 'Payment verification failed.');
          }
        },
        modal: {
          ondismiss: function () {
            toast('Payment window closed', { icon: 'ℹ️' });
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Transaction declined'}`);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment order initiation error:', err);
      toast.error(err.response?.data?.message || 'Unable to start online payment.');
    } finally {
      setPayingId(null);
    }
  };

  // Print Clean Medical Bill / Receipt
  const handlePrint = (inv) => {
    const win = window.open('', '_blank');
    if (!win) {
      toast.error('Popup blocked by browser. Please allow popups.');
      return;
    }

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${inv.invoiceId} – DocHub</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; max-width: 620px; margin: 0 auto; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 800; color: #0f766e; }
          .subtitle { font-size: 11px; color: #64748b; margin-top: 2px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 13px; margin-bottom: 20px; }
          .meta-box p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
          th { background: #f8fafc; font-weight: 600; color: #475569; }
          .total-row { font-weight: 800; font-size: 15px; background: #f0fdf4; color: #166534; }
          .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
          .badge-paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          .footer { margin-top: 28px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🩺 DocHub Clinic</div>
            <div class="subtitle">Doctor & Multi-Speciality Clinic Management System</div>
            <div style="font-size:11px;color:#64748b;margin-top:4px;">102 Healthcare Plaza, Central Avenue, Mumbai</div>
          </div>
          <div style="text-align:right;">
            <span class="badge ${inv.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">${inv.paymentStatus}</span>
            <div style="font-size:12px;color:#64748b;margin-top:6px;"><strong>Date:</strong> ${format(new Date(inv.createdAt), 'dd MMM yyyy')}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-box">
            <p><strong>Invoice Number:</strong> ${inv.invoiceId}</p>
            <p><strong>Patient Name:</strong> ${inv.patient?.name || user?.name}</p>
            <p><strong>Patient ID:</strong> ${inv.patient?.patientId || '—'}</p>
          </div>
          <div class="meta-box" style="text-align:right;">
            <p><strong>Payment Mode:</strong> ${inv.paymentMethod || 'Online'}</p>
            ${inv.razorpayPaymentId ? `<p><strong>Razorpay Txn:</strong> ${inv.razorpayPaymentId}</p>` : ''}
            ${inv.paidDate ? `<p><strong>Paid Date:</strong> ${format(new Date(inv.paidDate), 'dd MMM yyyy')}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:right;width:120px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${
              (inv.items || []).length > 0
                ? inv.items.map((it) => `<tr><td>${it.description}</td><td style="text-align:right;">₹${Number(it.amount).toLocaleString('en-IN')}</td></tr>`).join('')
                : `<tr><td>${inv.treatment?.treatmentType || 'Medical Consultation'}</td><td style="text-align:right;">₹${Number(inv.total).toLocaleString('en-IN')}</td></tr>`
            }
            <tr>
              <td>Subtotal</td>
              <td style="text-align:right;">₹${Number(inv.subtotal || inv.total).toLocaleString('en-IN')}</td>
            </tr>
            ${inv.discount ? `<tr><td>Discount</td><td style="text-align:right;">- ₹${inv.discount}</td></tr>` : ''}
            ${inv.tax ? `<tr><td>Taxes & Fees</td><td style="text-align:right;">+ ₹${inv.tax}</td></tr>` : ''}
            <tr class="total-row">
              <td>Total Paid / Due</td>
              <td style="text-align:right;">₹${Number(inv.total).toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for choosing DocHub Multi-Speciality Clinic!</p>
          <p>Need support? Contact us at care@dochub.com or call +91 98765 43210</p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>🧾</span>
            <span>My Bills & Payments</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View your consultation invoices and pay securely online via Razorpay
          </p>
        </div>
      </div>

      {/* Due Amount Banner */}
      {totalDue > 0 ? (
        <div className="card bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-orange-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💰</span>
              <p className="text-orange-900 font-bold text-base">
                Total Outstanding Due:{' '}
                <span className="text-2xl font-black text-orange-600">
                  ₹{totalDue.toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            <p className="text-xs text-orange-700 mt-1 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Instant secure checkout with <strong>UPI (GPay, PhonePe, Paytm)</strong>, Credit/Debit Cards, or Netbanking.
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white text-slate-700 border border-orange-200 flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Razorpay Gateway Active
            </span>
          </div>
        </div>
      ) : (
        <div className="card bg-emerald-50/60 border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>All your medical invoices are up to date. You have no pending dues!</span>
        </div>
      )}

      {/* Invoices Table Card */}
      <div className="card !p-0 overflow-hidden shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="No bills yet"
            description="Your billing history will appear here following consultations and treatments"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200/80">
                <tr>
                  {['Invoice ID', 'Date', 'Treatment / Service', 'Subtotal', 'Discount', 'Total Amount', 'Status', 'Actions'].map(
                    (h) => (
                      <th key={h} className="table-header">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => {
                  const isPaid = inv.paymentStatus === 'Paid';
                  const isProcessing = payingId === inv._id;

                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="table-cell font-mono text-xs font-semibold text-slate-800">
                        {inv.invoiceId}
                      </td>
                      <td className="table-cell text-slate-600">
                        {format(new Date(inv.createdAt), 'dd MMM yyyy')}
                      </td>
                      <td className="table-cell">
                        <p className="font-medium text-slate-800">
                          {inv.treatment?.treatmentType || inv.items?.[0]?.description || 'Medical Consultation'}
                        </p>
                        {inv.paymentMethod && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Paid via: {inv.paymentMethod}
                            {inv.razorpayPaymentId && ` (${inv.razorpayPaymentId.slice(0, 12)}...)`}
                          </p>
                        )}
                      </td>
                      <td className="table-cell text-slate-600">
                        ₹{inv.subtotal?.toLocaleString('en-IN')}
                      </td>
                      <td className="table-cell text-slate-500">
                        {inv.discount ? `-₹${inv.discount}` : '—'}
                      </td>
                      <td className="table-cell font-bold text-slate-900 text-sm">
                        ₹{inv.total?.toLocaleString('en-IN')}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={inv.paymentStatus} />
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          {!isPaid ? (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handlePayNow(inv)}
                              className="btn-primary text-xs py-1.5 px-3 gap-1.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white font-bold shadow-xs whitespace-nowrap"
                            >
                              <CreditCardIcon className="w-3.5 h-3.5" />
                              <span>{isProcessing ? 'Processing...' : '💳 Pay Online'}</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                              <CheckCircleIcon className="w-3.5 h-3.5" />
                              <span>Paid</span>
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handlePrint(inv)}
                            title="Print invoice receipt"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          >
                            <PrinterIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination
              page={page}
              pages={pages}
              total={total}
              limit={10}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
