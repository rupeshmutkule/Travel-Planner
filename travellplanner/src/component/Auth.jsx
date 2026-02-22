import { useState } from 'react';

export default function Auth({ isOpen, onClose, onAuthSuccess, authFormData, updateAuthData, onOpenTerms }) {
  const { isLogin, name, email, mobileNumber, password, confirmPassword, otp, otpSent, termsAccepted } = authFormData;
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpBadgeVisible, setOtpBadgeVisible] = useState(false);
  const [loginIdentifier, setLoginIdentifier] = useState('');

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
      const res = await fetch('/api/auth/send-otp', {
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
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (!termsAccepted) {
        setError('Please accept the Terms and Conditions');
        return;
      }
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin
      ? { loginIdentifier, password }
      : { name, email, mobileNumber, password, otp };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // Only store essential info
      const userInfo = {
        _id: data._id,
        name: data.name,
        email: data.email,
        mobileNumber: data.mobileNumber,
        token: data.token
      };

      localStorage.setItem('user', JSON.stringify(userInfo));
      onAuthSuccess(userInfo);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'rgba(20, 20, 30, 0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px', padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', fontSize: '20px'
          }}
        >✕</button>

        <h2 style={{
          fontSize: '24px', color: '#fff', marginBottom: '8px', textAlign: 'center',
          fontFamily: 'Georgia, serif'
        }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p style={{
          fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '30px', textAlign: 'center'
        }}>{isLogin ? 'Login to access your travel history' : 'Sign up to start planning your journeys'}</p>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5', padding: '12px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLogin ? (
            <input
              type="text" placeholder="Email or Mobile Number" required
              value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)}
              style={inputStyle}
              autoComplete="username"
            />
          ) : (
            <>
              <input
                type="text" placeholder="Full Name" required
                value={name} onChange={e => handleFieldChange('name', e.target.value)}
                style={inputStyle}
              />
              <input
                type="email" placeholder="Email Address" required
                value={email} onChange={e => handleFieldChange('email', e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
              <input
                type="tel" placeholder="Mobile Number" required
                value={mobileNumber} onChange={e => handleFieldChange('mobileNumber', e.target.value)}
                style={inputStyle}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text" placeholder="Enter OTP" required
                    value={otp} onChange={e => handleFieldChange('otp', e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                    disabled={!otpSent}
                  />
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={sendingOtp}
                    style={{
                      padding: '0 15px', borderRadius: '12px', border: 'none',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                    }}
                  >
                    {sendingOtp ? 'Sending...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
                  </button>
                </div>
                {otpBadgeVisible && (
                  <span style={{ color: '#22c55e', fontSize: '12px', textAlign: 'right', fontWeight: '500', animation: 'fadeInRight 0.5s ease' }}>
                    ✔ If an account is registered with this email, an OTP has been sent securely.
                  </span>
                )}
                {error && error === 'User with this email does not exist' && (
                  <span style={{ color: '#ef4444', fontSize: '12px', textAlign: 'right', fontWeight: '500', animation: 'fadeInRight 0.5s ease' }}>
                    User with that email does not exist
                  </span>
                )}
              </div>
            </>
          )}

          <input
            type="password" placeholder="Password" required
            value={password} onChange={e => handleFieldChange('password', e.target.value)}
            style={inputStyle}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {!isLogin && (
            <>
              <input
                type="password" placeholder="Confirm Password" required
                value={confirmPassword} onChange={e => handleFieldChange('confirmPassword', e.target.value)}
                style={inputStyle}
                autoComplete="new-password"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => handleFieldChange('termsAccepted', e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="terms" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>
                  I agree to the <button type="button" onClick={onOpenTerms} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>Terms and Conditions</button>
                </label>
              </div>
            </>
          )}

          <button
            type="submit" disabled={loading || (!isLogin && !otpSent)}
            style={{
              padding: '14px', borderRadius: '12px', border: 'none',
              background: (loading || (!isLogin && !otpSent)) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #38bdf8, #6366f1)',
              color: '#fff', fontWeight: '600', cursor: (loading || (!isLogin && !otpSent)) ? 'default' : 'pointer',
              marginTop: '10px', transition: 'all 0.3s ease',
              opacity: (loading || (!isLogin && !otpSent)) ? 0.5 : 1
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <p style={{
          textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)'
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => updateAuthData({ isLogin: !isLogin, password: '', confirmPassword: '', otp: '', otpSent: false, error: '' })}
            style={{
              background: 'none', border: 'none', color: '#38bdf8',
              cursor: 'pointer', padding: 0, fontSize: '13px', fontWeight: '600'
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '14px 18px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color 0.3s ease'
};
