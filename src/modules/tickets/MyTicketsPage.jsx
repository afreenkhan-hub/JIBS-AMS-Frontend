import { useState, useEffect } from 'react';

import { FiPlus, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { TicketForm } from '../../components/tickets/TicketForm.jsx';
import { TicketTable } from '../../components/tickets/TicketTable.jsx';
import { TicketTimeline } from '../../components/tickets/TicketTimeline.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

import { useSharedTickets } from '../../hooks/useSharedTickets.js';
import { ticketApi } from '../../api/ticketApi.js';
import { usersApi } from '../../api/modules.js';
// Employee-facing status label. Kept local to this page (not in
// useSharedTickets/deriveLegacyStatus) because that shared `status` field
// is read literally by the out-of-scope Dashboard modules and must not
// change. This is purely a display label for the My Tickets table.
function displayStatus(ticket) {

  return ticket.workStatus || ticket.work_status || "PENDING";

}
// One "Raise Ticket + My Tickets" page reused by every role that can create
// a ticket (Employee, Manager, CDO, Director). Which approval queue a new
// ticket lands in is decided entirely by useSharedTickets/getInitialRouting
// off the logged-in user's role - this page doesn't know or care.
export default function MyTicketsPage() {
    console.log("MY TICKETS PAGE LOADED");
  const { user } = useAuth();
 
  const { tickets, addTicket } = useSharedTickets();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({ asset_name: '', issue_category: '', priority: 'Medium', remarks: '' });
  const [historyTicket, setHistoryTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);
   // ADD THIS
  const [approvalRoles, setApprovalRoles] = useState([]);

  // ADD THIS useEffect HERE
  useEffect(() => {
    if (!user?.project) return;

   usersApi
  .getProjectApprovalRoles(user.project)
  .then((response) => {
    setApprovalRoles(response.data || []);
  })
  .catch((error) => {
    console.error("Failed to load approval roles:", error);
    setApprovalRoles([]);
  });
  }, [user?.project]); 

  // Existing code
  const rows = tickets.filter(
    (ticket) => ticket.employee_id === user?.employeeId
  );

  

  const openRaise = () => {
    console.log("OPEN RAISE CLICKED");
    setValues({ asset_name: '', issue_category: '', priority: 'Medium', remarks: '' });
    setOpen(true);
  };

  const submit = async (event) => {
    console.log("RAISE TICKET SUBMIT FIRED");
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
      createdByRole: user.role,
approvalRoles: approvalRoles
    };

    const response = await ticketApi.create(payload);

console.log("Created Ticket:", response.data);

addTicket(response.data);

    toast.success("Ticket raised successfully");
    setOpen(false);
  } catch (error) {
    console.error(error);
    toast.error("Failed to raise ticket");
  }
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
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>My Tickets</h1>
          <p>Raise tickets and track approval + work progress.</p>
        </div>
<button
  className="btn btn-primary"
  type="button"
  onClick={() => {
    console.log("RAISE BUTTON CLICKED");
    alert("CLICKED");
    openRaise();
  }}
>
 
          <FiPlus /> Raise Ticket
        </button>
      </div>

      <TicketTable
        rows={rows}
        showEmployee={false}
        showAssignment
        showProject={false}
        showApproval={false}
        showWorkStatus={false}
        showRequestDate={false}
       extraColumns={[
  { 
    key: 'status', 
    label: 'Status', 
    render: (row) => <StatusBadge value={displayStatus(row)} /> 
  },
  
]}
        actions={(row) => (
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => openTimeline(row)}>
            <FiEye /> Timeline
          </button>
        )}
      />

      <TicketForm open={open} values={values} onChange={(key, value) => setValues((current) => ({ ...current, [key]: value }))} onSubmit={submit} onClose={() => setOpen(false)} />

      {historyTicket && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
          <div className="action-modal">
            <div className="action-modal-header">
              <h2>{historyTicket.ticket_number} Timeline</h2>
              <button className="icon-btn" type="button" onClick={() => setHistoryTicket(null)}>Close</button>
            </div>
          <TicketTimeline history={timeline} />
          </div>
        </div>
      )}
    </section>
  );
}