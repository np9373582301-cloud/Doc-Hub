import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api/axios';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#2563EB','#0EA5A4','#16A34A','#F59E0B','#DC2626','#7C3AED'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading reports..." />;
  if (!data) return null;

  const revenueChartData = data.revenueChart.map(d => ({ month: MONTH_NAMES[d._id.month-1], Revenue: d.revenue }));

  const apptByStatus = [
    { name: 'Completed', value: data.completedAppointments || 0 },
    { name: 'Today', value: data.todayAppointments || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
        <p className="text-slate-500 text-sm">Business performance overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${data.totalRevenue?.toLocaleString('en-IN')}`, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending Payments', value: `₹${data.pendingAmount?.toLocaleString('en-IN')}`, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Completed Appointments', value: data.completedAppointments, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(c => (
          <div key={c.label} className={`card text-center ${c.bg}`}>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-sm text-slate-600 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Monthly Revenue (Last 6 Months)</h2>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueChartData}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/><stop offset="95%" stopColor="#2563EB" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
              <Area type="monotone" dataKey="Revenue" stroke="#2563EB" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : <div className="h-48 flex items-center justify-center text-slate-400">No revenue data</div>}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Quick Stats</h2>
          <div className="space-y-3">
            {[
              ['Total Patients', data.totalPatients],
              ['Total Doctors', data.totalDentists],
              ['Today Appointments', data.todayAppointments],
              ['Completed Appointments', data.completedAppointments],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-slate-600">{k}</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Appointment Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={apptByStatus} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {apptByStatus.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
