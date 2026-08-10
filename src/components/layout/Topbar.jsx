import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLE_LABELS } from '../../utils/roles.js';
import { notificationsApi } from '../../api/modules.js';
 
export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);


const loadNotifications = async () => {
  try {
  const response = await notificationsApi.listByRole(user.role);
console.log(response.data);
    const unreadCount = response.data.filter(n => !n.read).length;
    console.log("Unread =", unreadCount);

    setUnread(unreadCount);

  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  if (user) {
    loadNotifications();
  }
   const interval = setInterval(() => {
    loadNotifications();
  }, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);


}, [user]);
 const openNotifications = async () => {
  try {
    await notificationsApi.markAllRead(user.role);

    setUnread(0);

    // reload count after marking read
    await loadNotifications();

  } catch (error) {
    console.error(error);
  }

  navigate('/notifications');
};
 
  return (
    <header className="topbar">
      <div>
      </div>
      <div className="topbar-actions">
        <button className="icon-btn notification-bell" type="button" onClick={openNotifications} title="Notifications">
          <FiBell />
          {unread > 0 && <span className="notification-badge">{unread > 99 ? '99+' : unread}</span>}
        </button>
        <div className="user-chip">
          <span>{user?.username}</span>
          <small>{ROLE_LABELS[user?.role] || user?.role}</small>
        </div>
        <button className="icon-btn" onClick={logout} title="Logout">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}
 