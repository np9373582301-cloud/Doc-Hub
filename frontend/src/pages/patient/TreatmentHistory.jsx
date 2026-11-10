import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

export default function TreatmentHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/treatments', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">Treatment History</h1><p className="text-slate-500 text-sm">{total} treatments</p></div>
      <div className="card !p-0 overflow-hidden">
        {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="🩺" title="No treatment or consultation records yet" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Type','Diagnosis','Doctor','Area / Tooth','Date','Cost','Status'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {items.map(i => (
                  <tr key={i._id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">{i.treatmentType}</td>
                    <td className="table-cell">{i.diagnosis}</td>
                    <td className="table-cell">{i.dentist?.name?.startsWith('Dr.') ? i.dentist?.name : `Dr. ${i.dentist?.name}`}</td>
                    <td className="table-cell">{i.toothNumber||'—'}</td>
                    <td className="table-cell">{format(new Date(i.treatmentDate),'dd MMM yyyy')}</td>
                    <td className="table-cell font-semibold text-green-700">₹{i.cost?.toLocaleString('en-IN')}</td>
                    <td className="table-cell"><StatusBadge status={i.status} /></td>
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
