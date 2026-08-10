// Renders a ticket's `history` array (Ticket Created -> Approved by Manager
// -> Assigned to IT Team -> Opened -> Work Started -> Ticket Closed, etc.)
// as a simple vertical timeline. Used from any ticket detail/expanded view.
export function TicketTimeline({ history = [] }) {
  if (!history.length) {
    return <p className="text-muted">No history recorded yet.</p>;
  }

 return (
    <ol className="ticket-timeline">
      {history.map((item, index) => (
        <li
          key={`${item.action}-${item.actionDate}-${index}`}
          className="ticket-timeline-item"
        >
          <div className="ticket-timeline-marker" />

          <div className="ticket-timeline-body">
            <strong>{item.action}</strong>

            <span className="ticket-timeline-meta">
              {item.performedBy}
              {item.role ? ` (${item.role})` : ""} -{" "}
              {new Date(item.actionDate).toLocaleString()}
            </span>

           {item.status && (
  <p className="ticket-timeline-status">
    <strong>Status:</strong> {item.status}
  </p>
)}

{item.remarks && (
  <p className="ticket-timeline-remarks">
    <strong>Remarks:</strong> {item.remarks}
  </p>
)}

{item.dueDate && (
  <p className="ticket-timeline-due-date">
    <strong>Due Date:</strong>{" "}
    {new Date(item.dueDate).toLocaleDateString()}
  </p>
)}
          </div>
        </li>
      ))}
    </ol>
  );
}