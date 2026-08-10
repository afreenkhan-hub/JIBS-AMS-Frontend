import { FiUpload, FiX } from 'react-icons/fi';
 
export function ImportModal({ open, title = 'Import Records', onFile, onClose }) {
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
        <label className="import-drop">
          <FiUpload />
          <span>Choose CSV file</span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
        </label>
        <div className="modal-actions">
          <button className="btn btn-outline-secondary" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}