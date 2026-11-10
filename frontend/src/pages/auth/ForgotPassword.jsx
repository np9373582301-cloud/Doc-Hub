import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  ArrowLeftIcon,
  KeyIcon,
  LockClosedIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Step 1: email, Step 2: otp, Step 3: new password, Step 4: success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devHint, setDevHint] = useState('');

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) return setError('Please enter your email address');
    if (!/\S+@\S+\.\S+/.test(email)) return setError('Please enter a valid email address');

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/send-otp', { email });
      if (data.success) {
        toast.success('6-digit OTP code sent to your email!');
        setDevHint(data.hint || '');
        setStep(2);
        setCountdown(60);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please check your email.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError('Please enter the 6-digit OTP code');

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      if (data.success) {
        toast.success('OTP verified!');
        setStep(3);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!password) return setError('New password is required');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (password !== confirmPassword) return setError('Passwords do not match');

    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password-otp', {
        email,
        otp,
        password,
      });
      if (data.success) {
        setStep(4);
        toast.success('Password updated successfully!');
        setTimeout(() => navigate('/'), 3000);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-blue-200">
            🩺
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Enter Verification Code'}
            {step === 3 && 'Create New Password'}
            {step === 4 && 'Password Reset Complete!'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {step === 1 && 'Enter your email to receive a 6-digit OTP'}
            {step === 2 && `Code sent to ${email}`}
            {step === 3 && 'Choose a strong password for your account'}
            {step === 4 && 'Redirecting to login...'}
          </p>
        </div>

        {/* Progress indicator */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-8 h-2 rounded-full transition-colors ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-2 rounded-full transition-colors ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          </div>
        )}

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="label">Registered Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    className="input pl-10"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-2.5 text-base"
              >
                {loading ? 'Sending Code...' : 'Send 6-Digit OTP'}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {devHint && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-2.5 text-center font-mono font-bold">
                  {devHint}
                </div>
              )}

              <div>
                <label className="label text-center">6-Digit Verification Code</label>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    className="input pl-10 text-center tracking-[8px] font-mono font-bold text-xl"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtp(val);
                      setError('');
                    }}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">Code is valid for 10 minutes</p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary justify-center py-2.5 text-base"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={countdown > 0 || loading}
                  onClick={handleSendOtp}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium disabled:text-slate-400"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Didn\'t receive code? Resend'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showCPw ? 'text' : 'password'}
                    className="input pl-10 pr-10"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    onClick={() => setShowCPw(!showCPw)}
                  >
                    {showCPw ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-2.5 text-base"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">All Done!</h2>
              <p className="text-slate-500 text-sm mb-6">Your password has been reset successfully.</p>
              <Link to="/login" className="btn-primary justify-center py-2.5 w-full">
                Go to Sign In
              </Link>
            </div>
          )}

          {/* Footer Back Button */}
          {step !== 4 && (
            <div className="mt-6 text-center border-t border-gray-100 pt-4">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => { setStep(step - 1); setError(''); }}
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
