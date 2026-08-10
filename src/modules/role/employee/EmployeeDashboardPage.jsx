import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { TicketForm } from '../../../components/tickets/TicketForm.jsx';
import { TicketTable } from '../../../components/tickets/TicketTable.jsx';
import { MetricCard } from '../../../components/ui/MetricCard.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useSharedTickets } from '../../../hooks/useSharedTickets.js';
import { APPROVAL_STATUS, WORK_STATUS } from '../../../utils/roles.js';
import { ticketApi } from '../../../api/ticketApi.js';

// FIX: this page used to build its own ticket payload by hand (legacy
// `status`/`approved_by` fields, and `user?.employee_id` which doesn't
// exist on the User entity - the real field is camelCase `employeeId`,
// see the note in EmployeeAssetsPage.jsx). That payload bypassed
// useSharedTickets/getInitialRouting entirely, so tickets raised from this
// page never got a real approval_status/approval_level/assigned_department
// and silently never showed up on the Ticket Approval or Department
// Tickets pages. Now this uses the exact same addTicket(values, user) call
// as MyTicketsPage.jsx, which is the known-working path.
export default function EmployeeDashboardPage() {
  const { user } = useAuth();
  const { tickets, addTicket } = useSharedTickets();
  console.log("Logged User", user);
console.log("Tickets", tickets);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ asset_name: '', issue_category: '', priority: 'Medium', remarks: '' });

 let employeeTickets = [...tickets];

if (user?.role === "EMPLOYEE") {
  employeeTickets = tickets
    .filter(
      (ticket) => ticket.employee_id === user.employeeId
    )
    .sort((a, b) => b.id - a.id);
} else {
  employeeTickets = [...tickets].sort((a, b) => b.id - a.id);
}

  const openRaise = () => {
    setValues({ asset_name: '', issue_category: '', priority: 'Medium', remarks: '' });
    setOpen(true);
  };

const submit = async (event) => {
  event.preventDefault();

  if (!values.asset_name || !values.issue_category || !values.priority) {
    toast.error("Asset, issue category and priority are required");
    return;
  }

  try {
   const payload = {
  employeeId: user.employeeId,
  employeeName: user.full_name,
  project: user.project,
  assetName: values.asset_name,
  issueCategory: values.issue_category,
  priority: values.priority,
  description: values.remarks,
  createdByRole: user.role
};
    const response = await ticketApi.create(payload);

    console.log("Backend Response:", response.data);

    addTicket(response.data);

    toast.success("Ticket raised successfully");

    setOpen(false);

  } catch (error) {
    console.error(error);
    toast.error("Failed to raise ticket");
  }
};
const pendingApproval = employeeTickets.filter(
  (ticket) => ticket.approval_status === APPROVAL_STATUS.PENDING
).length;

const inProgress = employeeTickets.filter(
  (ticket) => ticket.work_status === WORK_STATUS.IN_PROGRESS
).length;

const closed = employeeTickets.filter(
  (ticket) => ticket.work_status === WORK_STATUS.CLOSED
).length;
  return (
    <section>
      <div className="page-title">
        <div>
      <h1>Hello 👋, {user?.full_name}</h1>
 
          <p>View your assigned assets and ticket approval status.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={openRaise}>
          <FiPlus /> Raise Ticket
        </button>
      </div>

      <div className="metric-grid">
        <MetricCard label="My Tickets" value={employeeTickets.length} tone="blue" />
        <MetricCard label="Pending Approval" value={pendingApproval} tone="amber" />
        <MetricCard label="In Progress" value={inProgress} tone="teal" />
        <MetricCard label="Closed" value={closed} tone="green" />
      </div>

      <TicketTable
  rows={employeeTickets}
  showEmployee={false}
  showAssignment
  showApproval={false}
  empty="No tickets raised yet."
/>

      <TicketForm
        open={open}
        values={values}
        onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))}
        onSubmit={submit}
        onClose={() => setOpen(false)}
      />
    </section>
  );
}