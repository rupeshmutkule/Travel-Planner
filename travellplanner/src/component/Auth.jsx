import { useState, useEffect, useCallback } from 'react';
import config from '../config';

export default function Auth({ isOpen, onClose, onAuthSuccess, authFormData, updateAuthData, onOpenTerms, onOpenForgotPassword }) {
  const { isLogin, name, email, mobileNumber, password, confirmPassword, otp, otpSent, termsAccepted } = authFormData;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpBadgeVisible, setOtpBadgeVisible] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Escape key to close
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  // Clear error when switching between login/register
  useEffect(() => {
    setError('');
  }, [isLogin]);
  
  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    updateAuthData({ [field]: value });
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email first to receive OTP');
      return;
    }
    setError('');
    setSendingOtp(true);
    try {
      const res = await fetch(`${config.apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobileNumber, purpose: isLogin ? 'login' : 'register' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      updateAuthData({ otpSent: true });
      setOtpBadgeVisible(true);
      setTimeout(() => setOtpBadgeVisible(false), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (password.length < 6 || password.length > 14) {
        setError('Password must be between 6 and 14 characters');
        return;
      }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
      if (!termsAccepted) { setError('Please accept the Terms and Conditions'); return; }
    }

    setLoading(true);
    const endpoint = isLogin ? `${config.apiUrl}/auth/login` : `${config.apiUrl}/auth/register`;
    const body = isLogin ? { loginIdentifier, password } : { name, email, mobileNumber, password, otp };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      const userInfo = { _id: data._id, name: data.name, email: data.email, mobileNumber: data.mobileNumber, token: data.token };
      localStorage.setItem('user', JSON.stringify(userInfo));
      onAuthSuccess(userInfo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titleId = 'auth-modal-title';

  return (
    <div className="auth-overlay" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="auth-box">
        <button className="auth-close" onClick={onClose} aria-label="Close authentication dialog">✕</button>

        <h2 className="auth-heading" id={titleId}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="auth-subheading">{isLogin ? 'Login to access your travel history' : 'Sign up to start planning your journeys'}</p>

        {error && <div className="auth-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {isLogin ? (
            <div>
              <label htmlFor="login-id" className="sr-only">Email or Mobile Number</label>
              <input
                id="login-id"
                type="text" placeholder="Email or Mobile Number" required
                value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)}
                className="auth-input" autoComplete="username"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="reg-name" className="sr-only">Full Name</label>
                <input
                  id="reg-name"
                  type="text" placeholder="Full Name" required
                  value={name} onChange={e => handleFieldChange('name', e.target.value)}
                  className="auth-input"
                />
              </div>
              <div>
                <label htmlFor="reg-email" className="sr-only">Email Address</label>
                <input
                  id="reg-email"
                  type="email" placeholder="Email Address" required
                  value={email} onChange={e => handleFieldChange('email', e.target.value)}
                  className="auth-input" autoComplete="email"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="sr-only">Mobile Number</label>
                <input
                  id="reg-phone"
                  type="tel" placeholder="Mobile Number" required
                  value={mobileNumber} onChange={e => handleFieldChange('mobileNumber', e.target.value)}
                  className="auth-input"
                />
              </div>
              <div>
                <div className="otp-row">
                  <label htmlFor="reg-otp" className="sr-only">OTP</label>
                  <input
                    id="reg-otp"
                    type="text" placeholder="Enter OTP" required
                    value={otp} onChange={e => handleFieldChange('otp', e.target.value)}
                    className="auth-input" style={{ flex: 1 }}
                    disabled={!otpSent}
                  />
                  <button
                    type="button" className="otp-btn"
                    onClick={handleSendOTP} disabled={sendingOtp}
                  >
                    {sendingOtp ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                  </button>
                </div>
                {otpBadgeVisible && (
                  <span className="otp-badge">✔ If an account is registered with this email, an OTP has been sent securely.</span>
                )}
                {error && error === 'User with this email does not exist' && (
                  <span className="otp-error-badge">User with that email does not exist</span>
                )}
              </div>
            </>
          )}

          <div>
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <input
              id="auth-password"
              type="password" placeholder="Password (6-14 characters)" required
              value={password} onChange={e => handleFieldChange('password', e.target.value)}
              className="auth-input"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength="6"
              maxLength="14"
            />
          </div>

          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
              <button
                type="button"
                className="auth-toggle-btn"
                onClick={onOpenForgotPassword}
                style={{ fontSize: '0.875rem' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label htmlFor="auth-confirm-pw" className="sr-only">Confirm Password</label>
                <input
                  id="auth-confirm-pw"
                  type="password" placeholder="Confirm Password (6-14 characters)" required
                  value={confirmPassword} onChange={e => handleFieldChange('confirmPassword', e.target.value)}
                  className="auth-input" autoComplete="new-password"
                  minLength="6"
                  maxLength="14"
                />
              </div>
              <div className="terms-check-row">
                <input
                  type="checkbox" id="terms" className="terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                />
                <label htmlFor="terms" className="terms-label">
                  I agree to the{' '}
                  <button type="button" className="terms-link" onClick={onOpenTerms}>Terms and Conditions</button>
                </label>
              </div>
            </>
          )}

          <button
            type="submit" className="auth-submit"
            disabled={loading || (!isLogin && !otpSent)}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p className="auth-toggle-row">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            className="auth-toggle-btn"
            onClick={() => {
              setError(''); // Clear error when toggling
              updateAuthData({ isLogin: !isLogin, password: '', confirmPassword: '', otp: '', otpSent: false });
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
