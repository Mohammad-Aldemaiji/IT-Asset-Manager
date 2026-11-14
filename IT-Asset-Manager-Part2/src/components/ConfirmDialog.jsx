import { useEffect, useRef } from 'react';

/**
 * A small "Are you sure?" modal.
 * - Focus starts on Cancel, so pressing Enter by accident does not delete.
 * - Escape or clicking the dark background cancels.
 */
export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy = false, error = '' }) {
  const cancelRef = useRef(null);

  // Focus Cancel once, when the dialog opens
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-message">{message}</p>
        {error && <p role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" ref={cancelRef} onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
