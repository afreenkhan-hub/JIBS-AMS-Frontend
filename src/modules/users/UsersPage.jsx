import { DataTable } from "../../components/ui/DataTable.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { useTableActions } from "../../hooks/useTableActions.jsx";
import { useEffect, useState } from "react";
import { usersApi } from "../../api/modules.js";
import { ROLES, ROLE_LABELS } from "../../utils/roles.js";
import { pushNotification } from "../../utils/notifications.js";
 
// Roles the "Project Assigned" notification applies to (see roles.js).
// IT Team / Administration Team are department queues, not project staff,
// so they're intentionally left out here.
const PROJECT_ASSIGNMENT_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.TEAM_LEAD,
  ROLES.MANAGER,
  ROLES.CDO,
  ROLES.DIRECTOR
];
 
// Fields shown in the Add/Edit User modal. Access to pages is decided
// purely by `role` (see utils/roles.js + Sidebar.jsx + ProtectedRoute.jsx)
// - there is no designation/department field here, so it can never be
// used to grant or block access to a page.
const USER_FIELDS = [
  { key: "employeeId", label: "Employee ID", placeholder: "Example : EMP001" },
  { key: "username", label: "Full Name", placeholder: "Enter Full Name" },
  { key: "email", label: "Email Address", type: "email", placeholder: "example@company.com" },
  { key: "phone_no", label: "Phone Number", type: "tel", placeholder: "9876543210" },
 
  // Add this
  {
    key: "designation",
    label: "Designation",
    placeholder: "e.g. Software Engineer"
  },
 
  { key: "password", label: "Password", type: "password", placeholder: "Enter Password" },
  { key: "project", label: "Project", placeholder: "e.g. CRM or CRM, ERP for multiple projects" },
 
  {
    key: "role",
    label: "Role",
    type: "select",
    options: [
      { value: ROLES.SUPER_ADMIN, label: "Super Admin" },
      { value: ROLES.TEAM_LEAD, label: "Team Lead" },
      { value: ROLES.MANAGER, label: "Manager" },
      { value: ROLES.CDO, label: "CDO" },
      { value: ROLES.DIRECTOR, label: "Director" },
      { value: ROLES.IT_TEAM, label: "IT Team" },
      { value: ROLES.ADMINISTRATION_TEAM, label: "Administration Team" },
      { value: ROLES.EMPLOYEE, label: "Employee" }
    ]
  }
];
 
  const USER_COLUMNS = [
  { key: "employeeId", label: "Employee ID" },
  { key: "username", label: "Full Name" },
  { key: "email", label: "Email" },
  { key: "phone_no", label: "Phone Number" },
 
  // Add this
  { key: "designation", label: "Designation" },
 
  { key: "password", label: "Password", render: () => "••••••••" },
  { key: "project", label: "Project" },
  {
    key: "role",
    label: "Role",
    render: (row) => (
      <StatusBadge value={ROLE_LABELS[row.role] || row.role} />
    )
  }
];
export default function UsersPage() {
  const [users, setUsers] = useState([]);
 
  const fetchUsers = () => {
    usersApi
      .list()
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Error fetching users:", error));
  };
 
  useEffect(() => {
    fetchUsers();
  }, []);
 
  const { rows, pageActions, actionColumn, modals } = useTableActions({
    initialRows: users,
    fields: USER_FIELDS,
    entityName: "User",
    fileName: "users.csv",
    getLabel: (row) => row?.username,
    fetchUsers,
  apiUrl: "https://jibs-ams-backend-production.up.railway.app/api/users",
    onSaved: (type, values, previousRow) => {
      const project = (values.project || '').trim();
      const projectChanged = type === 'add' ? Boolean(project) : project && project !== (previousRow?.project || '');
      if (!project || !projectChanged || !PROJECT_ASSIGNMENT_ROLES.includes(values.role)) return;
 
      pushNotification(
        'Project Assigned',
        `${values.username || values.employeeId} assigned to ${project} as ${ROLE_LABELS[values.role] || values.role}`,
        {
          type: 'Project',
          status: 'Assigned',
          audience: [values.employeeId, values.username].filter(Boolean)
        }
      );
    }
  });
 
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>User Management</h1>
          <p>
            Create admins and employees, manage access, reset passwords and
            export user data.
          </p>
        </div>
 
        <div className="page-actions">{pageActions}</div>
      </div>
 
      <div className="module-summary-grid">
  <article className="mini-summary">
    <span>Total Users</span>
    <strong>{users.length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Super Admin</span>
    <strong>{users.filter((u) => u.role === ROLES.SUPER_ADMIN).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Team Lead</span>
    <strong>{users.filter((u) => u.role === ROLES.TEAM_LEAD).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Managers</span>
    <strong>{users.filter((u) => u.role === ROLES.MANAGER).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>CDO</span>
    <strong>{users.filter((u) => u.role === ROLES.CDO).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Director</span>
    <strong>{users.filter((u) => u.role === ROLES.DIRECTOR).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>IT Team</span>
    <strong>{users.filter((u) => u.role === ROLES.IT_TEAM).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Administration Team</span>
    <strong>{users.filter((u) => u.role === ROLES.ADMINISTRATION_TEAM).length}</strong>
  </article>
 
  <article className="mini-summary">
    <span>Employees</span>
    <strong>{users.filter((u) => u.role === ROLES.EMPLOYEE).length}</strong>
  </article>
</div>
 
      <DataTable columns={[...USER_COLUMNS, actionColumn]} rows={rows} />
 
      {modals}
    </section>
  );
}
 