import { DataTable } from '../../components/ui/DataTable.jsx';
import { useTableActions } from '../../hooks/useTableActions.jsx';

const logs = [
  { user: 'Super Admin', action: 'Created asset AST-1004', ip_address: '192.168.1.21', date: '2026-07-08 10:15' },
  { user: 'Asset Admin', action: 'Approved ticket TKT-1006', ip_address: '192.168.1.24', date: '2026-07-08 09:42' },
  { user: 'Super Admin', action: 'Updated low stock threshold for Keyboard', ip_address: '192.168.1.21', date: '2026-07-07 18:20' },
  { user: 'Demo Employee', action: 'Requested asset return AST-1001', ip_address: '192.168.1.31', date: '2026-07-07 16:05' }
];

export default function AuditLogsPage() {
  const fields = [
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action', type: 'textarea' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'date', label: 'Date' }
  ];
  const { rows, pageActions, actionColumn, modals } = useTableActions({
    initialRows: logs,
    fields,
    entityName: 'Log',
    fileName: 'audit-logs.csv',
    getLabel: (row) => row?.action
  });

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Audit Logs</h1>
          <p>Track every important action with user, date and IP address.</p>
        </div>
        <div className="page-actions">
          {pageActions}
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'user', label: 'User' },
          { key: 'action', label: 'Action' },
          { key: 'ip_address', label: 'IP Address' },
          { key: 'date', label: 'Date' },
          actionColumn
        ]}
        rows={rows}
      />
      {modals}
    </section>
  );
}
