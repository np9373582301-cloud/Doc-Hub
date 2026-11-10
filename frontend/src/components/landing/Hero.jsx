import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarDaysIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';

export default function Hero() {
  const { user } = useAuth();

  const getPrimaryCta = () => {
    if (user) {
      if (user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin) {
        return { to: '/admin/dashboard', label: 'Go to Admin Dashboard' };
      }
      if (user.role === 'dentist') {
        return { to: '/dentist/dashboard', label: 'Go to Doctor Portal' };
      }
      return { to: '/patient/book-appointment', label: 'Book an Appointment' };
    }
    return { to: '/register', label: 'Book an Appointment' };
  };

  const primaryCta = getPrimaryCta();

  return (
    <section
      id="home"
      className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 scroll-mt-24"
    >
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-300/20 via-teal-200/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Text & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-primary-700 text-xs font-semibold mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
              <span>Next-Gen Multi-Speciality Clinic & Doctor Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Smarter Healthcare &{' '}
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-teal-500 bg-clip-text text-transparent">
                Doctor Appointments,
              </span>{' '}
              Made Seamless.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-8">
              DocHub connects certified doctors across multiple specialities, clinic administrators, and patients in one intuitive platform. 
              Schedule specialist appointments, manage treatments, issue digital prescriptions, and handle billing with complete confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 sm:gap-4 mb-10">
              <Link
                to={primaryCta.to}
                className="w-full sm:w-auto btn-primary justify-center text-base px-6 py-3.5 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 group"
              >
                <span>{primaryCta.label}</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#services"
                className="w-full sm:w-auto btn-secondary justify-center text-base px-6 py-3.5 rounded-xl border-slate-300 hover:border-slate-400 text-slate-700"
              >
                Doctor Specialities
              </a>
            </div>

            {/* Key Value Bullets */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">Real-time Slots</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">Digital Rx & PDF</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700">₹ INR Invoicing</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real Image of Indian Doctor & Patient with Floating Chips */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Outer Decorative Glow & Wrapper */}
            <div className="relative w-full max-w-lg">
              
              {/* Soft decorative glow behind photo */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-primary-600/30 via-teal-400/25 to-blue-500/20 rounded-3xl blur-xl pointer-events-none" />

              {/* Main Photo Card Frame */}
              <div className="relative bg-white p-2.5 sm:p-3 rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden">
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-100 group">
                  <img
                    src="/images/hero-dentist-patient.jpg"
                    alt="Doctor consulting with smiling patient at DocHub clinic"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="eager"
                  />
                  {/* Subtle dark gradient overlay at the bottom for crystal-clear readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Doctor Info Pill inside image bottom */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white bg-slate-900/70 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/20 shadow-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center font-bold text-xs ring-2 ring-white/60 shadow-sm">
                        PS
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-tight">Dr. Priya Sharma, MD</p>
                        <p className="text-[10px] sm:text-xs text-teal-300 font-medium">Senior Consultant & Specialist Physician</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-[10px] font-bold text-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      In Clinic
                    </span>
                  </div>
                </div>
              </div>

              {/* FLOATING CHIP 1: Top Right - Easy Scheduling */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5 animate-bounce [animation-duration:3.5s]">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Easy Scheduling</p>
                  <p className="text-[10px] text-slate-500">Zero Overlapping Slots</p>
                </div>
              </div>

              {/* FLOATING CHIP 2: Bottom Left - Digital Prescriptions */}
              <div className="absolute -bottom-5 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 px-3.5 py-2.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-inner">
                  <DocumentCheckIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Digital Prescriptions</p>
                  <p className="text-[10px] text-slate-500">1-Click PDF Print</p>
                </div>
              </div>

              {/* FLOATING CHIP 3: Middle Left - Patient Satisfaction */}
              <div className="hidden sm:flex absolute top-1/3 -left-6 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-100 px-3 py-2 items-center gap-2">
                <ShieldCheckIcon className="w-4 h-4 text-teal-600" />
                <div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    <StarSolid className="w-3 h-3" />
                    <StarSolid className="w-3 h-3" />
                    <StarSolid className="w-3 h-3" />
                    <StarSolid className="w-3 h-3" />
                    <StarSolid className="w-3 h-3" />
                    <span className="text-[10px] font-bold text-slate-700 ml-1">4.9/5</span>
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">Painless Care Experience</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
