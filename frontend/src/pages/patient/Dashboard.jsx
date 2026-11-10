import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, BeakerIcon, CurrencyRupeeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/patient').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (!data) return null;

  const pendingAmount = data.pendingInvoices?.reduce((s, inv) => s + (inv.total - inv.paidAmount), 0) || 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">My Health Dashboard</h1><p className="text-slate-500 text-sm">{format(new Date(), 'EEEE, MMMM d yyyy')}</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Upcoming Appointments" value={data.upcomingAppointments?.length || 0} icon={CalendarIcon} color="blue" />
        <StatCard title="Treatments Done" value={data.recentTreatments?.length || 0} icon={BeakerIcon} color="teal" />
        <StatCard title="Pending Amount" value={`₹${pendingAmount.toLocaleString('en-IN')}`} icon={CurrencyRupeeIcon} color="orange" />
        <StatCard title="Prescriptions" value={data.recentPrescriptions?.length || 0} icon={DocumentTextIcon} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between mb-4"><h2 className="font-semibold text-slate-700">Upcoming Appointments</h2><Link to="/patient/appointments" className="text-primary-600 text-sm hover:underline">View all</Link></div>
          <div className="space-y-3">
            {data.upcomingAppointments?.length===0 ? <p className="text-slate-400 text-sm text-center py-4">No upcoming appointments</p> :
              data.upcomingAppointments?.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><CalendarIcon className="w-5 h-5 text-primary-600" /></div>
                  <div className="flex-1"><p className="font-medium">{a.dentist?.name?.startsWith('Dr.') ? a.dentist?.name : `Dr. ${a.dentist?.name}`}</p><p className="text-xs text-slate-400">{format(new Date(a.date),'dd MMM')} at {a.timeSlot} · {a.treatmentType||'Consultation'}</p></div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
          </div>
          <Link to="/patient/book-appointment" className="btn-primary mt-4 w-full justify-center"><CalendarIcon className="w-4 h-4" /> Book Appointment</Link>
        </div>

        <div className="card">
          <div className="flex justify-between mb-4"><h2 className="font-semibold text-slate-700">Recent Treatments</h2><Link to="/patient/treatments" className="text-primary-600 text-sm hover:underline">View all</Link></div>
          <div className="space-y-3">
            {data.recentTreatments?.length===0 ? <p className="text-slate-400 text-sm text-center py-4">No treatments yet</p> :
              data.recentTreatments?.map(t => (
                <div key={t._id} className="p-3 rounded-lg bg-gray-50">
                  <div className="flex justify-between"><p className="font-medium text-sm">{t.treatmentType}</p><span className="text-sm font-semibold text-green-600">₹{t.cost?.toLocaleString('en-IN')}</span></div>
                  <p className="text-xs text-slate-400 mt-0.5">{t.diagnosis} · {format(new Date(t.treatmentDate),'dd MMM yyyy')}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {data.pendingInvoices?.length > 0 && (
        <div className="card border-orange-200 bg-orange-50">
          <h2 className="font-semibold text-orange-800 mb-3">💰 Pending Payments</h2>
          <div className="space-y-2">
            {data.pendingInvoices.map(inv => (
              <div key={inv._id} className="flex justify-between items-center p-3 bg-white rounded-lg">
                <div><p className="font-medium text-sm">{inv.invoiceId}</p><p className="text-xs text-slate-400">{inv.paymentStatus}</p></div>
                <p className="font-bold text-orange-700">₹{inv.total?.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <Link to="/patient/bills" className="mt-3 text-sm text-orange-700 font-medium hover:underline block">View all bills →</Link>
        </div>
      )}
    </div>
  );
}
