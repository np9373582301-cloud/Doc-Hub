import React, { useState, useEffect, useCallback } from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';

export default function MyPrescriptions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); const [pages, setPages] = useState(1); const [total, setTotal] = useState(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try { const { data } = await api.get('/prescriptions', { params: { page, limit: 10 } }); setItems(data.data); setPages(data.pages); setTotal(data.total); }
    catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  const handlePrint = (rx) => {
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Prescription ${rx.prescriptionId}</title><style>body{font-family:Arial;padding:24px;} h2{color:#2563EB;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #ddd;padding:8px;} th{background:#f1f5f9;}</style></head><body>
      <h2>🩺 DocHub – Prescription</h2><p><strong>ID:</strong> ${rx.prescriptionId} | <strong>Date:</strong> ${format(new Date(rx.date),'dd MMM yyyy')}</p>
      <p><strong>Doctor:</strong> ${rx.dentist?.name}</p>${rx.diagnosis?`<p><strong>Diagnosis:</strong> ${rx.diagnosis}</p>`:''}
      <table><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th>Instructions</th></tr>${rx.medicines.map(m=>`<tr><td>${m.name}</td><td>${m.dosage||''}</td><td>${m.frequency||''}</td><td>${m.duration||''}</td><td>${m.instructions||''}</td></tr>`).join('')}</table>
    </body></html>`);
    win.document.close(); win.print();
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">My Prescriptions</h1><p className="text-slate-500 text-sm">{total} prescriptions</p></div>
      {loading ? <LoadingSpinner /> : items.length===0 ? <EmptyState icon="📋" title="No prescriptions" description="Your prescriptions will appear here after treatment" /> : (
        <div className="space-y-4">
          {items.map(rx => (
            <div key={rx._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-semibold text-slate-800">{rx.prescriptionId}</p><p className="text-sm text-slate-500">{rx.dentist?.name?.startsWith('Dr.') ? rx.dentist?.name : `Dr. ${rx.dentist?.name}`} · {format(new Date(rx.date),'dd MMM yyyy')}</p></div>
                <button onClick={() => handlePrint(rx)} className="btn-secondary text-sm"><PrinterIcon className="w-4 h-4" /> Print</button>
              </div>
              {rx.diagnosis && <p className="text-sm text-slate-600 mb-3 bg-gray-50 p-2 rounded"><strong>Diagnosis:</strong> {rx.diagnosis}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rx.medicines.map((m,i) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{[m.dosage,m.frequency,m.duration].filter(Boolean).join(' · ')}</p>
                    {m.instructions && <p className="text-xs text-slate-400 mt-1 italic">{m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Pagination page={page} pages={pages} total={total} limit={10} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
