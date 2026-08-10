import { useMemo, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { ExportMenu } from '../../components/ui/ExportMenu.jsx';
import { FilterPanel } from '../../components/ui/FilterPanel.jsx';

const reportRows = [
  { employee_name: 'Demo Employee', employee_id: 'EMP-1001', department: 'Engineering', project: 'Phoenix Support', total_issues: 4, issue_type: 'Hardware', open_issues: 2, closed_issues: 1, replacement_count: 1, pending_count: 2, status: 'Open', last_issue_date: '2026-07-09' },
  { employee_name: 'Meena S', employee_id: 'EMP-1002', department: 'Quality', project: 'Phoenix Support', total_issues: 3, issue_type: 'Battery', open_issues: 0, closed_issues: 2, replacement_count: 1, pending_count: 0, status: 'Closed', last_issue_date: '2026-07-08' },
  { employee_name: 'Arun Kumar', employee_id: 'EMP-2001', department: 'Delivery', project: 'Atlas Migration', total_issues: 2, issue_type: 'Display', open_issues: 1, closed_issues: 1, replacement_count: 0, pending_count: 1, status: 'Pending', last_issue_date: '2026-07-07' }
];

export default function ReportsPage() {
  const [filters, setFilters] = useState({});
  const columns = [
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'department', label: 'Department' },
    { key: 'project', label: 'Project' },
    { key: 'total_issues', label: 'Total Issues' },
    { key: 'issue_type', label: 'Issue Type' },
    { key: 'open_issues', label: 'Open Issues' },
    { key: 'closed_issues', label: 'Closed Issues' },
    { key: 'replacement_count', label: 'Replacement Count' },
    { key: 'pending_count', label: 'Pending Count' },
    { key: 'last_issue_date', label: 'Last Issue Date' }
  ];

  const filteredRows = useMemo(() => reportRows.filter((row) => {
    const employeeMatch = !filters.employee_name || row.employee_name.toLowerCase().includes(filters.employee_name.toLowerCase());
    const idMatch = !filters.employee_id || row.employee_id.toLowerCase().includes(filters.employee_id.toLowerCase());
    const departmentMatch = !filters.department || row.department.toLowerCase().includes(filters.department.toLowerCase());
    const projectMatch = !filters.project || row.project.toLowerCase().includes(filters.project.toLowerCase());
    const typeMatch = !filters.issue_type || row.issue_type.toLowerCase().includes(filters.issue_type.toLowerCase());
    const statusMatch = !filters.status || row.status === filters.status;
    const fromMatch = !filters.date_from || row.last_issue_date >= filters.date_from;
    const toMatch = !filters.date_to || row.last_issue_date <= filters.date_to;
    return employeeMatch && idMatch && departmentMatch && projectMatch && typeMatch && statusMatch && fromMatch && toMatch;
  }), [filters]);

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Reports</h1>
          <p>Employee and issue summary with filtered and selected-column exports.</p>
        </div>
      </div>
      <FilterPanel
        filters={[
          { key: 'employee_name', label: 'Employee Name' },
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'department', label: 'Department' },
          { key: 'project', label: 'Project' },
          { key: 'issue_type', label: 'Issue Type' },
          { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed', 'Pending'] },
          { key: 'date_from', label: 'Date From', type: 'date' },
          { key: 'date_to', label: 'Date To', type: 'date' }
        ]}
        values={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({})}
      />
      <ExportMenu columns={columns} filteredRows={filteredRows} allRows={reportRows} filename="reports.csv" />
      <DataTable columns={columns} rows={filteredRows} />
    </section>
  );
}
