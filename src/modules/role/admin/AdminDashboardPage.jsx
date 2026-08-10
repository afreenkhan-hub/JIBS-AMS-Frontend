import { Link } from 'react-router-dom';
import { TicketTable } from '../../../components/tickets/TicketTable.jsx';
import { MetricCard } from '../../../components/ui/MetricCard.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useSharedTickets } from '../../../hooks/useSharedTickets.js';
import { formatProjects, projectsOverlap } from '../../../utils/projects.js';
import { APPROVAL_STATUS, ROLES, WORK_STATUS, isApproverForTicket, resolveTicketRole } from '../../../utils/roles.js';

// FIX: this page previously called approveTicket(ticket.ticket_number,
// user?.full_name) / rejectTicket(..., user?.full_name, remarks) - a name
// string - while TicketApprovalPage.jsx (the page that actually owns
// approval) calls approveTicket(ticket.ticket_number, user) with the full
// user object. If useSharedTickets records actingUser.role/employeeId into
// ticket history, approvals from this page wrote broken history entries.
// It also gated the Approve/Reject buttons on `row.status !== 'Request'`,
// a field that doesn't exist on the new ticket model (it's
// approval_status/work_status now), and claimed a "project view" while
// actually rendering every ticket unfiltered.
//
// Rather than re-implement approve/assign/reject here a second time (that
// duplication is exactly what caused the drift above), this page is now a
// read-only summary that reuses the same TicketTable component and links
// out to the single Ticket Approval page for the actual action - matching
// the "one approval page" design already documented in
// TicketApprovalPage.jsx.
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { tickets } = useSharedTickets();
  const role = resolveTicketRole(user?.role);

  // Manager only sees tickets from employees sharing a project, same rule
  // TicketApprovalPage uses; CDO/Director/Team Lead see everything.
const scopedTickets = [...tickets].sort((a, b) => b.id - a.id);

console.log("Scoped Tickets:", scopedTickets);
console.log("Scoped Count:", scopedTickets.length);
console.log(scopedTickets.map(t => t.ticket_number));

  const pendingMyApproval = scopedTickets.filter((ticket) => isApproverForTicket(role, ticket)).length;
const pendingApproval = scopedTickets.filter(
  (ticket) => ticket.work_status === WORK_STATUS.PENDING
).length;
  const inProgress = scopedTickets.filter((ticket) => ticket.work_status === WORK_STATUS.IN_PROGRESS).length;
  const closed = scopedTickets.filter((ticket) => ticket.work_status === WORK_STATUS.CLOSED).length;

  const scopeText = role === ROLES.MANAGER
    ? `Project view for ${formatProjects(user?.project) || 'no project set on your account'}`
    : 'All projects';

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Hello 👋, {user?.full_name}</h1>
 
          <p>{scopeText}: tickets and approvals overview.</p>
        </div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Pending Your Approval" value={pendingMyApproval} tone="amber" />
     <MetricCard
  label="Pending Tickets"
  value={pendingApproval}
  tone="teal"
/>
        <MetricCard label="In Progress" value={inProgress} tone="blue" />
        <MetricCard label="Closed" value={closed} tone="green" />
      </div>

   <TicketTable
 rows={scopedTickets}
 
  showAssignment
  showApproval={false}
  showWorkStatus={true}
  empty="No tickets in your scope yet."
  
/>

      {pendingMyApproval > 0 && (
        <p>
          <Link to="/ticket-approval">Go to Ticket Approval &rarr;</Link>
        </p>
      )}
    </section>
  );
}