import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon, UsersIcon, UserIcon, CalendarIcon, BeakerIcon,
  DocumentTextIcon, CurrencyRupeeIcon, ChartBarIcon,
  Cog6ToothIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon, BookOpenIcon, ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const adminNav = [
  { label: 'Dashboard', icon: HomeIcon, path: '/admin/dashboard' },
  { label: 'Patients', icon: UsersIcon, path: '/admin/patients' },
  { label: 'Doctors', icon: UserIcon, path: '/admin/dentists' },
  { label: 'Appointments', icon: CalendarIcon, path: '/admin/appointments' },
  { label: 'Treatments', icon: BeakerIcon, path: '/admin/treatments' },
  { label: 'Prescriptions', icon: DocumentTextIcon, path: '/admin/prescriptions' },
  { label: 'Billing', icon: CurrencyRupeeIcon, path: '/admin/billing' },
  { label: 'Reports', icon: ChartBarIcon, path: '/admin/reports' },
  { label: 'Inquiries', icon: EnvelopeIcon, path: '/admin/inquiries' },
  { label: 'Admins', icon: ShieldCheckIcon, path: '/admin/admins' },
  { label: 'Settings', icon: Cog6ToothIcon, path: '/admin/settings' },
];

const dentistNav = [
  { label: 'Dashboard', icon: HomeIcon, path: '/dentist/dashboard' },
  { label: 'Profile', icon: UserIcon, path: '/dentist/profile' },
  { label: 'Appointments', icon: CalendarIcon, path: '/dentist/appointments' },
  { label: 'My Patients', icon: UsersIcon, path: '/dentist/patients' },
  { label: 'Treatments', icon: BeakerIcon, path: '/dentist/treatments' },
  { label: 'Prescriptions', icon: DocumentTextIcon, path: '/dentist/prescriptions' },
];

const patientNav = [
  { label: 'Dashboard', icon: HomeIcon, path: '/patient/dashboard' },
  { label: 'Profile', icon: UserIcon, path: '/patient/profile' },
  { label: 'Book Appointment', icon: CalendarIcon, path: '/patient/book-appointment' },
  { label: 'My Appointments', icon: ClipboardDocumentListIcon, path: '/patient/appointments' },
  { label: 'Treatments', icon: BeakerIcon, path: '/patient/treatments' },
  { label: 'Prescriptions', icon: DocumentTextIcon, path: '/patient/prescriptions' },
  { label: 'Bills', icon: CurrencyRupeeIcon, path: '/patient/bills' },
];

const navMap = { admin: adminNav, dentist: dentistNav, patient: patientNav };
const roleLabel = { admin: 'Admin', dentist: 'Doctor', patient: 'Patient', superadmin: 'Super Admin' };
const roleColor = { admin: 'bg-primary-600', dentist: 'bg-teal-600', patient: 'bg-green-600', superadmin: 'bg-purple-700' };

export default function AdminLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isSuper = user?.isSuperAdmin || user?.role === 'superadmin' || user?.email === 'np9373582301@gmail.com';
  const currentRole = isSuper && role === 'admin' ? 'superadmin' : role;
  const nav = navMap[role] || adminNav;
  const profilePath = role === 'patient' ? '/patient/profile' : (role === 'dentist' ? '/dentist/profile' : '/admin/settings');

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">🩺</div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">DocHub</h1>
            <p className="text-xs text-blue-200">{roleLabel[currentRole]} Portal</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ label, icon: Icon, path }) => (
          <NavLink key={path} to={path} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`
            }>
            <Icon className="w-5 h-5 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User Card - Clickable to open Profile */}
      <div className="p-3 border-t border-white/10">
        <Link
          to={profilePath}
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/15 transition-all group mb-2 text-left cursor-pointer"
          title="Click to view & edit your profile and photo"
        >
          {user?.avatar || user?.photo ? (
            <img
              src={user.avatar || user.photo}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white/40 shadow-sm flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/20 flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate group-hover:text-amber-200 transition-colors">
              {user?.name}
            </p>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <span>{isSuper ? 'Super Admin' : (roleLabel[user?.role] || user?.role)}</span>
              <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-200 font-medium transition-opacity">
                • Profile &rarr;
              </span>
            </p>
          </div>
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 ${roleColor[currentRole]} flex-shrink-0`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className={`relative flex flex-col w-64 ${roleColor[currentRole]} z-10`}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
              <XMarkIcon className="w-6 h-6" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex-1" />
          <Link
            to={profilePath}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
            title="Click to view & edit your profile"
          >
            {user?.avatar || user?.photo ? (
              <img
                src={user.avatar || user.photo}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${roleColor[currentRole]}`}>
              {roleLabel[currentRole]}
            </span>
            <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.name}</span>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
