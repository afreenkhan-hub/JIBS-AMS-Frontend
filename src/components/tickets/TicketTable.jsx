import { DataTable } from '../ui/DataTable.jsx';
import { StatusBadge } from '../ui/StatusBadge.jsx';

// One table for every ticket page (My Tickets, Approval, Department queue,
// Super Admin). Callers pick which optional columns they need instead of
// each page hand-rolling its own column list.
export function TicketTable({
  rows,
  showEmployee = true,
  showApproval = true,
  showWorkStatus = true,
  showAssignment = false,
  showProject = true,
 showUpdatedBy = true,
  extraColumns = [],
  actions,
   timeline,
  empty
}) {
  const columns = [
    { key: 'ticket_number', label: 'Ticket ID' },
    ...(showEmployee ? [
      { key: 'employee_name', label: 'Employee Name' },
      { key: 'employee_id', label: 'Employee ID' }
    ] : []),
    ...(showProject ? [{ key: 'project', label: 'Project' }] : []),
    { key: 'asset_name', label: 'Asset' },
    { key: 'issue_category', label: 'Issue Category' },
    { key: 'priority', label: 'Priority', render: (row) => <StatusBadge value={row.priority} /> },
    ...(showAssignment ? [
      { key: 'assigned_department', label: 'Department' },
      { key: 'assigned_to', label: 'Assigned To' }
    ] : []),
    ...(showApproval ? [{ key: 'approval_status', label: 'Approval Status', render: (row) => <StatusBadge value={row.approval_status} /> }] : []),
    ...(showWorkStatus ? [{ key: 'work_status', label: 'Work Status', render: (row) => <StatusBadge value={row.work_status} /> }] : []),
...(showUpdatedBy
  ? [
      {
  key: 'updated_by',
  label: 'Updated By',
  render: (row) => row.updated_by || row.approved_by || '-'
}
    ]
  : []),
    ...extraColumns,
    ...(actions ? [{ key: 'actions', label: 'Actions', render: actions }] : []),

...(timeline ? [{ key: 'timeline', label: 'Timeline', render: timeline }] : [])
  ];

  return <DataTable columns={columns} rows={rows} empty={empty} />;
}