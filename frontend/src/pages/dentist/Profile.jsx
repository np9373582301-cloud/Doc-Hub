import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  CameraIcon,
  TrashIcon,
  UserCircleIcon,
  CheckCircleIcon,
  IdentificationIcon,
  ClockIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiology (Heart Specialist)',
  'Dermatology (Skin & Hair)',
  'Orthopedics (Bones & Joints)',
  'Pediatrics (Child Health)',
  'Neurology (Brain & Nerves)',
  'Gynecology & Obstetrics',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology (Eye Specialist)',
  'Dental Care & Oral Surgery',
  'Psychiatry & Mental Health',
  'Pulmonology (Lungs & Chest)',
  'Gastroenterology',
  'Oncology (Cancer Care)',
  'Urology',
];

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [dentist, setDentist] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: 'General Physician',
    qualification: '',
    experience: 0,
    licenseNumber: '',
    bio: '',
    photo: '',
  });

  const [availability, setAvailability] = useState(
    DEFAULT_DAYS.map((day) => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: day !== 'Sunday',
    }))
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/dentists/me')
      .then((r) => {
        const d = r.data.data;
        setDentist(d);
        setForm({
          name: d.name || user?.name || '',
          email: d.email || user?.email || '',
          phone: d.phone || user?.phone || '',
          specialization: d.specialization || 'General Physician',
          qualification: d.qualification || '',
          experience: d.experience || 0,
          licenseNumber: d.licenseNumber || '',
          bio: d.bio || '',
          photo: d.photo || d.avatar || user?.avatar || '',
        });

        if (Array.isArray(d.availability) && d.availability.length > 0) {
          // Merge with default 7 days to guarantee every day exists
          const merged = DEFAULT_DAYS.map((dayName) => {
            const found = d.availability.find((item) => item.day === dayName);
            if (found) {
              return {
                day: dayName,
                startTime: found.startTime || '09:00',
                endTime: found.endTime || '17:00',
                isAvailable: found.isAvailable !== false,
              };
            }
            return {
              day: dayName,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: dayName !== 'Sunday',
            };
          });
          setAvailability(merged);
        }
      })
      .catch((err) => {
        console.error('Failed to load doctor profile:', err);
        toast.error('Failed to load profile details');
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Handle local image upload with client-side canvas compression
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setForm((prev) => ({ ...prev, photo: compressedBase64 }));
        toast.success('Photo chosen! Click "Save Doctor Profile" to finalize.');
      };
      img.src = event.target?.result;
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setForm((prev) => ({ ...prev, photo: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success('Photo removed.');
  };

  const handleAvailabilityChange = (index, field, value) => {
    setAvailability((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const applyPresetHours = () => {
    setAvailability((prev) =>
      prev.map((item) => ({
        ...item,
        startTime: '09:00',
        endTime: '18:00',
        isAvailable: item.day !== 'Sunday',
      }))
    );
    toast.success('Set Mon–Sat: 9:00 AM – 6:00 PM (Sunday Off)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dentist?._id) {
      toast.error('Doctor profile record not found.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        specialization: form.specialization,
        qualification: form.qualification.trim(),
        experience: Number(form.experience) || 0,
        licenseNumber: form.licenseNumber.trim(),
        bio: form.bio.trim(),
        photo: form.photo,
        avatar: form.photo,
        availability,
      };

      const res = await api.put(`/dentists/${dentist._id}`, payload);
      const updated = res.data.data;
      setDentist(updated);

      // Instant sync with auth context so header avatar and sidebar update live
      if (updateUser) {
        updateUser({
          ...user,
          name: payload.name,
          phone: payload.phone,
          avatar: payload.photo,
          photo: payload.photo,
        });
      }

      toast.success('Doctor profile updated successfully!');
    } catch (err) {
      console.error('Failed to update doctor profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading Doctor Profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <h1 className="text-2xl font-bold text-slate-800">Doctor Profile & Settings</h1>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage your doctor credentials, clinical specialization, photo, and consultation schedule
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            Active Specialist
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. PHOTO & AVATAR CARD */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CameraIcon className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-base">Doctor Profile Photo</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.name}
                  onError={() => setForm((prev) => ({ ...prev, photo: '' }))}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-teal-500/20 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white font-extrabold text-3xl flex items-center justify-center ring-4 ring-teal-500/10 shadow-md">
                  {form.name ? form.name.replace(/^Dr\.\s*/i, '').charAt(0).toUpperCase() : 'D'}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs font-semibold gap-1 cursor-pointer"
                title="Change Photo"
              >
                <CameraIcon className="w-5 h-5" />
                Change
              </button>
            </div>

            {/* Actions & Instructions */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {form.name || 'Your Doctor Profile'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your genuine professional photo so patients can easily recognize you.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-xs py-2 px-3.5 gap-1.5 shadow-sm"
                >
                  <CameraIcon className="w-4 h-4" />
                  Upload Photo
                </button>

                {form.photo && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="btn-secondary text-xs py-2 px-3 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. PROFESSIONAL & BASIC DETAILS */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <IdentificationIcon className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-base">Professional & Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="label">Doctor Full Name *</label>
              <input
                required
                type="text"
                className="input"
                placeholder="e.g. Dr. Anurag Prajapati"
                value={form.name}
                onChange={setField('name')}
              />
              <p className="text-[11px] text-slate-400 mt-1">Include Dr. prefix as preferred.</p>
            </div>

            {/* Email Address */}
            <div>
              <label className="label">Email Address (Login Account)</label>
              <input
                disabled
                type="email"
                className="input bg-slate-50 text-slate-500 cursor-not-allowed"
                value={form.email}
              />
              <p className="text-[11px] text-slate-400 mt-1">Email is linked to your login credentials.</p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="label">Contact Phone Number *</label>
              <input
                required
                type="tel"
                className="input"
                placeholder="e.g. +91 98765 43210"
                value={form.phone}
                onChange={setField('phone')}
              />
            </div>

            {/* Specialization */}
            <div>
              <label className="label">Clinical Specialization *</label>
              <select
                required
                className="input"
                value={form.specialization}
                onChange={setField('specialization')}
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Qualification */}
            <div>
              <label className="label">Medical Degrees / Qualifications *</label>
              <input
                required
                type="text"
                className="input"
                placeholder="e.g. MBBS, MD (Medicine), DM Cardiology"
                value={form.qualification}
                onChange={setField('qualification')}
              />
            </div>

            {/* Experience */}
            <div>
              <label className="label">Years of Clinical Experience *</label>
              <input
                required
                type="number"
                min="0"
                max="60"
                className="input"
                placeholder="e.g. 10"
                value={form.experience}
                onChange={setField('experience')}
              />
            </div>

            {/* License Number */}
            <div className="md:col-span-2">
              <label className="label">Medical Council Registration / License Number *</label>
              <input
                required
                type="text"
                className="input font-mono text-sm"
                placeholder="e.g. MCI-2015-99881 or DCI-2018-1234"
                value={form.licenseNumber}
                onChange={setField('licenseNumber')}
              />
            </div>

            {/* Bio / Summary */}
            <div className="md:col-span-2">
              <label className="label">Professional Bio / About Doctor (Optional)</label>
              <textarea
                rows={3}
                className="input resize-none"
                placeholder="Brief summary of your clinical expertise, hospital associations, and patient care approach..."
                value={form.bio}
                onChange={setField('bio')}
              />
            </div>
          </div>
        </div>

        {/* 3. WEEKLY AVAILABILITY & CONSULTATION HOURS */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-teal-600" />
              <h2 className="font-bold text-slate-800 text-base">Weekly Consultation Hours</h2>
            </div>
            <button
              type="button"
              onClick={applyPresetHours}
              className="text-xs text-teal-700 hover:text-teal-800 font-semibold bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-colors border border-teal-200 self-start sm:self-auto"
            >
              Set Mon–Sat: 9 AM – 6 PM
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Patients can only book appointment slots during your available hours.
          </p>

          <div className="divide-y divide-slate-100">
            {availability.map((item, index) => (
              <div
                key={item.day}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Day & Available Toggle */}
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${item.day}`}
                    checked={item.isAvailable}
                    onChange={(e) =>
                      handleAvailabilityChange(index, 'isAvailable', e.target.checked)
                    }
                    className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                  />
                  <label
                    htmlFor={`day-${item.day}`}
                    className={`text-sm font-semibold cursor-pointer ${
                      item.isAvailable ? 'text-slate-800' : 'text-slate-400 line-through'
                    }`}
                  >
                    {item.day}
                  </label>
                </div>

                {/* Hours Picker */}
                {item.isAvailable ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      className="input py-1 px-2.5 text-xs w-32"
                      value={item.startTime}
                      onChange={(e) =>
                        handleAvailabilityChange(index, 'startTime', e.target.value)
                      }
                    />
                    <span className="text-slate-400 text-xs">to</span>
                    <input
                      type="time"
                      className="input py-1 px-2.5 text-xs w-32"
                      value={item.endTime}
                      onChange={(e) =>
                        handleAvailabilityChange(index, 'endTime', e.target.value)
                      }
                    />
                  </div>
                ) : (
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                    Day Off / Clinic Closed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. SUBMIT BUTTON */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary py-3 px-8 text-base font-bold shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : '💾 Save Doctor Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

