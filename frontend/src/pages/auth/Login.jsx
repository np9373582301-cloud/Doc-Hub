import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function Login() {
  const { login, loading } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Validate a single field
  const validateField = (name, value) => {
    let err = '';
    if (name === 'email') {
      const raw = typeof value === 'string' ? value : '';
      const trimmed = raw.trim();
      if (!trimmed) {
        err = 'Email address is required';
      } else if (raw !== trimmed) {
        err = 'Email address cannot contain leading or trailing spaces';
      } else if (/\s/.test(raw)) {
        err = 'Email address cannot contain spaces';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        err = 'Please enter a valid email address (e.g. name@example.com)';
      }
    } else if (name === 'password') {
      if (!value) {
        err = 'Password is required';
      } else if (value.length < 6) {
        err = 'Password must be at least 6 characters';
      }
    }
    return err;
  };

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (field === 'email') {
      // Disallow space keystrokes or automatically trim leading spaces
      value = value.replace(/^\s+/, '');
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError('');
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field) => () => {
    let val = form[field];
    if (field === 'email' && typeof val === 'string') {
      // Automatically trim trailing and leading spaces on blur
      val = val.trim();
      setForm((prev) => ({ ...prev, email: val }));
    }
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const validateAll = () => {
    const cleanEmail = (form.email || '').trim();
    const newErrors = {};
    const emailErr = validateField('email', cleanEmail);
    const passErr = validateField('password', form.password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const cleanEmail = (form.email || '').trim();
    if (form.email !== cleanEmail) {
      setForm((prev) => ({ ...prev, email: cleanEmail }));
    }

    if (!validateAll()) return;

    try {
      const user = await login(cleanEmail, form.password);
      if (user.role === 'admin' || user.role === 'superadmin' || user.isSuperAdmin) {
        window.location.href = '/admin/dashboard';
      } else if (user.role === 'dentist') {
        window.location.href = '/dentist/dashboard';
      } else {
        window.location.href = '/patient/dashboard';
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Home
        </Link>

        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-200">
            🩺
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to DocHub</h1>
          <p className="text-slate-500 mt-1">Sign in to your doctor or patient account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Prominent Authentication Error Alert Banner */}
          {serverError && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 text-red-800 rounded-xl p-3.5 flex items-start gap-3 shadow-sm animate-fadeIn">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900 uppercase tracking-wide">Invalid Credentials</p>
                <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{serverError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <EnvelopeIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${serverError ? 'text-red-400' : 'text-slate-400'}`} />
                <input
                  type="email"
                  className={`input pl-10 ${
                    errors.email || serverError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/10'
                      : form.email && !errors.email
                      ? 'border-emerald-300'
                      : ''
                  }`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                      setErrors((prev) => ({ ...prev, email: 'Email address cannot contain spaces' }));
                    }
                  }}
                  onPaste={(e) => {
                    const text = e.clipboardData?.getData('text');
                    if (text) {
                      e.preventDefault();
                      const clean = text.trim();
                      setForm((prev) => ({ ...prev, email: clean }));
                      const err = validateField('email', clean);
                      setErrors((prev) => ({ ...prev, email: err }));
                    }
                  }}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  className={`input pl-10 pr-10 ${
                    errors.password || serverError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50/10'
                      : ''
                  }`}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                  <ExclamationCircleIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-2.5 text-base shadow-sm"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500 border-t border-gray-100 pt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
