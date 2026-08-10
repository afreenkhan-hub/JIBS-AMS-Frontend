import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { TicketTimeline } from '../../components/tickets/TicketTimeline.jsx';
import { toast } from 'react-toastify';
import { ApprovalPopup } from '../../components/tickets/ApprovalPopup.jsx';
import { RejectPopup } from '../../components/tickets/RejectPopup.jsx';
import { TicketTable } from '../../components/tickets/TicketTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSharedTickets } from '../../hooks/useSharedTickets.js';
import { usersApi } from '../../api/modules.js';
import { formatProjects, projectsOverlap } from '../../utils/projects.js';
import { ROLES, WORK_STATUS, isApproverForTicket, resolveTicketRole } from '../../utils/roles.js';
import { ticketApi } from '../../api/ticketApi.js';

const DEPARTMENT_ROLE = { 'IT Team': 'IT_TEAM', 'Administration Team': 'ADMINISTRATION_TEAM' };
const emptyAssignment = { department: '', assigned_to: '', priority: 'Medium', due_date: '', remarks: '' };

// Single Approval page for
// Team Lead
// Manager
// CDO
// Director
// Super Admin Which tickets show up
// is decided purely by the logged-in user's role (isApproverForTicket) -
// there is no per-role branch of this component. (Super Admin approves its
// own CDO/Director-raised tickets on the Ticket Management page instead,
// since it already has full ticket visibility there.)
export default function TicketApprovalPage() {
   console.log("===== TICKET APPROVAL PAGE LOADED =====");
  const { user } = useAuth();
  const role = resolveTicketRole(user?.role);
  console.log("Logged role:", user?.role);
console.log("Resolved role:", role);
 const {
  tickets,
  loadTickets,
  rejectTicket,
  approveAndAssignTicket
} = useSharedTickets();
  const [teamUsers, setTeamUsers] = useState([]);
  const [projectApprovalRoles, setProjectApprovalRoles] = useState({});
  const [assignTarget, setAssignTarget] = useState(null);
  const [assignValues, setAssignValues] = useState(emptyAssignment);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectValues, setRejectValues] = useState({ rejection_remarks: '' });
  const [historyTicket, setHistoryTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
useEffect(() => {
  console.log("assignTarget:", assignTarget);
}, [assignTarget]);

useEffect(() => {
  console.log("rejectTarget:", rejectTarget);
}, [rejectTarget]);
  useEffect(() => {
    usersApi
      .list()
      .then((response) => setTeamUsers(response.data || []))
      .catch((error) => {
        console.error('Failed to load users for assignment:', error);
        toast.error('Could not load employees for assignment. Try reopening this page.');
      });
  }, []);

console.log("Logged User Role:", role);

tickets.forEach(ticket => {
  console.log(
    "Ticket:",
    ticket.ticket_number,
    "Approval Roles:",
    ticket.approvalRoles
  );
  });
  // Manager only sees tickets from employees sharing a project; CDO/Director
  // see every ticket routed to CDO/Director level regardless of project.
  console.log("========== Ticket Approval ==========");
console.log("Logged User:", user);
console.log("Resolved Role:", role);
console.log("Tickets:", tickets);
const rows = [...tickets]
  .filter((ticket) => {
    console.log(
      "Ticket:",
      ticket.ticket_number,
      "Approval Roles:",
      ticket.approvalRoles,
      "Can Approve:",
      isApproverForTicket(role, ticket, ticket.approvalRoles || [])
    );

    if (!ticket.approvalRoles?.includes(role)) {
      return false;
    }

    if (
      (role === ROLES.TEAM_LEAD || role === ROLES.MANAGER) &&
      !projectsOverlap(user?.project, ticket.project)
    ) {
      return false;
    }

    return true;
  })
  .sort((a, b) => b.id - a.id);
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

 const submitAssign = async (event) => {
  event.preventDefault();

  if (
    !assignValues.department ||
    !assignValues.assigned_to ||
    !assignValues.priority
  ) {
    toast.error(
      "Department, assigned employee and priority are required."
    );
    return;
  }

  const assignee = teamUsers.find(
    (candidate) =>
      (candidate.username || candidate.full_name) ===
        assignValues.assigned_to &&
      candidate.role === DEPARTMENT_ROLE[assignValues.department]
  );

  if (!assignee) {
    toast.error("Selected employee could not be found.");
    return;
  }

  console.log("Selected Employee:", assignee);
  console.log("Employee ID:", assignee.employeeId);

  await approveAndAssignTicket(
    assignTarget,
    {
      department: assignValues.department,
      assignedTo: assignee.employeeId,
      priority: assignValues.priority,
      dueDate: assignValues.due_date,
      remarks: assignValues.remarks,
    },
    user
  );

  await loadTickets();

  toast.success(
    `${assignTarget.ticket_number} approved and assigned to ${assignee.username}`
  );

  closeAssign();
};    
  const openReject = (ticket) => {
    setRejectValues({ rejection_remarks: '' });
    setRejectTarget(ticket);
  };

  const submitReject = (event) => {
    event.preventDefault();
    if (!rejectValues.rejection_remarks.trim()) {
      toast.error('Rejection remarks are required.');
      return;
    }
    rejectTicket(
    rejectTarget,
    user,
    rejectValues.rejection_remarks);
    toast.success(`${rejectTarget.ticket_number} rejected`);
    setRejectTarget(null);
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

  const assignableEmployees = teamUsers.filter((candidate) => candidate.role === DEPARTMENT_ROLE[assignValues.department]);

  const scopeText = role === ROLES.MANAGER
    ? `employees in ${formatProjects(user?.project) || 'no project set on your account'}`
    : 'all projects';

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Ticket Approval</h1>
          <p>Review tickets pending your approval - {scopeText}.</p>
        </div>
      </div>

   <TicketTable
  rows={rows}
  showApproval={false}
  showWorkStatus={true}
  actions={(row) => {

    console.log("ACTION ROW:", row);
    console.log("ROW WORK STATUS:", row.work_status);
    console.log("EXPECTED PENDING:", WORK_STATUS.PENDING);
    console.log(
      "STATUS MATCH:",
      row.work_status === WORK_STATUS.PENDING
    );

    if (row.work_status === WORK_STATUS.PENDING) {
      return (
        <div className="row-actions">
          <button
            className="btn btn-primary btn-sm"
            type="button"
            onClick={() => openAssign(row)}
          >
            <FiCheckCircle /> Approve
          </button>

          <button
            className="btn btn-outline-danger btn-sm"
            type="button"
            onClick={() => openReject(row)}
          >
            <FiXCircle /> Reject
          </button>
        </div>
      );
    }

  return (
  <button
    className="btn btn-outline-secondary btn-sm"
    type="button"
    onClick={() => openTimeline(row)}
  >
    <FiEye /> Timeline
  </button>
);
  }}
  empty="No tickets pending your approval."
/>
      <ApprovalPopup
        open={!!assignTarget}
        ticketNumber={assignTarget?.ticket_number}
        assignableEmployees={assignableEmployees}
        values={assignValues}
        onChange={onAssignChange}
        onSubmit={submitAssign}
        onClose={closeAssign}
      />

      <RejectPopup
  open={!!rejectTarget}
  ticketNumber={rejectTarget?.ticket_number}
  values={rejectValues}
  onChange={(key, value) =>
    setRejectValues((current) => ({
      ...current,
      [key]: value
    }))
  }
  onSubmit={submitReject}
  onClose={() => setRejectTarget(null)}
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