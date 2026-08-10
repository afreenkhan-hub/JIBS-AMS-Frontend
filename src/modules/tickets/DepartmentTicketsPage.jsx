import { useState } from 'react';
import { FiRefreshCw, FiEye } from 'react-icons/fi';
import { TicketTimeline } from '../../components/tickets/TicketTimeline.jsx';
import { ticketApi } from '../../api/ticketApi.js';
import { toast } from 'react-toastify';
import { CrudModal } from '../../components/ui/CrudModal.jsx';
import { TicketTable } from '../../components/tickets/TicketTable.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSharedTickets } from '../../hooks/useSharedTickets.js';
import { DEPARTMENT_BY_ROLE, WORK_STATUS, resolveTicketRole } from '../../utils/roles.js';

const WORK_STATUS_OPTIONS = [WORK_STATUS.ASSIGNED, WORK_STATUS.OPEN, WORK_STATUS.IN_PROGRESS, WORK_STATUS.CLOSED];

// ONE page for both IT Team and Administration Team. Each team only ever
// sees tickets routed to its own department, and can only ever change Work
// Status - Approval Status is never touched here (updateWorkStatus enforces
// that at the hook level too).
export default function DepartmentTicketsPage() {
  const { user } = useAuth();
  const { tickets, updateWorkStatus } = useSharedTickets();
  const role = resolveTicketRole(user?.role);
  const department = DEPARTMENT_BY_ROLE[role];
  const [statusModal, setStatusModal] = useState(null);
  const [values, setValues] = useState({ work_status: WORK_STATUS.OPEN, remarks: '' });
  const [historyTicket, setHistoryTicket] = useState(null);
const [timeline, setTimeline] = useState([]);

const rows = tickets
  .filter(
    (ticket) => ticket.assigned_department === department
  )
  .sort((a, b) => b.id - a.id);

  const openStatus = (ticket) => {
    setValues({ work_status: ticket.work_status, remarks: '' });
    setStatusModal(ticket);
  };

  const submitStatus = (event) => {
    event.preventDefault();
    updateWorkStatus(statusModal.ticket_number, values.work_status, user, values.remarks);
    // TODO: Replace with PUT /api/tickets/{id}/status when the Spring Boot
    // endpoint supports the dedicated work_status field.
    toast.success(`${statusModal.ticket_number} moved to ${values.work_status}`);
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

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>{department} Tickets</h1>
          <p>Tickets assigned to {department}. Only Work Status can be updated here.</p>
        </div>
      </div>
<TicketTable
  rows={rows}
  showApproval={false}
  empty={`No tickets currently assigned to ${department}.`}
  actions={(row) => (
    <button
      className="btn btn-primary btn-sm"
      type="button"
      onClick={() => openStatus(row)}
    >
      <FiRefreshCw /> Update Status
    </button>
  )}
  timeline={(row) => (
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
  title={`Update ${statusModal?.ticket_number || ""}`}
  fields={[
    {
      key: "work_status",
      label: "Work Status",
      type: "select",
      options: WORK_STATUS_OPTIONS
    },
    {
      key: "remarks",
      label: "Remarks",
      type: "textarea"
    }
  ]}
  values={values}
  onChange={(key, value) =>
    setValues((current) => ({ ...current, [key]: value }))
  }
  onSubmit={submitStatus}
  onClose={() => setStatusModal(null)}
  submitLabel="Update"
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