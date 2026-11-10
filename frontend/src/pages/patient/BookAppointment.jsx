import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TREATMENTS = [
  'General Medical Consultation',
  'Cardiology Checkup & ECG Review',
  'Dermatology & Skin Consultation',
  'Orthopedic Joint & Bone Consultation',
  'Pediatric Wellness & Child Health Check',
  'ENT (Ear, Nose & Throat) Examination',
  'Eye & Vision Checkup',
  'Dental Checkup & Cleaning',
  'Full Body Preventive Health Check',
  'Routine Blood Pressure & Diabetes Follow-up',
  'Second Opinion / Prescription Renewal',
  'Minor Procedure Consultation',
];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [dentists, setDentists] = useState([]);
  const [patient, setPatient] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [selectedSpeciality, setSelectedSpeciality] = useState('All');
  const [form, setForm] = useState({ dentist: '', date: '', timeSlot: '', treatmentType: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoadingDoctors(true);
    api.get('/dentists', { params: { limit: 100 } })
      .then(r => setDentists(r.data.data || []))
      .catch(() => toast.error('Failed to load doctors list'))
      .finally(() => setLoadingDoctors(false));

    api.get('/patients/me')
      .then(r => setPatient(r.data.data))
      .catch(() => { });
  }, []);

  // Compute unique specialities available from fetched doctors
  const availableSpecialities = useMemo(() => {
    const set = new Set();
    dentists.forEach(d => {
      if (d.specialization) set.add(d.specialization);
    });
    return ['All', ...Array.from(set)];
  }, [dentists]);

  // Filter doctors by selected speciality
  const filteredDoctors = useMemo(() => {
    if (selectedSpeciality === 'All') return dentists;
    return dentists.filter(d => d.specialization === selectedSpeciality);
  }, [dentists, selectedSpeciality]);

  useEffect(() => {
    if (form.dentist && form.date) {
      setLoadingSlots(true);
      api.get('/appointments/slots', { params: { dentistId: form.dentist, date: form.date } })
        .then(r => setSlots(r.data.data || []))
        .catch(() => setSlots([]))
        .finally(() => setLoadingSlots(false));
    } else {
      setSlots([]);
    }
  }, [form.dentist, form.date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patient) {
      toast.error('Patient profile not found. Please complete your profile.');
      return;
    }
    if (!form.dentist) {
      toast.error('Please select a doctor');
      return;
    }
    if (!form.date) {
      toast.error('Please select an appointment date');
      return;
    }
    if (!form.timeSlot) {
      toast.error('Please select a time slot');
      return;
    }
    setSaving(true);
    try {
      await api.post('/appointments', { ...form, patient: patient._id });
      toast.success('Appointment booked successfully!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const selectedDoctor = dentists.find(d => d._id === form.dentist);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span>🩺</span>
          <span>Book Doctor Appointment</span>
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Schedule an in-clinic consultation with one of our specialized doctors
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Doctor & Speciality */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">1</span>
              <span>Select Doctor & Speciality</span>
            </h2>
            <span className="text-xs text-slate-500">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} available
            </span>
          </div>

          {/* Speciality Filter Pills */}
          {availableSpecialities.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-thin">
              {availableSpecialities.map(spec => (
                <button
                  key={spec}
                  type="button"
                  onClick={() => setSelectedSpeciality(spec)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${selectedSpeciality === spec
                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}

          {loadingDoctors ? (
            <LoadingSpinner />
          ) : filteredDoctors.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-sm font-medium">No doctors found for &ldquo;{selectedSpeciality}&rdquo;.</p>
              <button
                type="button"
                onClick={() => setSelectedSpeciality('All')}
                className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
              >
                View all doctors
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredDoctors.map(d => {
                const isSelected = form.dentist === d._id;
                return (
                  <label
                    key={d._id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                        ? 'border-primary-600 bg-primary-50/60 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                  >
                    <input
                      type="radio"
                      name="dentist"
                      value={d._id}
                      className="sr-only"
                      onChange={set('dentist')}
                      checked={isSelected}
                    />

                    {/* Avatar */}
                    {d.avatar || d.photo ? (
                      <img
                        src={d.avatar || d.photo}
                        alt={d.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-500/20 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-teal-500 text-white font-bold text-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        {d.name.replace(/^Dr\.\s*/i, '').charAt(0)}
                      </div>
                    )}

                    {/* Doctor Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">
                          {d.name.startsWith('Dr.') ? d.name : `Dr. ${d.name}`}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                          {d.specialization}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {d.qualification ? `${d.qualification} • ` : ''}
                        {d.experience ? `${d.experience} yrs exp.` : 'Senior Consultant'}
                      </p>
                    </div>

                    {/* Checkmark */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Select Date & Time */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">2</span>
            <span>Select Date & Time</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Appointment Date *</label>
              <input
                required
                type="date"
                className="input"
                value={form.date}
                onChange={set('date')}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {form.dentist && form.date && (
              <div>
                <label className="label">Available Doctor Slots</label>
                {loadingSlots ? (
                  <p className="text-sm text-slate-400 py-2">Loading available slots...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    No open slots available for this doctor on the selected date. Please choose another date.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                    {slots.map(s => {
                      const isTimeSelected = form.timeSlot === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, timeSlot: s }))}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold border-2 transition-all ${isTimeSelected
                              ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:bg-primary-50/50'
                            }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Consultation & Notes */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">3</span>
            <span>Consultation Type & Symptoms</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className="label">Consultation / Treatment Type *</label>
              <select
                required
                className="input"
                value={form.treatmentType}
                onChange={set('treatmentType')}
              >
                <option value="">Select consultation type...</option>
                {TREATMENTS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Notes / Health Symptoms (Optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe your health symptoms, medical condition, or any special requests for the doctor..."
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {form.dentist && form.date && form.timeSlot && (
          <div className="card bg-gradient-to-r from-blue-50 to-teal-50/50 border-blue-200">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <span>📋</span> Booking Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-slate-500 font-medium uppercase">Doctor & Speciality</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {selectedDoctor?.name.startsWith('Dr.') ? selectedDoctor?.name : `Dr. ${selectedDoctor?.name}`}
                </p>
                <p className="text-xs text-primary-700 font-medium">{selectedDoctor?.specialization}</p>
              </div>

              <div className="bg-white/80 p-3 rounded-lg border border-blue-100">
                <p className="text-xs text-slate-500 font-medium uppercase">Date & Time</p>
                <p className="font-bold text-slate-900 mt-0.5">
                  {new Date(form.date).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-emerald-700 font-semibold">{form.timeSlot}</p>
              </div>

              {form.treatmentType && (
                <div className="bg-white/80 p-3 rounded-lg border border-blue-100 sm:col-span-2">
                  <p className="text-xs text-slate-500 font-medium uppercase">Service Type</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{form.treatmentType}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !form.dentist || !form.date || !form.timeSlot}
          className="btn-primary w-full justify-center py-3.5 text-base font-bold shadow-md hover:shadow-lg disabled:opacity-50"
        >
          {saving ? 'Confirming Appointment...' : '📅 Confirm Doctor Appointment'}
        </button>
      </form>
    </div>
  );
}
