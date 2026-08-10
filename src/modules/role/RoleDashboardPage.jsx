import DashboardPage from "../dashboard/DashboardPage.jsx";
import AdminDashboardPage from "./admin/AdminDashboardPage.jsx";
import EmployeeDashboardPage from "./employee/EmployeeDashboardPage.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES } from "../../utils/roles.js";

export default function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === ROLES.SUPER_ADMIN) {
    return <DashboardPage />;
  }

  if (
    [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR,
    ].includes(user?.role)
  ) {
    return <AdminDashboardPage />;
  }

  if (
    [
      ROLES.EMPLOYEE,
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM,
    ].includes(user?.role)
  ) {
    return <EmployeeDashboardPage />;
  }

  return <DashboardPage />;
}