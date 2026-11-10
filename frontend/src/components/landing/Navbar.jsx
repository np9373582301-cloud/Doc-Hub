import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  UserIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'Services', href: '#services' },
  { name: 'Contact', href: '#contact' },
];

const loginRoles = [
  {
    role: 'Admin / Receptionist',
    desc: 'Clinic management, staff, billing & reports',
    href: '/login?role=admin',
    icon: ShieldCheckIcon,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    role: 'Doctor / Specialist',
    desc: 'Today schedule, patient records & prescriptions',
    href: '/login?role=dentist',
    icon: UserIcon,
    color: 'text-teal-600 bg-teal-50 border-teal-100',
  },
  {
    role: 'Patient',
    desc: 'Book appointments, view history & digital bills',
    href: '/login?role=patient',
    icon: HeartIcon,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Detect scroll for sticky elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Determine dashboard URL for authenticated user
  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin) {
      return '/admin/dashboard';
    }
    if (user.role === 'dentist') return '/dentist/dashboard';
    return '/patient/dashboard';
  };

  const roleLabel = () => {
    if (!user) return '';
    if (user.isSuperAdmin || user.role === 'superadmin') return 'Super Admin';
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'dentist') return 'Doctor';
    return 'Patient';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-slate-100 py-3'
          : 'bg-white/80 backdrop-blur-sm border-b border-slate-100/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* LEFT: Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg p-1"
            aria-label="DocHub Home"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-teal-500 flex items-center justify-center text-xl shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
              🩺
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Doc<span className="text-primary-600">Hub</span>
              </span>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold -mt-1 hidden sm:block">
                Doctor & Clinic System
              </p>
            </div>
          </Link>

          {/* CENTER: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-primary-50/50 rounded-lg transition-colors duration-150"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* RIGHT: Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              /* User is logged in */
              <div className="flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{user.name}</p>
                  <span className="text-[10px] font-medium text-primary-600 capitalize">
                    {roleLabel()}
                  </span>
                </div>
                <Link
                  to={getDashboardUrl()}
                  className="btn-primary text-sm px-4 py-2 shadow-sm shadow-primary-500/20"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* User is not logged in: Login Dropdown + Register */
              <>
                {/* Login Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      dropdownOpen
                        ? 'border-primary-500 bg-primary-50/50 text-primary-700'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="Login Options"
                  >
                    <span>Login</span>
                    <ChevronDownIcon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? 'rotate-180 text-primary-600' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl border border-slate-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      role="menu"
                    >
                      <div className="px-3.5 py-1.5 mb-1 border-b border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Select Login Role
                        </p>
                      </div>

                      {loginRoles.map((roleItem) => {
                        const Icon = roleItem.icon;
                        return (
                          <Link
                            key={roleItem.role}
                            to={roleItem.href}
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-start gap-3 px-3.5 py-2.5 hover:bg-slate-50 transition-colors group focus:outline-none focus:bg-slate-50"
                            role="menuitem"
                          >
                            <div className={`p-2 rounded-xl border flex-shrink-0 ${roleItem.color}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-600 transition-colors">
                                {roleItem.role}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1">
                                {roleItem.desc}
                              </p>
                            </div>
                          </Link>
                        );
                      })}

                      <div className="mt-2 pt-2 border-t border-slate-100 px-3.5">
                        <Link
                          to="/login"
                          onClick={() => setDropdownOpen(false)}
                          className="text-xs text-center block text-primary-600 hover:text-primary-700 font-medium py-1"
                        >
                          General Sign In Page →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 shadow-sm shadow-primary-500/20"
                  title="New patient registration"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* MOBILE: Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                to={getDashboardUrl()}
                className="text-xs font-semibold px-3 py-1.5 bg-primary-600 text-white rounded-lg"
              >
                Dashboard
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU PANEL */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-3 duration-200 shadow-xl">
          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-primary-600 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                  <p className="text-[11px] text-slate-500">{user.email} • {roleLabel()}</p>
                </div>
                <Link
                  to={getDashboardUrl()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center text-sm py-2.5"
                >
                  Go to Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full text-center py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Sign In by Role
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {loginRoles.map((roleItem) => {
                    const Icon = roleItem.icon;
                    return (
                      <Link
                        key={roleItem.role}
                        to={roleItem.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200/80 hover:border-primary-300 hover:bg-primary-50/30 transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg border ${roleItem.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">{roleItem.role}</p>
                          <p className="text-[10px] text-slate-500">{roleItem.desc}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full justify-center text-sm py-2.5 shadow-sm"
                >
                  New Patient Registration
                </Link>
                <p className="text-[11px] text-center text-slate-400">
                  Doctor and staff accounts are created by Clinic Admin
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

