import React, { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await api.put('/auth/profile', profileForm); toast.success('Profile updated'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try { await api.put('/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }); toast.success('Password changed'); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setSavingPw(false); }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-2xl font-bold text-slate-800">Settings</h1><p className="text-slate-500 text-sm">Manage your account settings</p></div>

      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Profile Information</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div><label className="label">Full Name</label><input className="input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
          <div><label className="label">Email</label><input className="input bg-gray-50" value={user?.email} disabled /></div>
          <div><label className="label">Phone</label><input className="input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} /></div>
          <div><label className="label">Role</label><input className="input bg-gray-50 capitalize" value={user?.role} disabled /></div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Update Profile'}</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-700 mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          <div><label className="label">Current Password</label><input type="password" className="input" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
          <div><label className="label">New Password</label><input type="password" className="input" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
          <div><label className="label">Confirm Password</label><input type="password" className="input" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} /></div>
          <button type="submit" className="btn-primary" disabled={savingPw}>{savingPw ? 'Changing...' : 'Change Password'}</button>
        </form>
      </div>

      <div className="card bg-blue-50 border-blue-100">
        <h2 className="font-semibold text-blue-800 mb-2">Clinic Information</h2>
        <div className="space-y-2 text-sm text-blue-700">
          <p>🏥 <strong>Clinic Name:</strong> DocHub Multi-Speciality Clinic</p>
          <p>📍 <strong>Address:</strong> 102 Healthcare Plaza, Central Avenue, Mumbai 400001</p>
          <p>📞 <strong>Phone:</strong> +91 98765 43210</p>
          <p>✉️ <strong>Email:</strong> care@dochub.com</p>
          <p>⏰ <strong>Hours:</strong> Mon–Sat, 9:00 AM – 6:00 PM</p>
        </div>
      </div>
    </div>
  );
}
