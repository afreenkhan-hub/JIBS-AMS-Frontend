import { FiAlertTriangle, FiX } from 'react-icons/fi';

export function ConfirmModal({ open, title = 'Delete Record', message, onConfirm, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop-custom" role="presentation">
      <div className="action-modal action-modal-sm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="action-modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" type="button" onClick={onClose} title="Close">
            <FiX />
          </button>
        </div>
        <div className="confirm-message">
          <FiAlertTriangle />
          <p>{message}</p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
