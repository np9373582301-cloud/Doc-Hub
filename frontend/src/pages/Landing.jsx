import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import StatsStrip from '../components/landing/StatsStrip';
import Services from '../components/landing/Services';
import CtaBanner from '../components/landing/CtaBanner';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-primary-100 selection:text-primary-800">
      {/* 1. Sticky Navigation Bar with Role Login Dropdown & Register */}
      <Navbar />

      {/* Main Landing Page Content */}
      <main className="flex-1">
        {/* 2. Hero Section with Headline, CTAs, and CSS/SVG Dashboard Mockup */}
        <Hero />

        {/* 3. Trust Stats Strip with Count-Up Numbers */}
        <StatsStrip />

        {/* 4. Dental Services with 6 Cards & Hover Lift */}
        <Services />

        {/* 5. High-Conversion CTA Banner */}
        <CtaBanner />

        {/* 6. Contact Details & Interactive Inquiry Form */}
        <Contact />
      </main>

      {/* 7. Comprehensive Footer */}
      <Footer />
    </div>
  );
}
