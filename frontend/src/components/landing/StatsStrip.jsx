import React, { useState, useEffect, useRef } from 'react';
import {
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const statsData = [
  {
    target: 15000,
    suffix: '+',
    label: 'Patients Served',
    desc: 'Trusted by families across Mumbai',
    icon: UserGroupIcon,
    color: 'text-primary-600 bg-blue-50 border-blue-100',
  },
  {
    target: 50,
    suffix: '+',
    label: 'Expert Doctors',
    desc: 'Specialists across 15+ medical fields',
    icon: SparklesIcon,
    color: 'text-teal-600 bg-teal-50 border-teal-100',
  },
  {
    target: 48000,
    suffix: '+',
    label: 'Appointments Booked',
    desc: 'Seamless real-time calendar scheduling',
    icon: CalendarDaysIcon,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    target: 12,
    suffix: '+',
    label: 'Years of Care',
    desc: 'Excellence in comprehensive healthcare',
    icon: BuildingOffice2Icon,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
];

function StatCard({ stat }) {
  const [count, setCount] = useState(0);
  const cardRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600; // ms
          const steps = 40;
          const stepTime = duration / steps;
          const increment = stat.target / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= stat.target) {
              setCount(stat.target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, stat.target]);

  const Icon = stat.icon;

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex items-start gap-4"
    >
      <div className={`p-3 rounded-2xl border flex-shrink-0 ${stat.color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {count.toLocaleString('en-IN')}
          <span className="text-primary-600 font-bold">{stat.suffix}</span>
        </p>
        <h4 className="text-sm font-bold text-slate-800 mt-1">{stat.label}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{stat.desc}</p>
      </div>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="relative z-10 -mt-8 sm:-mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
