import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

export default function DentistPatients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/patients', { params: { search, page, limit: 10 } }); setPatients(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">My Patients</h1><p className="text-slate-500 text-sm">{total} patients</p></div>
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b"><div className="relative max-w-sm"><MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-9" placeholder="Search patients..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></div></div>
        {loading ? <LoadingSpinner /> : patients.length===0 ? <EmptyState icon="👤" title="No patients" /> : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>{['Patient','ID','Phone','Gender','Blood Group','Actions'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {patients.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="table-cell"><div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm">{p.name.charAt(0)}</div>
                      <div><p className="font-medium">{p.name}</p><p className="text-xs text-slate-400">{p.email}</p></div>
                    </div></td>
                    <td className="table-cell font-mono text-xs">{p.patientId}</td>
                    <td className="table-cell">{p.phone}</td>
                    <td className="table-cell">{p.gender}</td>
                    <td className="table-cell">{p.bloodGroup||'—'}</td>
                    <td className="table-cell"><button onClick={() => navigate(`/dentist/patients/${p._id}`)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><EyeIcon className="w-4 h-4" /></button></td>
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
