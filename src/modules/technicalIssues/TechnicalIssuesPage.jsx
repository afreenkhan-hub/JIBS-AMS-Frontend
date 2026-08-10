import { useEffect, useMemo, useState } from 'react';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { ExportMenu } from '../../components/ui/ExportMenu.jsx';
import { FilterPanel } from '../../components/ui/FilterPanel.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useTableActions } from '../../hooks/useTableActions.jsx';
 
import { technicalIssuesApi } from '../../api/modules.js';
 
 
const fields = [
 
  { key: 'vendor_name', label: 'Vendor Name' },
  { key: 'vendor_number', label: 'Vendor Contact Number', type: 'tel' },
  { key: 'issue', label: 'Issue Description', type: 'textarea' },
  { key: 'status', label: 'Status', type: 'select', options: ['Replacement', 'Solved', 'Pending'] },
  { key: 'remarks', label: 'Remarks', type: 'textarea' },
  { key: 'created_date', label: 'Date & Time', type: 'datetime-local' },
  { key: 'employee_name', label: 'Employee Name' },
  { key: 'employee_id', label: 'Employee ID' },
  { key: 'project', label: 'Project Name' }
];
 
export default function TechnicalIssuesPage() {
 
  const [filters, setFilters] = useState({});
 
  const [rows, setRows] = useState([]);
 
const loadTechnicalIssues = () => {
 
  technicalIssuesApi.list()
    .then((response) => {
 
      setRows(
        response.data.map(issue => ({
          id: issue.id,
          issue_id: issue.issueId,
          vendor_name: issue.vendorName,
          vendor_number: issue.vendorNumber,
          employee_name: issue.employeeName,
          employee_id: issue.employeeId,
          project: issue.project,
          issue: issue.issue,
          status: issue.status,
          remarks: issue.remarks,
          created_date: issue.createdDate
        }))
      );
 
    })
    .catch((error) => {
      console.error(error);
    });
 
};
 useEffect(() => {
  loadTechnicalIssues();
}, []);
const {
  rows: tableRows,
  pageActions,
  actionColumn,
  modals
} = useTableActions({
 
  initialRows: rows,
 
  fields,
 
  entityName: "Issue",
 
  fileName: "technical-issues.csv",
 
  getLabel: (row) => row?.issue_id,
 
  apiUrl: "/technical-issues",
 
  fetchUsers: loadTechnicalIssues,   // <-- ADD THIS
 
  transformPayload: (data) => ({
    vendorName: data.vendor_name,
    vendorNumber: data.vendor_number,
    employeeName: data.employee_name,
    employeeId: data.employee_id,
    project: data.project,
    issue: data.issue,
    status: data.status,
    remarks: data.remarks
  })
 
});
  const columns = [
    { key: 'issue_id', label: 'Issue ID' },
    { key: 'vendor_name', label: 'Vendor Name' },
    { key: 'vendor_number', label: 'Vendor Number' },
    { key: 'employee_name', label: 'Employee Name' },
    { key: 'employee_id', label: 'Employee ID' },
    { key: 'project', label: 'Project' },
    { key: 'issue', label: 'Issue' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
    { key: 'remarks', label: 'Remarks' },
    { key: 'created_date', label: 'Created Date' },
    actionColumn
  ];
 
 const filteredRows = useMemo(() => tableRows.filter((row) => {
    const employeeMatch =
        !filters.employee_name ||
        (row.employee_name || "")
            .toLowerCase()
            .includes(filters.employee_name.toLowerCase());
    const projectMatch = !filters.project || row.project.toLowerCase().includes(filters.project.toLowerCase());
    const statusMatch = !filters.status || row.status === filters.status;
    const fromMatch = !filters.date_from || row.created_date.slice(0, 10) >= filters.date_from;
    const toMatch = !filters.date_to || row.created_date.slice(0, 10) <= filters.date_to;
    return employeeMatch && projectMatch && statusMatch && fromMatch && toMatch;
}), [tableRows, filters]);
 
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Technical Issues</h1>
          <p>Track vendor issues, replacement status and employee/project context.</p>
        </div>
        <div className="page-actions">{pageActions}</div>
      </div>
      <FilterPanel
        filters={[
          { key: 'employee_name', label: 'Employee Name' },
          { key: 'project', label: 'Project' },
          { key: 'status', label: 'Status', type: 'select', options: ['Replacement', 'Solved', 'Pending'] },
          { key: 'date_from', label: 'Date From', type: 'date' },
          { key: 'date_to', label: 'Date To', type: 'date' }
        ]}
        values={filters}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
        onReset={() => setFilters({})}
      />
      <ExportMenu columns={columns} filteredRows={filteredRows} allRows={rows} filename="technical-issues.csv" />
      <DataTable columns={columns} rows={filteredRows} />
      {modals}
    </section>
  );
}
 
 