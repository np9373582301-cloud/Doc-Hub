import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UsersIcon, CalendarIcon, UserIcon, CurrencyRupeeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (!data) return null;

  const revenueChartData = data.revenueChart.map(d => ({
    month: MONTH_NAMES[d._id.month - 1],
    Revenue: d.revenue,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={data.totalPatients} icon={UsersIcon} color="blue" subtitle="Registered patients" />
        <StatCard title="Today's Appointments" value={data.todayAppointments} icon={CalendarIcon} color="teal" subtitle="Scheduled today" />
        <StatCard title="Total Doctors" value={data.totalDentists} icon={UserIcon} color="purple" subtitle="Active specialists" />
        <StatCard title="Today's Revenue" value={`₹${data.todayRevenue.toLocaleString('en-IN')}`} icon={CurrencyRupeeIcon} color="green" subtitle="Payments received" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Revenue Trend (6 months)</h2>
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="Revenue" stroke="#2563EB" fill="url(#revGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400">No revenue data yet</div>}
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Financial Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Revenue', value: data.totalRevenue, color: 'text-green-600' },
              { label: 'Pending Payments', value: data.pendingAmount, color: 'text-orange-600' },
              { label: 'Completed Appointments', value: data.completedAppointments, color: 'text-blue-600', isCount: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>
                  {item.isCount ? item.value : `₹${item.value.toLocaleString('en-IN')}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Recent Patients</h2>
            <Link to="/admin/patients" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.recentPatients.length === 0 ? <p className="text-slate-400 text-sm">No patients yet</p> : data.recentPatients.map(p => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm flex-shrink-0">
                  {p.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.patientId} · {p.phone}</p>
                </div>
                <span className="text-xs text-slate-400">{format(new Date(p.createdAt), 'dd MMM')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Upcoming Appointments</h2>
            <Link to="/admin/appointments" className="text-primary-600 text-sm hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {data.upcomingAppointments.length === 0 ? <p className="text-slate-400 text-sm">No upcoming appointments</p> : data.upcomingAppointments.map(a => (
              <div key={a._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{a.patient?.name}</p>
                  <p className="text-xs text-slate-400">{a.dentist?.name} · {a.timeSlot}</p>
                </div>
                <span className="text-xs text-slate-400">{format(new Date(a.date), 'dd MMM')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
