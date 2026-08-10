const map = {
  Active: 'success',
  Available: 'success',
  Assigned: 'primary',
  'Under Repair': 'warning',
  Open: 'danger',
  Closed: 'secondary',
  Approved: 'success',
  Request: 'info',
  'Pending Manager Approval': 'warning',
  'Pending CDO/Director Approval': 'warning',
  Rejected: 'danger',
  'In Progress': 'warning',
  'Waiting Approval': 'warning',
  Return: 'warning',
  Replacement: 'danger',
  Pending: 'warning',
  Solved: 'success',
  Critical: 'danger',
  High: 'warning',
  Medium: 'info',
  Low: 'secondary'
};

export function StatusBadge({ value }) {
  return <span className={`badge text-bg-${map[value] || 'light'}`}>{value}</span>;
}
