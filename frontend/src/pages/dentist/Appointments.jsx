import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

const STATUSES = ['Pending','Confirmed','Completed','Cancelled'];

export default function DentistAppointments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/appointments', { params: { status: filterStatus, page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [filterStatus, page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const updateStatus = async (id, status) => {
    try { await api.put(`/appointments/${id}`, { status }); toast.success('Status updated'); fetchItems(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">My Appointments</h1><p className="text-slate-500 text-sm">{total} total</p></div>
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b">
          <select className="input w-auto" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="📅" title="No appointments" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Patient','Date','Time','Treatment','Status','Action'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="table-cell"><p className="font-medium">{a.patient?.name}</p><p className="text-xs text-slate-400">{a.patient?.patientId}</p></td>
                    <td className="table-cell">{format(new Date(a.date),'dd MMM yyyy')}</td>
                    <td className="table-cell">{a.timeSlot}</td>
                    <td className="table-cell">{a.treatmentType||'—'}</td>
                    <td className="table-cell"><StatusBadge status={a.status} /></td>
                    <td className="table-cell">
                      {a.status === 'Pending' && <button onClick={() => updateStatus(a._id, 'Confirmed')} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Confirm</button>}
                      {a.status === 'Confirmed' && <button onClick={() => updateStatus(a._id, 'Completed')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">Complete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
