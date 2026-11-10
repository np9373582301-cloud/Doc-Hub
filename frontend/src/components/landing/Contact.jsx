import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Consultation',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please fill in your name, email, and message details.');
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(form.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      // Direct API call to backend /api/contact
      const response = await api.post('/contact', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject || 'General Consultation',
        message: form.message.trim(),
      });

      const result = response.data;
      setSubmittedData({
        referenceId: result.data?.referenceId || `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject || 'General Consultation',
      });

      toast.success('Your message has been sent to our clinic front desk!', {
        duration: 5000,
      });

      // Clear form
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: 'General Consultation',
        message: '',
      });
    } catch (err) {
      console.error('Contact form submission error:', err);
      // Fallback: if network or backend fails, still provide graceful recovery
      const errorMsg = err.response?.data?.message || 'Failed to deliver message. Please call our clinic hotline directly.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handleReset = () => {
    setSubmittedData(null);
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-slate-50/70 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100/70 text-primary-800 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Get In Touch</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            We’re Here for Your Health & Care
          </h2>
          <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
            Have questions about doctor consultations, specialized clinical treatments, or booking? 
            Reach out directly or send our medical desk a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Clinic Info Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Clinic Information</h3>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-blue-50 text-primary-600 border border-blue-100 flex-shrink-0">
                    <MapPinIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Clinic Location</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                      102 Healthcare Plaza, Central Avenue,<br />
                      Medical District, Mumbai, MH 400001
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex-shrink-0">
                    <PhoneIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Emergency & Appointments</h4>
                    <a
                      href="tel:+919876543210"
                      className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold block mt-0.5 transition-colors"
                    >
                      +91 98765 43210
                    </a>
                    <p className="text-xs text-slate-500">(022) 2854-9900 / 2854-9901</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                    <EnvelopeIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Email Support</h4>
                    <a
                      href="mailto:care@dochub.com"
                      className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-semibold block mt-0.5 transition-colors"
                    >
                      care@dochub.com
                    </a>
                    <p className="text-xs text-slate-500">desk@dochub.com</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex-shrink-0">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Working Hours</h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                      <strong className="text-slate-800">Mon – Sat:</strong> 9:00 AM – 8:00 PM
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600">
                      <strong className="text-slate-800">Sunday:</strong> 10:00 AM – 2:00 PM{' '}
                      <span className="text-amber-600 text-[11px] font-semibold">(Emergency only)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="mt-8 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-800">
                <p className="text-xs font-bold uppercase tracking-wider">Medical Emergency or Acute Pain?</p>
                <p className="text-xs mt-1 text-red-700">
                  Walk-ins for urgent medical conditions are given immediate priority. Call our clinic hotline above.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact Form / Success Confirmation */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm transition-all duration-300">
              
              {submittedData ? (
                /* IN-CARD SUCCESS CONFIRMATION STATE */
                <div className="py-6 text-center space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                    <CheckCircleIcon className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase mb-2">
                      Reference #{submittedData.referenceId}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900">Message Received!</h3>
                    <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                      Thank you <strong className="text-slate-800">{submittedData.name}</strong>. Your message regarding{' '}
                      <strong className="text-slate-800">"{submittedData.subject}"</strong> has been saved directly to our clinic's system.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-md mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Inquiry Type:</span>
                      <span className="text-slate-800 font-semibold">{submittedData.subject}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">Confirmation sent to:</span>
                      <span className="text-slate-800 font-semibold">{submittedData.email}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500 font-medium">Estimated Response:</span>
                      <span className="text-emerald-700 font-bold">Within 2 hours</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="btn-secondary mx-auto text-xs px-5 py-2.5 rounded-xl font-semibold shadow-sm"
                    >
                      <ArrowPathIcon className="w-4 h-4 text-slate-500" />
                      <span>Send Another Inquiry</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* LIVE INTERACTIVE FORM */
                <>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">Send a Message to the Clinic</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mb-6">
                    Our front desk team responds to messages within 2 hours during clinic hours.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          value={form.name}
                          onChange={handleChange('name')}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="label">Phone Number</label>
                        <input
                          type="tel"
                          placeholder="e.g. 9876543210"
                          value={form.phone}
                          onChange={handleChange('phone')}
                          className="input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="label">Email Address *</label>
                        <input
                          type="email"
                          required
                          placeholder="rahul@example.com"
                          value={form.email}
                          onChange={handleChange('email')}
                          className="input"
                        />
                      </div>

                      <div>
                        <label className="label">Inquiry Type</label>
                        <select
                          value={form.subject}
                          onChange={handleChange('subject')}
                          className="input cursor-pointer"
                        >
                          <option value="General Medicine">General Medicine / Physician</option>
                          <option value="Cardiology">Cardiology (Heart Specialist)</option>
                          <option value="Dermatology">Dermatology (Skin & Hair)</option>
                          <option value="Orthopedics">Orthopedics (Joint & Bones)</option>
                          <option value="Pediatrics">Pediatrics (Child Health)</option>
                          <option value="Gynecology">Gynecology & Women's Health</option>
                          <option value="ENT">ENT (Ear, Nose, Throat)</option>
                          <option value="Dental Care">Dental Care & Oral Health</option>
                          <option value="Billing / Invoice">Billing / Invoicing Question</option>
                          <option value="Other">Other Medical Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Message / Details *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Tell us what you need help with or describe your health symptoms..."
                        value={form.message}
                        onChange={handleChange('message')}
                        className="input resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full sm:w-auto justify-center px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 disabled:opacity-50"
                    >
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
