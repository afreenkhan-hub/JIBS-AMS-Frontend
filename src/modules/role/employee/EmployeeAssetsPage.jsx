import { useEffect, useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { assignedAssetApi } from '../../../api/assignedAssetApi.js';

export default function EmployeeAssetsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: the User entity/login response uses `employeeId` (camelCase),
    // not `employee_id` - that mismatch was why this page never found rows.
    if (!user?.employeeId) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    setLoading(true);
    assignedAssetApi
      .byEmployee(user.employeeId)
      .then((response) => {
        if (active) setRecords(response.data || []);
      })
      .catch((error) => {
        console.error('Failed to load my assets:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user?.employeeId]);

  const rows = records.map((record) => ({
    id: record.id,
    asset_id: record.asset?.assetId,
    asset_model: record.asset?.assetName,
    brand: record.asset?.brand,
    serial_number: record.asset?.serialNumber,
    project: record.project,
    status: record.status
  }));

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>My Assets</h1>
          <p>Assets currently assigned to you.</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'asset_id', label: 'Asset ID' },
          { key: 'asset_model', label: 'Asset' },
          { key: 'brand', label: 'Brand' },
          { key: 'serial_number', label: 'Serial Number' },
          { key: 'project', label: 'Project' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
        ]}
        rows={rows}
        empty={loading ? 'Loading your assets…' : 'No assets assigned to you yet.'}
      />
    </section>
  );
}
