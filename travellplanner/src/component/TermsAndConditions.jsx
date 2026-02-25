import { useEffect, useCallback } from 'react';

export default function TermsAndConditions({ isOpen, onClose, onAccept }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="terms-overlay" role="dialog" aria-modal="true" aria-labelledby="terms-title">
      <div className="terms-box">
        <button className="terms-close" onClick={onClose} aria-label="Close terms and conditions">✕</button>

        <h1 className="terms-title" id="terms-title">Terms and Conditions</h1>

        <div className="terms-content">
          <section>
            <h2 className="terms-section-heading">1. Acceptance of Terms</h2>
            <p>By accessing and using Travell Planner, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
          </section>

          <section>
            <h2 className="terms-section-heading">2. Use of Service</h2>
            <p>Our service provides AI-generated travel plans. While we strive for accuracy, we cannot guarantee the availability or quality of suggested locations, hotels, or activities. Users are responsible for verifying all travel details.</p>
          </section>

          <section>
            <h2 className="terms-section-heading">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="terms-section-heading">4. Privacy Policy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>
          </section>

          <section>
            <h2 className="terms-section-heading">5. Limitation of Liability</h2>
            <p>Travell Planner shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services.</p>
          </section>
        </div>

        <div className="terms-accept-wrap">
          <button className="terms-accept-btn" onClick={onAccept}>I Accept &amp; Continue</button>
        </div>

        <div className="terms-footer">
          © 2026 Travell Planner. All rights reserved.
        </div>
      </div>
    </div>
  );
}
