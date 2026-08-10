import { useEffect, useMemo, useState } from 'react';
import { FiMail } from 'react-icons/fi';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  markNotificationsRead
} from '../../utils/notifications.js';
import { ROLES, resolveTicketRole } from '../../utils/roles.js';
import { assetApi } from '../../api/assetApi.js';
import { getLowStockRows } from '../../data/stockData.js';
import { notificationsApi } from '../../api/modules.js';
 
// Assets whose warranty has already expired, or expires within the window -
// these two alert types (Warranty Expiry / Low Stock) are Super Admin only,
// so they are computed here rather than written into the shared feed (no
// point spamming a stored notification for a state that's simply true or
// false at any given moment).

 

export default function NotificationsPage() {
  const { user } = useAuth();
  const role = resolveTicketRole(user?.role);
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
 
  // Every ticket action (Raised / Approved / Rejected / Open / Work
  // Started / Closed) and every project assignment writes a notification
  // here - see pushNotification in utils/notifications.js. IT Team /
  // Administration Team only see the ones for their own department's
  // assignments; everyone else sees the full "All roles" feed, plus
  // anything targeted at them personally (e.g. project assigned). Super
  // Admin sees everything, including the Super-Admin-only alerts below.

  const [notifications, setNotifications] = useState([]);
 
 
 
  // Viewing the page marks the feed as read (clears the Topbar bell badge).
  useEffect(() => {
    markNotificationsRead(user);
  }, [user]);
 

useEffect(() => {

  if(user?.role){

   const notificationKey =
  user.role === "EMPLOYEE"
    ? user.employeeId
    : user.role;

notificationsApi
  .listByRole(notificationKey)
      .then((response)=>{
          setNotifications(response.data || []);
      })
      .catch(error=>{
          console.error("Notification loading failed",error);
      });

  }

}, [user]);

const combinedNotifications = notifications;
 
 

  
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Notifications</h1>
          <p>
            {isSuperAdmin
              ? 'Every ticket, project assignment, warranty and low-stock alert across the system.'
              : 'Ticket updates, project assignments and system alerts relevant to you.'}
          </p>
        </div>
      </div>
 
      <DataTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'message', label: 'Message' },
          { key: 'type', label: 'Type' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          {
  key: "createdAt",
  label: "Date",
  render: (row) =>
    new Date(row.createdAt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
},
         {
  key: "mail",
  label: "Mail",
  render: () => <FiMail size={18} />
}
        ]}
        rows={combinedNotifications}
        empty="No notifications yet."
      />
    </section>
  );
}
 