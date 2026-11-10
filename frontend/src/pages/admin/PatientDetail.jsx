import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { format } from 'date-fns';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, aRes, tRes, rxRes, invRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get('/appointments', { params: { patient: id, limit: 20 } }),
          api.get('/treatments', { params: { patient: id, limit: 20 } }),
          api.get('/prescriptions', { params: { patient: id, limit: 20 } }),
          api.get('/invoices', { params: { patient: id, limit: 20 } }),
        ]);
        setPatient(pRes.data.data);
        setAppointments(aRes.data.data);
        setTreatments(tRes.data.data);
        setPrescriptions(rxRes.data.data);
        setInvoices(invRes.data.data);
      } catch { navigate(-1); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading patient..." />;
  if (!patient) return null;

  const tabs = ['overview', 'appointments', 'treatments', 'prescriptions', 'billing'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{patient.name}</h1>
          <p className="text-slate-500 text-sm">{patient.patientId}</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['Phone', patient.phone], ['Email', patient.email || '—'], ['Gender', patient.gender || '—'], ['Blood Group', patient.bloodGroup || '—'],
            ['Date of Birth', patient.dob ? format(new Date(patient.dob), 'dd MMM yyyy') : '—'], ['Address', patient.address || '—'],
            ['Allergies', patient.allergies?.join(', ') || 'None'], ['Medical History', patient.medicalHistory || 'None'],
          ].map(([k, v]) => (
            <div key={k}><p className="text-xs text-slate-400 font-medium">{k}</p><p className="text-sm text-slate-700 mt-0.5">{v}</p></div>
          ))}
        </div>
        {patient.emergencyContact?.name && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-slate-400 font-medium mb-1">Emergency Contact</p>
            <p className="text-sm text-slate-700">{patient.emergencyContact.name} ({patient.emergencyContact.relation}) — {patient.emergencyContact.phone}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}>{t}</button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {tab === 'appointments' && (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>{['Date','Time','Doctor','Treatment / Service','Status'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map(a => (
                <tr key={a._id} className="hover:bg-gray-50">
                  <td className="table-cell">{format(new Date(a.date),'dd MMM yyyy')}</td>
                  <td className="table-cell">{a.timeSlot}</td>
                  <td className="table-cell">{a.dentist?.name}</td>
                  <td className="table-cell">{a.treatmentType||'—'}</td>
                  <td className="table-cell"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
              {appointments.length===0&&<tr><td colSpan={5} className="table-cell text-center text-slate-400">No appointments</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'treatments' && (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>{['Date','Type','Diagnosis','Area / Tooth','Cost','Status'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {treatments.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="table-cell">{format(new Date(t.treatmentDate),'dd MMM yyyy')}</td>
                  <td className="table-cell font-medium">{t.treatmentType}</td>
                  <td className="table-cell">{t.diagnosis}</td>
                  <td className="table-cell">{t.toothNumber||'—'}</td>
                  <td className="table-cell">₹{t.cost?.toLocaleString('en-IN')}</td>
                  <td className="table-cell"><StatusBadge status={t.status} /></td>
                </tr>
              ))}
              {treatments.length===0&&<tr><td colSpan={6} className="table-cell text-center text-slate-400">No treatments</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length===0?<div className="card text-center text-slate-400">No prescriptions</div>:prescriptions.map(rx=>(
            <div key={rx._id} className="card">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-semibold">{rx.prescriptionId}</p><p className="text-sm text-slate-500">{rx.dentist?.name?.startsWith('Dr.') ? rx.dentist?.name : `Dr. ${rx.dentist?.name}`} · {format(new Date(rx.date),'dd MMM yyyy')}</p></div>
              </div>
              {rx.diagnosis&&<p className="text-sm text-slate-600 mb-3">Diagnosis: {rx.diagnosis}</p>}
              <div className="space-y-2">
                {rx.medicines.map((m,i)=>(
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-sm">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.dosage} · {m.frequency} · {m.duration}</p>
                    {m.instructions&&<p className="text-xs text-slate-400 mt-1">{m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'billing' && (
        <div className="card !p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>{['Invoice','Amount','Discount','Total','Method','Status'].map(h=><th key={h} className="table-header">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="table-cell font-mono text-xs">{inv.invoiceId}</td>
                  <td className="table-cell">₹{inv.subtotal?.toLocaleString('en-IN')}</td>
                  <td className="table-cell">₹{inv.discount||0}</td>
                  <td className="table-cell font-semibold">₹{inv.total?.toLocaleString('en-IN')}</td>
                  <td className="table-cell">{inv.paymentMethod}</td>
                  <td className="table-cell"><StatusBadge status={inv.paymentStatus} /></td>
                </tr>
              ))}
              {invoices.length===0&&<tr><td colSpan={6} className="table-cell text-center text-slate-400">No invoices</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[['Appointments',appointments.length,'📅'],['Treatments',treatments.length,'🩺'],['Prescriptions',prescriptions.length,'📋'],['Invoices',invoices.length,'🧾']].map(([l,v,e])=>(
            <div key={l} className="card text-center">
              <div className="text-3xl mb-2">{e}</div>
              <p className="text-2xl font-bold text-slate-800">{v}</p>
              <p className="text-sm text-slate-500">{l}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
