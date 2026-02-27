import { useState, useEffect, useCallback } from 'react';
import config from '../config';

export default function ForgotPassword({ isOpen, onClose, onBackToLogin }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');
      setEmailVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setSuccessMessage('');
    setVerifyingEmail(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/verify-email-exists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        setEmailVerified(false);
        throw new Error(data.message || 'Failed to verify email');
      }
      
      const data = await res.json();
      setEmailVerified(true);
      setSuccessMessage('User verified! You can now send OTP.');
    } catch (err) {
      setError(err.message || 'Failed to verify email. Please try again.');
      setEmailVerified(false);
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email || !emailVerified) {
      setError('Please verify your email first');
      return;
    }
    setError('');
    setSuccessMessage('');
    setSendingOtp(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'forgot-password' }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to send OTP');
      }
      
      const data = await res.json();
      setStep(2);
      setSuccessMessage('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/verify-forgot-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid OTP');
      }
      
      const data = await res.json();
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6 || newPassword.length > 14) {
      setError('Password must be between 6 and 14 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to reset password');
      }
      
      const data = await res.json();
      alert('Password reset successfully! Please login with your new password.');
      onBackToLogin();
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const titleId = 'forgot-password-modal-title';

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="auth-box">
        <button className="auth-close" onClick={onClose} aria-label="Close forgot password dialog">✕</button>

        <h2 className="auth-heading" id={titleId}>Reset Password</h2>
        <p className="auth-subheading">
          {step === 1 && 'Enter your registered email and verify'}
          {step === 2 && 'Enter the OTP sent to your email'}
          {step === 3 && 'Set your new password'}
        </p>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {successMessage && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.2)',
            color: '#22c55e',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px'
          }} role="status">
            ✓ {successMessage}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleVerifyEmail} className="auth-form">
            <div>
              <label htmlFor="forgot-email" className="sr-only">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                placeholder="Enter your registered email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailVerified(false);
                  setError('');
                  setSuccessMessage('');
                }}
                className="auth-input"
                autoComplete="email"
              />
            </div>
            <button 
              type="submit" 
              className="auth-submit" 
              disabled={verifyingEmail}
              style={{ marginBottom: '10px' }}
            >
              {verifyingEmail ? 'Verifying...' : 'Verify Email'}
            </button>
            <button 
              type="button" 
              className="auth-submit" 
              disabled={!emailVerified || sendingOtp}
              onClick={handleSendOTP}
              style={{
                opacity: !emailVerified ? 0.5 : 1,
                cursor: !emailVerified ? 'not-allowed' : 'pointer'
              }}
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div>
              <label htmlFor="forgot-otp" className="sr-only">OTP</label>
              <input
                id="forgot-otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="auth-input"
                maxLength="6"
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={() => {
                setStep(1);
                setEmailVerified(false);
                setError('');
                setSuccessMessage('');
              }}
              style={{ marginTop: '10px' }}
            >
              Change Email / Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div>
              <label htmlFor="new-password" className="sr-only">New Password</label>
              <input
                id="new-password"
                type="password"
                placeholder="New Password (6-14 characters)"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="auth-input"
                autoComplete="new-password"
                minLength="6"
                maxLength="14"
              />
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm New Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                autoComplete="new-password"
                minLength="6"
                maxLength="14"
              />
            </div>
            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="auth-toggle-row">
          <button className="auth-toggle-btn" onClick={onBackToLogin}>
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}
