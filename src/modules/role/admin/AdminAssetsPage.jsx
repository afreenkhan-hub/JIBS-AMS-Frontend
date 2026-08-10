import { useEffect, useState } from 'react';
import { DataTable } from '../../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { assignedAssetApi } from '../../../api/assignedAssetApi.js';
import { formatProjects, parseProjects } from '../../../utils/projects.js';

export default function AdminAssetsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const projects = parseProjects(user?.project);
    if (!projects.length) {
      setRecords([]);
      setLoading(false);
      return undefined;
    }

    let active = true;
    setLoading(true);

    // The backend's /assigned-assets/project/{project} route matches one
    // project at a time, so fetch each of the admin's projects and merge
    // the results (de-duplicated by assignment id).
    Promise.all(projects.map((project) => assignedAssetApi.byProject(project)))
      .then((responses) => {
        if (!active) return;
        const merged = responses.flatMap((response) => response.data || []);
        const deduped = Array.from(new Map(merged.map((item) => [item.id, item])).values());
        setRecords(deduped);
      })
      .catch((error) => {
        console.error('Failed to load project assets:', error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.project]);

  // AssignedAsset nests the underlying Asset entity under `asset`, so
  // flatten it into the shape the table columns expect.
  const rows = records.map((record) => ({
    id: record.id,
    asset_id: record.asset?.assetId,
    asset_model: record.asset?.assetName,
    brand: record.asset?.brand,
    serial_number: record.asset?.serialNumber,
    assigned_to: record.employeeName,
    employee_id: record.employeeId,
    project: record.project,
    status: record.status
  }));

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Project Assets</h1>
          <p>Assets assigned inside {formatProjects(user?.project) || 'your projects'}.</p>
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'asset_id', label: 'Asset ID' },
          { key: 'asset_model', label: 'Asset' },
          { key: 'brand', label: 'Brand' },
          { key: 'serial_number', label: 'Serial Number' },
          { key: 'assigned_to', label: 'Assigned To' },
          { key: 'employee_id', label: 'Employee ID' },
          { key: 'project', label: 'Project' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> }
        ]}
        rows={rows}
        empty={loading ? 'Loading assets…' : 'No assets assigned for this project.'}
      />
    </section>
  );
}
