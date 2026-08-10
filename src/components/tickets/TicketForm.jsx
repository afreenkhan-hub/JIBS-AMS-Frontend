import { CrudModal } from '../ui/CrudModal.jsx';

export const RAISE_TICKET_FIELDS = [
  { key: 'asset_name', label: 'Asset Name', required: true },
  { key: 'issue_category', label: 'Issue Category', required: true },
  { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'], required: true },
  { key: 'remarks', label: 'Remarks', type: 'textarea' }
];

// Single "Raise Ticket" popup, reused by Employee/Manager/CDO/Director -
// the workflow branch happens server-side of this form (in useSharedTickets
// -> getInitialRouting), not in the form itself.
export function TicketForm({ open, values, onChange, onSubmit, onClose }) {
    console.log("TICKET FORM LOADED", onSubmit);
  return (
    <CrudModal
      open={open}
      title="Raise Ticket"
      fields={RAISE_TICKET_FIELDS}
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      onClose={onClose}
      submitLabel="Raise Ticket"
    />
  );
}
