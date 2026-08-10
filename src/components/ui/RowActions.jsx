import { FiEdit2, FiTrash2 } from 'react-icons/fi';

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button className="icon-btn icon-btn-sm" type="button" onClick={onEdit} title="Edit">
        <FiEdit2 />
      </button>
      {onDelete && (
        <button className="icon-btn icon-btn-sm danger" type="button" onClick={onDelete} title="Delete">
          <FiTrash2 />
        </button>
      )}
    </div>
  );
}
