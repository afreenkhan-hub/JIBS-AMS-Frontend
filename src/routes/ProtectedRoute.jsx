import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Guards a single route's element by role, on top of ProtectedRoute's
// login check. Previously `roles` on each Sidebar link only decided what
// was *shown* - it did nothing to stop a logged-in user from reaching a
// route they have no business in by typing the URL directly (e.g. an
// Employee opening /ticket-approval or /users). Usage:
//   <Route path="/users" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><UsersPage /></RoleGate>} />
export function RoleGate({ allow, children }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allow.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}