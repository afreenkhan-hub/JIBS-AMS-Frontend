import { Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ProtectedRoute, RoleGate } from './routes/ProtectedRoute.jsx';
import { ROLES, TICKET_CREATOR_ROLES, APPROVER_ROLES } from './utils/roles.js';
import { AppLayout } from './components/layout/AppLayout.jsx';
import LoginPage from './modules/auth/LoginPage.jsx';
import RegisterPage from './modules/auth/RegisterPage.jsx';
import RoleDashboardPage from './modules/role/RoleDashboardPage.jsx';
import UsersPage from './modules/users/UsersPage.jsx';
import AssetsPage from './modules/assets/AssetsPage.jsx';
import AssignedAssetsPage from './modules/assets/AssignedAssetsPage.jsx';
import AssignedAssetHistoryPage from './modules/assets/AssignedAssetHistoryPage.jsx';
import TicketsPage from './modules/tickets/TicketsPage.jsx';
import MyTicketsPage from './modules/tickets/MyTicketsPage.jsx';
import TicketApprovalPage from './modules/tickets/TicketApprovalPage.jsx';
import DepartmentTicketsPage from './modules/tickets/DepartmentTicketsPage.jsx';
import StockPage from './modules/stock/StockPage.jsx';
import VendorsPage from './modules/vendors/VendorsPage.jsx';
import ReportsPage from './modules/reports/ReportsPage.jsx';
import TechnicalIssuesPage from './modules/technicalIssues/TechnicalIssuesPage.jsx';
import AuditLogsPage from './modules/audit/AuditLogsPage.jsx';
import NotificationsPage from './modules/notifications/NotificationsPage.jsx';
import SettingsPage from './modules/settings/SettingsPage.jsx';
import ProfileSettingsPage from './modules/profile/ProfileSettingsPage.jsx';
import AdminEmployeesPage from './modules/role/admin/AdminEmployeesPage.jsx';
import AdminAssetsPage from './modules/role/admin/AdminAssetsPage.jsx';
import EmployeeAssetsPage from './modules/role/employee/EmployeeAssetsPage.jsx';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RoleDashboardPage />} />
            <Route path="/users" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><UsersPage /></RoleGate>} />
           <Route
  path="/admin/employees"
  element={
    <RoleGate
      allow={[
        ROLES.TEAM_LEAD,
        ROLES.MANAGER,
        ROLES.CDO,
        ROLES.DIRECTOR
      ]}
    >
      <AdminEmployeesPage />
    </RoleGate>
  }
/>
           <Route
  path="/admin/assets"
  element={
    <RoleGate
      allow={[
        ROLES.TEAM_LEAD,
        ROLES.MANAGER,
        ROLES.CDO,
        ROLES.DIRECTOR
      ]}
    >
      <AdminAssetsPage />
    </RoleGate>
  }
/>
            <Route
  path="/employee/assets"
  element={
    <RoleGate
      allow={[
        ROLES.EMPLOYEE,
        ROLES.TEAM_LEAD,
        ROLES.MANAGER,
        ROLES.CDO,
        ROLES.DIRECTOR,
        ROLES.IT_TEAM,
        ROLES.ADMINISTRATION_TEAM
      ]}
    >
      <EmployeeAssetsPage />
    </RoleGate>
  }
/>

            {/* Ticket Management - one page per workflow stage, shared by
                every role that stage applies to (see roles.js). */}
            <Route path="/my-tickets" element={<RoleGate allow={TICKET_CREATOR_ROLES}><MyTicketsPage /></RoleGate>} />
            <Route path="/ticket-approval" element={<RoleGate allow={APPROVER_ROLES}><TicketApprovalPage /></RoleGate>} />
            <Route path="/department/tickets" element={<RoleGate allow={[ROLES.IT_TEAM, ROLES.ADMINISTRATION_TEAM]}><DepartmentTicketsPage /></RoleGate>} />
            <Route path="/tickets" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><TicketsPage /></RoleGate>} />

            {/* Legacy URLs redirected so old bookmarks/links keep working. */}
            <Route path="/employee/tickets" element={<Navigate to="/my-tickets" replace />} />
            <Route path="/manager/tickets" element={<Navigate to="/ticket-approval" replace />} />
            <Route path="/admin/tickets" element={<Navigate to="/ticket-approval" replace />} />

            <Route path="/assets" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><AssetsPage /></RoleGate>} />
            <Route path="/assigned-assets" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><AssignedAssetsPage /></RoleGate>} />
            <Route path="/assigned-assets/history" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><AssignedAssetHistoryPage /></RoleGate>} />
            <Route path="/AssignedAssetsPage" element={<Navigate to="/assigned-assets" replace />} />
            <Route path="/AssignedAssetHistoryPage" element={<Navigate to="/assigned-assets/history" replace />} />
            <Route path="/stock" element={<StockPage />} />
          <Route
  path="/vendors"
  element={
    <RoleGate allow={[ROLES.SUPER_ADMIN]}>
      <VendorsPage />
    </RoleGate>
  }
/>
            <Route path="/reports" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><ReportsPage /></RoleGate>} />
            <Route path="/technicalIssues" element={<RoleGate allow={[ROLES.SUPER_ADMIN,ROLES.IT_TEAM]}><TechnicalIssuesPage /></RoleGate>} />
            <Route path="/audit-logs" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><AuditLogsPage /></RoleGate>} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile-settings" element={<RoleGate allow={[ROLES.SUPER_ADMIN]}><ProfileSettingsPage /></RoleGate>} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
}