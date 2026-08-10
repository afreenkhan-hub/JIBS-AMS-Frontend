import { useEffect, useMemo, useState } from 'react';
import { FiCheckCircle, FiRefreshCw, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ApprovalPopup } from '../../components/tickets/ApprovalPopup.jsx';
import { RejectPopup } from '../../components/tickets/RejectPopup.jsx';
import { CrudModal } from '../../components/ui/CrudModal.jsx';
import { TicketTable } from '../../components/tickets/TicketTable.jsx';
import { ExportMenu } from '../../components/ui/ExportMenu.jsx';
import { FilterPanel } from '../../components/ui/FilterPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSharedTickets } from '../../hooks/useSharedTickets.js';
import { usersApi } from '../../api/modules.js';
import { ROLES, WORK_STATUS, isApproverForTicket } from '../../utils/roles.js';
import { FiEye } from 'react-icons/fi';
import { TicketTimeline } from '../../components/tickets/TicketTimeline.jsx';
import { ticketApi } from '../../api/ticketApi.js';

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const workStatusOptions = Object.values(WORK_STATUS);
const DEPARTMENT_ROLE = { 'IT Team': 'IT_TEAM', 'Administration Team': 'ADMINISTRATION_TEAM' };
const emptyAssignment = { department: '', assigned_to: '', priority: 'Medium', due_date: '', remarks: '' };


// Super Admin sees every ticket across every role/department. It also
// approves CDO/Director-raised tickets (reusing the same Approve/Reject
// popups as the Manager/CDO/Director Approval page - no duplicate logic)
// and can override Work Status directly on already-assigned tickets.
// Approval Status is only ever changed through the Approve/Reject actions.
export default function TicketsPage() {
  const { user } = useAuth();
  const [historyTicket, setHistoryTicket] = useState(null);
const [timeline, setTimeline] = useState([]);
  const { tickets, overrideWorkStatus, approveAndAssignTicket, rejectTicket } = useSharedTickets();
  const [filters, setFilters] = useState({});
  const [statusModal, setStatusModal] = useState(null);
  const [statusValues, setStatusValues] = useState({ work_status: WORK_STATUS.OPEN, remarks: '' });
  const [teamUsers, setTeamUsers] = useState([]);
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignValues, setAssignValues] = useState(emptyAssignment);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectValues, setRejectValues] = useState({ rejection_remarks: '' });

  useEffect(() => {
    usersApi
      .list()
      .then((response) => setTeamUsers(response.data || []))
      .catch((error) => console.error('Failed to load users for assignment:', error));
  }, []);

const filteredRows = useMemo(() => {
  return tickets
    .filter((row) => {
      const ticketMatch =
        !filters.ticket_number ||
        row.ticket_number?.toLowerCase().includes(filters.ticket_number.toLowerCase());

      const employeeMatch =
        !filters.employee ||
        row.employee_name?.toLowerCase().includes(filters.employee.toLowerCase());

      const priorityMatch =
        !filters.priority ||
        row.priority === filters.priority;

      const workMatch =
        !filters.work_status ||
        row.work_status === filters.work_status;

      const requestDate = row.request_date
        ? new Date(row.request_date)
        : null;

      const fromMatch =
        !filters.date_from ||
        (requestDate && requestDate >= new Date(filters.date_from));

      const toMatch =
        !filters.date_to ||
        (requestDate && requestDate <= new Date(filters.date_to));

      return (
        ticketMatch &&
        employeeMatch &&
        priorityMatch &&
        workMatch &&
        fromMatch &&
        toMatch
      );
    })
    .sort((a, b) => b.id - a.id);
}, [tickets, filters]);

  const openStatus = (ticket) => {
    setStatusValues({ work_status: ticket.work_status, remarks: '' });
    setStatusModal(ticket);
  };

  const submitStatus = (event) => {
    event.preventDefault();
    overrideWorkStatus(statusModal.ticket_number, statusValues.work_status, user, statusValues.remarks);
    // TODO: Replace with PUT /api/tickets/{id}/status when the Spring Boot
    // endpoint is available.
    toast.success(`${statusModal.ticket_number} moved to ${statusValues.work_status}`);
    setStatusModal(null);
  };
const openTimeline = async (ticket) => {
  try {
    const response = await ticketApi.getHistory(ticket.id);

    setTimeline(response.data);
    setHistoryTicket(ticket);

  } catch (error) {
    console.error(error);
    toast.error("Failed to load timeline");
  }
};

  const openAssign = (ticket) => {
    setAssignValues(emptyAssignment);
    setAssignTarget(ticket);
  };

  const closeAssign = () => {
    setAssignTarget(null);
    setAssignValues(emptyAssignment);
  };

  const onAssignChange = (key, value) => {
    setAssignValues((current) => (key === 'department' ? { ...current, department: value, assigned_to: '' } : { ...current, [key]: value }));
  };

  const submitAssign = (event) => {
    event.preventDefault();
    if (!assignValues.department || !assignValues.assigned_to || !assignValues.priority) {
      toast.error('Department, assigned employee and priority are required.');
      return;
    }
const assignee = teamUsers.find(
  (candidate) =>
    candidate.username === assignValues.assigned_to
);
  approveAndAssignTicket(
  assignTarget,
  {
    department: assignValues.department,
    assignedTo: assignee.username,          // <-- Name
    assignedToId: assignee.employeeId,      // <-- Employee ID
    priority: assignValues.priority,
    dueDate: assignValues.due_date,
    remarks: assignValues.remarks
  },
  user
);
    toast.success(`${assignTarget.ticket_number} approved and assigned to ${assignValues.assigned_to}`);
    closeAssign();
  };
const openReject = (ticket) => {
  setAssignTarget(null); // Close Approve popup
  setRejectValues({ rejection_remarks: '' });
  setRejectTarget(ticket);
};

 const submitReject = (event) => {
  event.preventDefault();

  if (!rejectValues.rejection_remarks.trim()) {
    toast.error("Rejection remarks are required.");
    return;
  }

  rejectTicket(
    rejectTarget.ticket_number,
    user,
    rejectValues.rejection_remarks
  );

  toast.success(`${rejectTarget.ticket_number} rejected`);

  setRejectTarget(null);
  setAssignTarget(null); // Ensure approve popup is also closed
};
  const assignableEmployees = teamUsers.filter((candidate) => candidate.role === DEPARTMENT_ROLE[assignValues.department]);

  const exportColumns = [
    { key: 'ticket_number', label: 'Ticket ID' },
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'asset_name', label: 'Asset' },
    { key: 'priority', label: 'Priority' },
  
    { key: 'work_status', label: 'Work Status' },
    { key: 'assigned_department', label: 'Department' },
    { key: 'request_date', label: 'Request Date' }
  ];

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Ticket Management</h1>
          <p>Full visibility across every role and department, plus approval for CDO/Director-raised tickets.</p>
        </div>
      </div>

      
      <div className="module-summary-grid">
     <article className="mini-summary">
  <span>Pending</span>
  <strong>
    {filteredRows.filter((row) => row.work_status === WORK_STATUS.PENDING).length}
  </strong>
</article>
        <article className="mini-summary"><span>Assigned / Open</span><strong>{filteredRows.filter((row) => [WORK_STATUS.ASSIGNED, WORK_STATUS.OPEN].includes(row.work_status)).length}</strong></article>
        <article className="mini-summary"><span>In Progress</span><strong>{filteredRows.filter((row) => row.work_status === WORK_STATUS.IN_PROGRESS).length}</strong></article>
        <article className="mini-summary"><span>Closed</span><strong>{filteredRows.filter((row) => row.work_status === WORK_STATUS.CLOSED).length}</strong></article>
      </div>

      <FilterPanel
        filters={[
          { key: 'ticket_number', label: 'Ticket ID' },
          { key: 'employee', label: 'Employee Name' },
          { key: 'priority', label: 'Priority', type: 'select', options: priorities },
         
          { key: 'work_status', label: 'Work Status', type: 'select', options: workStatusOptions },
         { key: 'date_from', label: 'Date From', type: 'date', className: 'date-filter' },
{ key: 'date_to', label: 'Date To', type: 'date', className: 'date-filter' },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({})}
      />

      <ExportMenu columns={exportColumns} filteredRows={filteredRows} allRows={tickets} filename="tickets.csv" />


      <TicketTable
        rows={filteredRows}
        showAssignment
        showApproval={false}
        actions={(row) => (
  <button
    className="btn btn-outline-secondary btn-sm"
    type="button"
    onClick={() => openTimeline(row)}
  >
    Timeline
  </button>
)}
      />

      <CrudModal
        open={Boolean(statusModal)}
        title={`Update Status - ${statusModal?.ticket_number || ''}`}
        fields={[
          { key: 'work_status', label: 'Work Status', type: 'select', options: workStatusOptions },
          { key: 'remarks', label: 'Remarks', type: 'textarea' }
        ]}
        values={statusValues}
        onChange={(key, value) => setStatusValues((current) => ({ ...current, [key]: value }))}
        onSubmit={submitStatus}
        onClose={() => setStatusModal(null)}
        submitLabel="Update Status"
      />

      <ApprovalPopup
        open={Boolean(assignTarget)}
        ticketNumber={assignTarget?.ticket_number}
        assignableEmployees={assignableEmployees}
        values={assignValues}
        onChange={onAssignChange}
        onSubmit={submitAssign}
        onClose={closeAssign}
      />

      <RejectPopup
        open={Boolean(rejectTarget)}
        ticketNumber={rejectTarget?.ticket_number}
        values={rejectValues}
        onChange={(key, value) => setRejectValues((current) => ({ ...current, [key]: value }))}
        onSubmit={submitReject}
        onClose={() => {
  setRejectTarget(null);
  setAssignTarget(null);
}}
      />
      {historyTicket && (
  <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
    <div className="action-modal">
      <div className="action-modal-header">
        <h2>{historyTicket.ticket_number} Timeline</h2>

        <button
          className="icon-btn"
          type="button"
          onClick={() => setHistoryTicket(null)}
        >
          Close
        </button>
      </div>

      <TicketTimeline history={timeline} />
    </div>
  </div>
)}
    </section>
  );
}
