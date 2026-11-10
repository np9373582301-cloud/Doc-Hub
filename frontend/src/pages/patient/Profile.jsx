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
  HeartIcon,
  PhoneIcon,
  HomeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export default function PatientProfile() {
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    bloodGroup: '',
    address: '',
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    photo: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/patients/me')
      .then((r) => {
        const p = r.data.data;
        setPatient(p);
        setForm({
          name: p.name || '',
          email: p.email || '',
          phone: p.phone || '',
          dob: p.dob ? p.dob.split('T')[0] : '',
          gender: p.gender || 'Male',
          bloodGroup: p.bloodGroup || '',
          address: p.address || '',
          allergies: p.allergies ? p.allergies.join(', ') : '',
          currentMedications: p.currentMedications || '',
          medicalHistory: p.medicalHistory || '',
          photo: p.photo || p.avatar || '',
          emergencyContactName: p.emergencyContact?.name || '',
          emergencyContactPhone: p.emergencyContact?.phone || '',
          emergencyContactRelation: p.emergencyContact?.relation || '',
        });
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        toast.error('Failed to load profile details');
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Local File Upload with Client-Side Canvas Compression
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
        // Downscale to max 320x320 for instant storage and fast loading
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
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

        setForm((prev) => ({
          ...prev,
          photo: compressedDataUrl,
        }));
        toast.success('Photo chosen! Click "Save Profile Changes" below to apply.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setForm((prev) => ({ ...prev, photo: '' }));
    toast.success('Photo removed.');
  };

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        dob: form.dob || undefined,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        address: form.address,
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        currentMedications: form.currentMedications,
        medicalHistory: form.medicalHistory,
        photo: form.photo || '',
        avatar: form.photo || '',
        emergencyContact: {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relation: form.emergencyContactRelation,
        },
      };

      const { data } = await api.put(`/patients/${patient._id}`, payload);
      setPatient(data.data);

      // Sync updated name and avatar with AuthContext for live sidebar & header updates
      if (updateUser) {
        updateUser({
          name: form.name.trim(),
          avatar: form.photo || '',
          photo: form.photo || '',
          phone: form.phone.trim(),
        });
      }

      toast.success('Profile and photo saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your profile..." />;
  if (!patient) return <div className="card text-center text-slate-400">Profile record not found</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span>My Profile</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Active Patient
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your personal information, profile photo, and medical records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            ID: {patient.patientId || 'PAT-0001'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. PHOTO & AVATAR SECTION CARD */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-base">
            <CameraIcon className="w-5 h-5 text-primary-600" />
            <span>Profile Photo & Avatar</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Current Photo Frame */}
            <div className="relative group flex-shrink-0">
              {form.photo ? (
                <img
                  src={form.photo}
                  alt={form.name}
                  onError={() => setForm((prev) => ({ ...prev, photo: '' }))}
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-primary-500/20 shadow-md"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-extrabold text-3xl ring-4 ring-emerald-500/20 shadow-md">
                  {form.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
              )}

              {/* Upload trigger overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <CameraIcon className="w-6 h-6" />
                <span className="text-[10px] font-semibold mt-1">Change</span>
              </button>
            </div>

            {/* Photo Action Controls */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-slate-800">Patient Photo</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload your genuine photo. Visible on your appointment slip and doctor chart.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary text-xs py-2 px-3.5 shadow-sm"
                >
                  <CameraIcon className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>

                {form.photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-secondary text-xs py-2 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. BASIC PERSONAL DETAILS */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-base">
            <IdentificationIcon className="w-5 h-5 text-primary-600" />
            <span>Basic Personal Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. Jaypal Pandit"
                value={form.name}
                onChange={set('name')}
              />
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input
                type="tel"
                required
                className="input"
                placeholder="e.g. 9876543210"
                value={form.phone}
                onChange={set('phone')}
              />
            </div>

            <div>
              <label className="label">Email Address *</label>
              <input
                type="email"
                required
                className="input"
                placeholder="jaypal@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            <div>
              <label className="label">Date of Birth</label>
              <input
                type="date"
                className="input"
                value={form.dob}
                onChange={set('dob')}
              />
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                className="input cursor-pointer"
                value={form.gender}
                onChange={set('gender')}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">Blood Group</label>
              <select
                className="input cursor-pointer"
                value={form.bloodGroup}
                onChange={set('bloodGroup')}
              >
                <option value="">Select Blood Group</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="label">Residential Address</label>
              <textarea
                rows={2}
                className="input resize-none"
                placeholder="Flat / Street address, City, State, PIN..."
                value={form.address}
                onChange={set('address')}
              />
            </div>
          </div>
        </div>

        {/* 3. MEDICAL & DENTAL HISTORY */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-base">
            <HeartIcon className="w-5 h-5 text-rose-500" />
            <span>Medical & Health Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Known Drug Allergies (comma-separated)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Penicillin, Latex, Local Anesthetic"
                value={form.allergies}
                onChange={set('allergies')}
              />
            </div>

            <div>
              <label className="label">Current Medications</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Blood pressure tablets, Aspirin"
                value={form.currentMedications}
                onChange={set('currentMedications')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Medical History / Past Conditions</label>
              <textarea
                rows={2}
                className="input resize-none"
                placeholder="e.g. Diabetes, Hypertension, Asthma, Past surgeries, Bleeding disorders..."
                value={form.medicalHistory}
                onChange={set('medicalHistory')}
              />
            </div>
          </div>
        </div>

        {/* 4. EMERGENCY CONTACT */}
        <div className="card p-6 border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-800 font-bold text-base">
            <PhoneIcon className="w-5 h-5 text-amber-500" />
            <span>Emergency Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Contact Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Sunita Pandit"
                value={form.emergencyContactName}
                onChange={set('emergencyContactName')}
              />
            </div>

            <div>
              <label className="label">Contact Phone</label>
              <input
                type="tel"
                className="input"
                placeholder="e.g. 9811223344"
                value={form.emergencyContactPhone}
                onChange={set('emergencyContactPhone')}
              />
            </div>

            <div>
              <label className="label">Relation</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Spouse, Parent, Sibling"
                value={form.emergencyContactRelation}
                onChange={set('emergencyContactRelation')}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary-500/20 disabled:opacity-60"
          >
            <CheckCircleIcon className="w-5 h-5" />
            <span>{saving ? 'Saving Profile Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
