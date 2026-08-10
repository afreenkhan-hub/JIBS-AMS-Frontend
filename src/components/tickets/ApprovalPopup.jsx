import { CrudModal } from '../ui/CrudModal.jsx';

export const DEPARTMENTS = ['IT Team', 'Administration Team'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// One popup for both flows:
// - Manager/CDO/Director approving a Pending ticket ("Approve & Assign")
// - CDO/Director routing their own already-approved ticket ("Assign")
// The title/submit label flex between the two; the fields never change.
export function ApprovalPopup({ open, ticketNumber, approvalRequired = true, assignableEmployees, values, onChange, onSubmit, onClose }) {
  const fields = [
    { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, required: true },
{
  key: 'assigned_to',
  label: 'Assign To',
  type: 'select',
  options: (assignableEmployees || []).map(employee => ({
    label: employee.username,
    value: employee.username
  })),
  required: true
},
    { key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true },
    { key: 'due_date', label: 'Due Date', type: 'date' },
    { key: 'remarks', label: 'Remarks', type: 'textarea' }
  ];

  return (
    <CrudModal
      open={open}
      title={`${approvalRequired ? 'Approve & Assign' : 'Assign'} ${ticketNumber || 'Ticket'}`}
      fields={fields}
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      onClose={onClose}
      submitLabel={approvalRequired ? 'Approve & Assign' : 'Assign'}
    />
  );
}
