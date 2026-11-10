import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Link } from 'react-router-dom';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function MyAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/appointments', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCancel = async () => {
    setCancelling(true);
    try { await api.put(`/appointments/${cancelDialog._id}`, { status: 'Cancelled', cancellationReason: 'Cancelled by patient' }); toast.success('Appointment cancelled'); setCancelDialog(null); fetch(); }
    catch { toast.error('Failed'); } finally { setCancelling(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold text-slate-800">My Appointments</h1><p className="text-slate-500 text-sm">{total} total</p></div>
        <Link to="/patient/book-appointment" className="btn-primary"><CalendarIcon className="w-4 h-4" /> Book New</Link>
      </div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="📅" title="No appointments" description="Book your first appointment" action={<Link to="/patient/book-appointment" className="btn-primary"><CalendarIcon className="w-4 h-4" />Book Appointment</Link>} /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['ID','Doctor','Date','Time','Treatment / Service','Status','Action'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="table-cell font-mono text-xs">{a.appointmentId}</td>
                    <td className="table-cell"><p className="font-medium">{a.dentist?.name}</p><p className="text-xs text-slate-400">{a.dentist?.specialization}</p></td>
                    <td className="table-cell">{format(new Date(a.date),'dd MMM yyyy')}</td>
                    <td className="table-cell">{a.timeSlot}</td>
                    <td className="table-cell">{a.treatmentType||'—'}</td>
                    <td className="table-cell"><StatusBadge status={a.status} /></td>
                    <td className="table-cell">
                      {['Pending','Confirmed'].includes(a.status) && (
                        <button onClick={() => setCancelDialog(a)} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">Cancel</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>
      <ConfirmDialog isOpen={!!cancelDialog} onClose={() => setCancelDialog(null)} onConfirm={handleCancel}
        title="Cancel Appointment" message={`Cancel appointment ${cancelDialog?.appointmentId}?`} confirmText="Yes, Cancel" loading={cancelling} />
    </div>
  );
}
