import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'patient',
    password: '',
    confirmPassword: '',
  });

  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
    if (score === 4) return { score: 3, label: 'Good', color: 'bg-blue-500', text: 'text-blue-600' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getPasswordStrength(form.password);

  // Field validator
  const validateField = (name, value, currentForm = form) => {
    let err = '';
    const trimmed = typeof value === 'string' ? value.trim() : value;

    switch (name) {
      case 'name':
        if (!trimmed) {
          err = 'Full name is required';
        } else if (trimmed.length < 2) {
          err = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
          err = 'Name can only contain letters and spaces';
        }
        break;

      case 'email':
        const rawEmail = typeof value === 'string' ? value : '';
        if (!trimmed) {
          err = 'Email address is required';
        } else if (rawEmail !== trimmed) {
          err = 'Email address cannot contain leading or trailing spaces';
        } else if (/\s/.test(rawEmail)) {
          err = 'Email address cannot contain spaces';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          err = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (trimmed && !/^[0-9+\-\s()]{10,15}$/.test(trimmed)) {
          err = 'Please enter a valid 10-digit phone number';
        }
        break;

      case 'password':
        if (!value) {
          err = 'Password is required';
        } else if (value.length < 6) {
          err = 'Password must be at least 6 characters';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          err = 'Please confirm your password';
        } else if (value !== currentForm.password) {
          err = 'Passwords do not match';
        }
        break;

      default:
        break;
    }
    return err;
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    setServerError('');

    // If user modified password, re-check confirmPassword if touched
    if (field === 'password' && touched.confirmPassword && form.confirmPassword) {
      const confirmErr = validateField('confirmPassword', form.confirmPassword, updatedForm);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }));
    }

    // Live validation if field was touched
    if (touched[field]) {
      const err = validateField(field, value, updatedForm);
      setErrors((prev) => ({ ...prev, [field]: err }));
    } else if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const newErrors = {};
    const fields = ['name', 'email', 'phone', 'password', 'confirmPassword'];
    fields.forEach((f) => {
      const err = validateField(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) return;

    try {
      const user = await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        password: form.password,
      });

      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'dentist') {
        navigate('/dentist/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-blue-200">
            🩺
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join DocHub to book doctors & manage your health</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 flex items-start gap-2.5">
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="label">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  className={`input pl-10 ${errors.name
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : touched.name && form.name && !errors.name
                        ? 'border-emerald-400'
                        : ''
                    }`}
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  autoComplete="name"
                />
                {touched.name && form.name && !errors.name && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="label">Email Address *</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  className={`input pl-10 ${errors.email
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : touched.email && form.email && !errors.email
                        ? 'border-emerald-400'
                        : ''
                    }`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  autoComplete="email"
                />
                {touched.email && form.email && !errors.email && (
                  <CheckCircleIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number (Optional)</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  className={`input pl-10 ${errors.phone ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
                    }`}
                  placeholder="e.g. 9876543210"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="label">I am registering as</label>
              <select
                className="input cursor-pointer"
                value={form.role}
                onChange={handleChange('role')}
              >
                <option value="patient">Patient (Book appointments & view bills)</option>
                <option value="dentist">Dentist (Manage patients & treatments)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''
                    }`}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  onClick={() => setShowPw((p) => !p)}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-transparent'
                        } w-1/4 rounded-full`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-transparent'
                        } w-1/4 rounded-full`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-transparent'
                        } w-1/4 rounded-full`}
                    />
                    <div
                      className={`h-full transition-all duration-300 ${strength.score >= 4 ? strength.color : 'bg-transparent'
                        } w-1/4 rounded-full`}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password *</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showCPw ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${errors.confirmPassword
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : touched.confirmPassword && form.confirmPassword && !errors.confirmPassword
                        ? 'border-emerald-400'
                        : ''
                    }`}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  onClick={() => setShowCPw((p) => !p)}
                  title={showCPw ? 'Hide password' : 'Show password'}
                >
                  {showCPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>

              {errors.confirmPassword ? (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.confirmPassword}
                </p>
              ) : form.confirmPassword && form.password === form.confirmPassword ? (
                <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1 font-medium">
                  <CheckCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  Passwords match
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-base mt-2 shadow-sm"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500 border-t border-gray-100 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
