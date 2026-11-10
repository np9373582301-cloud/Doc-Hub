import React, { useState, useEffect } from 'react';
import { CalendarIcon, UsersIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

export default function DentistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/dentist')
      .then(r => setData(r.data.data))
      .catch(err => {
        console.error('Failed to load dentist stats:', err);
        setData({
          todayAppointments: 0,
          totalPatients: 0,
          completedTreatments: 0,
          pendingTreatments: 0,
          todayAppointmentList: [],
          upcomingAppointments: [],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading..." />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1><p className="text-slate-500 text-sm">{format(new Date(),'EEEE, MMMM d yyyy')}</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Today's Appointments" value={data.todayAppointments} icon={CalendarIcon} color="blue" />
        <StatCard title="Total Patients" value={data.totalPatients} icon={UsersIcon} color="teal" />
        <StatCard title="Completed Treatments" value={data.completedTreatments} icon={CheckCircleIcon} color="green" />
        <StatCard title="Pending Treatments" value={data.pendingTreatments} icon={ClockIcon} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {data.todayAppointmentList?.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">No appointments today</p> :
              data.todayAppointmentList?.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="text-center min-w-12">
                    <p className="font-bold text-primary-600 text-sm">{a.timeSlot}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{a.patient?.name}</p>
                    <p className="text-xs text-slate-400">{a.patient?.patientId} · {a.treatmentType || 'Consultation'}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-700 mb-4">Upcoming Appointments</h2>
          <div className="space-y-3">
            {data.upcomingAppointments?.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">No upcoming appointments</p> :
              data.upcomingAppointments?.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{a.patient?.name}</p>
                    <p className="text-xs text-slate-400">{format(new Date(a.date),'dd MMM')} at {a.timeSlot}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
