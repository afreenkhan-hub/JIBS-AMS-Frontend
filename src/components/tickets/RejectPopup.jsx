import { CrudModal } from '../ui/CrudModal.jsx';

export function RejectPopup({ open, ticketNumber, values, onChange, onSubmit, onClose }) {
  return (
    <CrudModal
      open={open}
      title={`Reject ${ticketNumber || 'Ticket'}`}
      fields={[{ key: 'rejection_remarks', label: 'Rejection Remarks', type: 'textarea', required: true }]}
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      onClose={onClose}
      submitLabel="Reject Ticket"
    />
  );
}
