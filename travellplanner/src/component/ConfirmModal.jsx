import { memo, useEffect, useRef, useCallback } from 'react';

function ConfirmModal({ isOpen, icon, title, description, cancelLabel, confirmLabel, confirmVariant, onCancel, onConfirm }) {
  const confirmRef = useRef(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onCancel();
  }, [onCancel]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      confirmRef.current?.focus();
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="alertdialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
      <div className="modal-box">
        <div className="modal-icon" aria-hidden="true">{icon}</div>
        <h3 className="modal-title" id="modal-title">{title}</h3>
        <p className="modal-desc" id="modal-desc">{description}</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onCancel}>{cancelLabel}</button>
          <button
            ref={confirmRef}
            className={`modal-btn ${confirmVariant === 'danger' ? 'modal-btn--danger' : 'modal-btn--primary'}`}
            onClick={onConfirm}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export default memo(ConfirmModal);
