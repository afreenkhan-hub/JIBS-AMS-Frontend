import { ticketApi } from "../api/ticketApi";
import { useEffect, useState } from 'react';
 
import {
 
  WORK_STATUS,
    ROLE_LABELS,
  resolveTicketRole,
 
} from '../utils/roles.js';

const STORAGE_KEY = 'ealms_tickets';
 
// --- Shared external store -------------------------------------------------
// Every page that calls useSharedTickets() used to get its OWN useState,
// which only re-read localStorage on mount/focus/cross-tab "storage" events.
// That's why raising a ticket as Employee didn't show up on the Manager /
// Super Admin pages until a manual refresh - two mounted instances in the
// same tab (e.g. My Tickets and a dashboard widget) never told each other
// anything changed. Now there is exactly ONE array in memory (module scope,
// backed by localStorage) and every component subscribes to it, so a write
// from any page re-renders every other page immediately, in the same tab.
let ticketStore = null;
const listeners = new Set();
 
function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const source = stored ? JSON.parse(stored) : [];
    const deduped = source.filter((ticket, index, all) => index === all.findIndex((t) => t.ticket_number === ticket.ticket_number));
    return deduped.map(normalizeTicket);
  } catch (error) {
    console.error('Failed to load tickets from storage:', error);
    return [];
  }
}
 
function getStore() {
  if (ticketStore === null) ticketStore = loadFromStorage();
  return ticketStore;
}
 
function setStore(next) {
  ticketStore = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ticketStore));
  } catch (error) {
    console.error('Failed to persist tickets to storage:', error);
  }
  listeners.forEach((listener) => listener(ticketStore));
}
 
// Cross-tab sync: localStorage's own "storage" event only fires in OTHER
// tabs, never the tab that made the write, which is exactly what's needed
// here (this tab already updated itself via setStore above).
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    ticketStore = loadFromStorage();
    listeners.forEach((listener) => listener(ticketStore));
  });
}
 
export function useSharedTickets() {
const [tickets, setTickets] = useState([]);
 
const loadTickets = async () => {
  console.log("LOAD TICKETS CALLED");
  try {
    const user = JSON.parse(localStorage.getItem("ealms_user"));

    if (!user) {
      console.error("No logged in user found");
      return;
    }

   let response;

if (
  user.role === "SUPER_ADMIN" 
) {
  response = await ticketApi.list();

} else if (
  user.role === "EMPLOYEE"
) {
  response = await ticketApi.myTickets(user.employeeId);

} else {
  response = await ticketApi.myRoleTickets(user.employeeId);
}
    console.log("API URL called for role:", user.role);
console.log("API response:", response.data);
    const data = response.data.map((ticket) => ({
  ...ticket,
 
  ticket_number: ticket.ticketId,
  employee_id: ticket.employeeId,
  employee_name: ticket.employeeName,
 
  asset_name: ticket.assetName,
  issue_category: ticket.issueCategory,
 
  assigned_department: ticket.assignedDepartment,
  assigned_to: ticket.assignedTo,
 
  work_status: ticket.workStatus || ticket.work_status,
  approvalRoles: ticket.approvalRoles,
 
  request_date: ticket.createdAt,
  updated_date: ticket.updatedAt,
  approved_by: ticket.approvedBy
}));
console.log("Logged User:", user.role, user.project);
console.log("Tickets from API:", response.data);
console.log("Mapped Tickets:", data);

setStore(data);
setTickets(data);
 
  } catch (err) {
    console.error(err);
  }
};
 
useEffect(() => {

    const listener = (next) => setTickets(next);

    listeners.add(listener);

    const user = JSON.parse(localStorage.getItem("ealms_user"));

    if (user) {
        loadTickets();
    }

    return () => listeners.delete(listener);

}, []);
 
 
  // Scenario 1/2/3 - one creation path for every role. Routing (approval
  // level / approval status / work status) is derived purely from the
  // creator's role, never duplicated per-role logic in the page components.
const addTicket = async (createdTicket) => {
    await loadTickets();
 
};
const approveTicket = async (ticketNumber, user) => {
const ticket = getStore().find(
    t => t.ticket_number === ticketNumber
  );
 
  await ticketApi.approve(ticket.id, {
    approvedBy: user.username,
    approvedRole: user.role
  });
 
  await loadTickets();
 
 
};
  // Used by the single Approval page (Manager/CDO/Director) AND the Super
  // Admin Ticket Management page approving a Pending ticket - one popup,
  // one state transition into Assigned, no matter who clicked Approve.
const approveAndAssignTicket = async (ticket, assignment, user) => {
 
  const role = resolveTicketRole(user?.role);
  const roleLabel = ROLE_LABELS[role];
 
await ticketApi.approve(ticket.id, {
  approvedBy: user.username,
  approvedRole: user.role,
  reason: assignment.remarks,
  assignedDepartment: assignment.department,
  assignedTo: assignment.assignedTo,
  assignedToId: assignment.assignedToId,
  dueDate: assignment.dueDate
});
 
  // Reload latest data from backend
  await loadTickets();
 
  
};
 
const rejectTicket = async (selectedTicket, user, rejectionRemarks) => {
 
 
 
 
 
  await ticketApi.reject(selectedTicket.id, {
    approvedBy: user.username,
    approvedRole: user.role,
    reason: rejectionRemarks
  });
 
await loadTickets();

};
 
  // Department queues (IT Team / Administration Team) may only ever touch
  // Work Status - Approval Status is never part of `updates` here.
const updateWorkStatus = async (ticketNumber, workStatus, user, remarks) => {
 
  const ticket = getStore().find(
    t => t.ticket_number === ticketNumber
  );
 
 await ticketApi.updateStatus(ticket.id, {
  workStatus,
  reason: remarks
});
 
  await loadTickets();
 
  if (workStatus === WORK_STATUS.OPEN) {
   
  }
 
  if (workStatus === WORK_STATUS.IN_PROGRESS) {
  
  }
 
  if (workStatus === WORK_STATUS.CLOSED) {
    
  }
};
  // Super Admin override - can move work status directly, without ever
  // touching approval status.
  const overrideWorkStatus = (ticketNumber, workStatus, user, remarks) => updateWorkStatus(ticketNumber, workStatus, user, remarks);
 
  // Legacy alias kept ONLY because AdminDashboardPage.jsx (an out-of-scope
  // "Dashboard module") still calls approveTicket(ticketNumber, name)
  // directly with no department/assignee - it is intentionally not part of
  // the new single-Approval-page workflow. New code should use
  // approveAndAssignTicket instead.
 
 
  return {
    tickets,
    loadTickets,
    addTicket,
   
    approveAndAssignTicket,
    approveTicket,
    rejectTicket,
    updateWorkStatus,
    overrideWorkStatus
  };
}
 
export function createTicketNumber(existingTickets = []) {
  const max = existingTickets.reduce((highest, ticket) => {
    const match = String(ticket.ticket_number || '').match(/JIBS-(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);
  return `JIBS-${String(max + 1).padStart(6, '0')}`;
}
 
export function now() {
  return new Date().toLocaleString();
}
 
function historyEntry(action, user, role, remarks = '') {
  return {
    action,
    user: user?.username || user?.full_name || 'Unknown User',
    role: ROLE_LABELS[role] || role || '',
    date: now(),
    remarks: remarks || ''
  };
}
 
// Ticket notifications now live in utils/notifications.js (shared with
// project-assignment and Super-Admin-only warranty/low-stock alerts).
// Re-exported here so existing imports of readTicketNotifications from
// this module keep working unchanged.
export { readNotifications as readTicketNotifications } from '../utils/notifications.js';
 
// Derives the old single `status` string from approval_status/work_status
// so legacy, out-of-scope consumers (AdminDashboardPage, EmployeeDashboardPage
// - both "Dashboard modules") that still read ticket.status keep working
// without being modified. New pages should read approval_status/work_status
// directly instead.
function deriveLegacyStatus(ticket) {
 
  switch (ticket.work_status) {
 
    case WORK_STATUS.PENDING:
      return "Request";
 
    case WORK_STATUS.APPROVED:
      return "Approved";
 
    case WORK_STATUS.OPEN:
      return "Open";
 
    case WORK_STATUS.IN_PROGRESS:
      return "In Progress";
 
    case WORK_STATUS.RESOLVED:
      return "Resolved";
 
    case WORK_STATUS.CLOSED:
      return "Closed";
 
    case WORK_STATUS.REJECTED:
      return "Rejected";
 
    default:
      return "Pending";
  }
}
 
// Migrates tickets created under the old single `status` field (and older
// demo seed data) into the new approval_status / work_status /
// approval_level / history shape, so nobody's existing localStorage data
// breaks when this ships.
 
 
function normalizeTicket(ticket) {
console.log(ticket);
  return {
    ...ticket,
 
    // Backend -> Frontend mapping
    createdByRole: ticket.createdByRole,
    ticket_number: ticket.ticketId,
    employee_id: ticket.employeeId,
    approvalRoles: ticket.approvalRoles,
    employee_name: ticket.employeeName,
 
    asset_name: ticket.assetName,
    issue_category: ticket.issueCategory,
 
    assigned_department: ticket.assignedDepartment,
    assigned_to: ticket.assignedTo,
 
    work_status: ticket.workStatus || ticket.work_status,
 
    request_date: ticket.createdAt,
    updated_date: ticket.updatedAt,
    approved_by: ticket.approvedBy,
 
 
    remarks: ticket.description,
   
 
    history: ticket.history || [],
 
    status: deriveLegacyStatus({
     work_status: ticket.workStatus || ticket.work_status
    })
  };
}
 