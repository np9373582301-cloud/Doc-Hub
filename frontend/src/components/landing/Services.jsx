import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  SparklesIcon,
  BeakerIcon,
  FaceSmileIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const services = [
  {
    title: 'General Medicine & Physician',
    desc: 'Diagnosis and personalized treatment for fevers, infections, diabetes, hypertension, and holistic preventive lifestyle care.',
    icon: ClipboardDocumentCheckIcon,
    tag: 'Primary Care',
    color: 'from-blue-500 to-primary-600',
    lightColor: 'bg-blue-50 text-primary-700 border-blue-100',
  },
  {
    title: 'Cardiology & Heart Care',
    desc: 'Specialized cardiac evaluations, 12-lead ECG, blood pressure management, and comprehensive heart health counseling.',
    icon: HeartIcon,
    tag: 'Cardiology',
    color: 'from-rose-500 to-rose-600',
    lightColor: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    title: 'Dermatology & Skin Clinic',
    desc: 'Expert clinical therapies for acne, allergies, eczema, psoriasis, skin pigmentation, and advanced hair rejuvenation.',
    icon: SparklesIcon,
    tag: 'Skin & Hair',
    color: 'from-teal-500 to-teal-600',
    lightColor: 'bg-teal-50 text-teal-700 border-teal-100',
  },
  {
    title: 'Orthopedics & Joint Care',
    desc: 'Specialist care for knee pain, arthritis, fractures, spine problems, and sports injury recovery with physiotherapy support.',
    icon: BeakerIcon,
    tag: 'Bones & Joints',
    color: 'from-indigo-500 to-indigo-600',
    lightColor: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  },
  {
    title: 'Pediatrics & Child Wellness',
    desc: 'Gentle medical care for infants, toddlers, and teenagers, covering growth milestones, immunity, and routine health checks.',
    icon: UserGroupIcon,
    tag: 'Child Specialist',
    color: 'from-purple-500 to-purple-600',
    lightColor: 'bg-purple-50 text-purple-700 border-purple-100',
  },
  {
    title: 'Dental Care & Oral Surgery',
    desc: 'Preventive cleanings, root canal therapy, teeth whitening, aligners, and dental implants by certified dental surgeons.',
    icon: FaceSmileIcon,
    tag: 'Dental Health',
    color: 'from-emerald-500 to-emerald-600',
    lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-slate-50/70 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100/70 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Multi-Speciality Healthcare</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Consult Certified Doctors Across Top Specialities
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            From routine physician visits to cardiology, dermatology, and dental care, 
            DocHub connects you with verified specialists for safe, patient-first clinical treatments.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.lightColor}`}>
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors mb-2.5">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Certified Specialists</span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 group-hover:text-primary-700 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Book Doctor</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Assurance Strip */}
        <div className="mt-12 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-700 text-sm font-medium">
            <ShieldCheckIcon className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <span>All doctors on DocHub are verified with valid medical registrations and degrees.</span>
          </div>
          <Link
            to="/register"
            className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold whitespace-nowrap shadow-sm"
          >
            Find Your Doctor &rarr;
          </Link>
        </div>

      </div>
    </section>
  );
}
