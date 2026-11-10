import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-lg shadow-md">
                🩺
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Doc<span className="text-primary-400">Hub</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              DocHub is a multi-speciality clinic and doctor management platform connecting patients, 
              medical specialists, and clinic receptionists with seamless digital appointments, records, and prescriptions.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-medium">DocHub Multi-Speciality Health System Active</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#home" className="hover:text-white transition-colors">Home</a>
              </li>
              <li>
                <a href="#services" className="hover:text-white transition-colors">Doctor Specialities</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Contact Clinic</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Portals & Logins */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Portals & Access</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/login?role=patient" className="hover:text-white transition-colors">
                  Patient Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors text-primary-400 font-semibold">
                  New Patient Registration
                </Link>
              </li>
              <li>
                <Link to="/login?role=dentist" className="hover:text-white transition-colors">
                  Doctor / Dentist Portal
                </Link>
              </li>
              <li>
                <Link to="/login?role=admin" className="hover:text-white transition-colors">
                  Admin & Reception Portal
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-white transition-colors text-slate-400">
                  Password Recovery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Timings & Emergency */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Clinic Hours</h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-white block">Monday – Saturday:</strong>
                9:00 AM – 8:00 PM
              </p>
              <p>
                <strong className="text-white block">Sunday:</strong>
                10:00 AM – 2:00 PM <span className="text-amber-400">(Emergency Only)</span>
              </p>
              <div className="pt-2 text-xs">
                <span className="text-slate-500 block">Helpline:</span>
                <span className="text-white font-mono font-bold">+91 98765 43210</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 DocHub – Doctor & Clinic Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Care</span>
            <span className="hover:text-slate-400 transition-colors">Doctor Code of Ethics</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

