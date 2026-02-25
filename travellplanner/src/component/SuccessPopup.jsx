import { memo } from 'react';

function SuccessPopup({ show, userName }) {
  if (!show) return null;

  return (
    <div className="success-popup" role="status" aria-live="polite">
      <div className="success-icon" aria-hidden="true">✓</div>
      <div>
        <div className="success-title">Welcome, {userName}!</div>
        <div className="success-subtitle">Registration Successful</div>
      </div>
    </div>
  );
}

export default memo(SuccessPopup);
