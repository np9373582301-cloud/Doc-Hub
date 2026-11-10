import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function CtaBanner() {
  const { user } = useAuth();

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="relative rounded-3xl bg-gradient-to-r from-primary-600 via-blue-600 to-teal-500 overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16 text-white text-center md:text-left">
          
          {/* Subtle Background Glow Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            <div className="md:col-span-8">
              <span className="inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold tracking-wider uppercase mb-4 text-blue-50">
                Experience Better Healthcare
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
                Ready to Consult Top Doctors & Manage Your Health?
              </h2>
              <p className="text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
                Join thousands of patients enjoying painless online bookings and top doctors running seamless clinic workflows.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-xs text-blue-100 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                  Free Patient Registration
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                  Instant SMS & Email Slot Confirmation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-300" />
                  Digital Rx Anytime
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-3.5 justify-center md:items-end">
              {user ? (
                <Link
                  to={
                    user.role === 'dentist'
                      ? '/dentist/dashboard'
                      : user.role === 'admin' || user.isSuperAdmin
                      ? '/admin/dashboard'
                      : '/patient/dashboard'
                  }
                  className="w-full sm:w-auto md:w-full text-center px-6 py-3.5 bg-white text-primary-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto md:w-full text-center px-6 py-3.5 bg-white text-primary-700 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Register as Patient</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto md:w-full text-center px-6 py-3.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold rounded-xl transition-all text-sm"
                  >
                    Staff & Doctor Login
                  </Link>
                </>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
