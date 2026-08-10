import { toast } from 'react-toastify';
import { ROLES, DEPARTMENT_BY_ROLE, resolveTicketRole } from './roles.js';
 
// Single shared feed for every notification in the app (ticket lifecycle,
// project assignment, warranty/low-stock alerts, ...). Backed by
// localStorage so it survives refresh and syncs across tabs, and by a
// window CustomEvent so every mounted component (Topbar bell, Notifications
// page, dashboards) updates immediately in the SAME tab too.
const NOTIFICATIONS_KEY = 'ealms_ticket_notifications';
const EVENT_NAME = 'ealms:ticket-notification';
const READ_KEY_PREFIX = 'ealms_notifications_read_at:';
 
// Visibility scopes -----------------------------------------------------
// ALL         -> every role (Employee, Team Lead, Manager, CDO, Director,
//                IT Team, Administration Team, Super Admin). Department
//                queues (IT/Administration) still only see their own
//                department's ticket notifications, same as before.
// SUPER_ADMIN -> Super Admin only (warranty expiry, low stock).
export const NOTIFICATION_SCOPE = {
  ALL: '',
  SUPER_ADMIN: 'SUPER_ADMIN'
};
 
export function now() {
  return new Date().toLocaleString();
}
 
/**
 * Writes one notification into the shared feed and (unless mail:false is
 * passed) fires the simulated "mail notification" channel as a toast.
 *
 * NOTE FOR BACKEND: there is no email-sending endpoint yet. `sendMail`
 * below is a frontend stand-in - swap its body for a real
 * POST /api/notifications/email call (or let the backend send the mail
 * itself when it writes the notification) once that lands. Nothing else
 * in this file needs to change; every call site already goes through
 * pushNotification -> sendMail.
 */
export function pushNotification(title, message, {
  type = 'Ticket',
  status = 'Open',
  ticketNumber = '',
  department = '',
  project = '',
  scope = NOTIFICATION_SCOPE.ALL,
  audience = [],
  mail = true
} = {}) {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    const list = stored ? JSON.parse(stored) : [];
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      title,
      message,
      type,
      status,
      date: now(),
      ticket_number: ticketNumber,
      department: department || '',
      project: project || '',
      scope: scope || NOTIFICATION_SCOPE.ALL,
      audience: audience || [],
      mailSent: Boolean(mail)
    };
    list.unshift(entry);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list.slice(0, 200)));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
    if (mail) sendMail(title, message);
    return entry;
  } catch (error) {
    console.error('Failed to store notification:', error);
    return null;
  }
}
 
// Simulated mail channel - every push shows up as a toast styled like an
// email receipt so it's obvious in the demo which notifications would also
// go out as email once the backend wires up real delivery.
function sendMail(title, message) {
  try {
    toast.info(`📧 Email sent: ${title} — ${message}`, { autoClose: 3500 });
  } catch (error) {
    console.error('Failed to show mail toast:', error);
  }
}
 
export function readNotifications() {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
 
// Legacy alias - existing code imported this name from useSharedTickets.js.
export const readTicketNotifications = readNotifications;
 
/**
 * Applies the role-based visibility rules to the raw feed:
 *  - Super Admin sees everything: every "All roles" ticket notification
 *    (no department filtering) PLUS the Super-Admin-only alerts
 *    (warranty expiry, low stock) PLUS every targeted notification
 *    (e.g. project assigned).
 *  - IT Team / Administration Team only see "All roles" notifications
 *    about their OWN department's ticket queue.
 *  - Everyone else sees every un-targeted "All roles" notification, plus
 *    any notification specifically targeted at them (audience match).
 *  - SUPER_ADMIN-scoped alerts never show for non-Super-Admin roles.
 */
export function getVisibleNotifications(list, user) {
  const userProject = user?.project;
  const role = resolveTicketRole(user?.role);
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const ownDepartment = DEPARTMENT_BY_ROLE[role];
  const identifiers = [user?.employeeId, user?.employee_id, user?.username].filter(Boolean);
 
  return (list || []).filter((item) => {
        if(item.project && userProject){
      if(item.project !== userProject){
        return false;
      }
    }
    if (isSuperAdmin) return true;
    if (item.scope === NOTIFICATION_SCOPE.SUPER_ADMIN) return false;
 
    if (item.audience && item.audience.length) {
      return item.audience.some((id) => identifiers.includes(id));
    }
 
    if (ownDepartment) {
      return !item.department || item.department === ownDepartment;
    }
 
    return true;
  });
}
 
function readKey(user) {
  const id = user?.employeeId || user?.employee_id || user?.username || 'anonymous';
  return `${READ_KEY_PREFIX}${id}`;
}
 
export function getLastReadAt(user) {
  const raw = localStorage.getItem(readKey(user));
  return raw ? Number(raw) || 0 : 0;
}
 
export function markNotificationsRead(user) {
  try {
    localStorage.setItem(readKey(user), String(Date.now()));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  } catch (error) {
    console.error('Failed to mark notifications read:', error);
  }
}
 
export function getUnreadCount(list, user) {
  const lastReadAt = getLastReadAt(user);
  return getVisibleNotifications(list, user).filter((item) => (item.ts || 0) > lastReadAt).length;
}
 