import { useEffect, useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { usersApi } from '../../../api/modules.js';
import { formatProjects, projectsOverlap } from '../../../utils/projects.js';
import { ROLE_LABELS } from '../../../utils/roles.js';

export default function AdminEmployeesPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    usersApi
      .list()
      .then((response) => {
        if (active) setUsers(response.data || []);
      })
      .catch((error) => {
        console.error('Failed to load users:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // An admin's (or employee's) `project` field can hold multiple,
  // comma-separated project names - e.g. "CRM,ERP". Show every employee
  // who shares at least one project with this admin.
  const rows = users.filter(
    (employee) => employee.role === 'EMPLOYEE' && projectsOverlap(user?.project, employee.project)
  );

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Project Employees</h1>
          <p>Employees mapped to {formatProjects(user?.project) || 'your projects'}.</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'employeeId', label: 'Employee ID' },
          { key: 'username', label: 'Name' },
          { key: 'email', label: 'Email' },
          { key: 'designation', label: 'Designation' },
          { key: 'phone_no', label: 'Phone Number' },
          { key: 'project', label: 'Project' },
          { key: 'role', label: 'Role', render: (row) => <StatusBadge value={ROLE_LABELS[row.role] || row.role} /> }
        ]}
        rows={rows}
        empty={loading ? 'Loading employees…' : 'No employees found for this project.'}
      />
    </section>
  );
}