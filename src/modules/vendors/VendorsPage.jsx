import { DataTable } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useTableActions } from '../../hooks/useTableActions.jsx';
import { useEffect, useState } from 'react';
import { vendorApi } from '../../api/vendorApi';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const loadVendors = async () => {
  try {
    const response = await vendorApi.getAll();
    setVendors(response.data);
  } catch (error) {
    console.error('Failed to load vendors', error);
  }
};
useEffect(() => {
  loadVendors();
}, []);
 const fields = [
  { key: 'vendorName', label: 'Vendor' },
  { key: 'company', label: 'Company' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'gstNumber', label: 'GST Number' },
  { key: 'amc', label: 'AMC' },
{
  key: 'status',
  label: 'Status',
  type: 'select',
  options: ['Active', 'Inactive']
}
];
const { rows, pageActions, actionColumn, modals } = useTableActions({
  initialRows: vendors,
  fields,
  entityName: 'Vendor',
  fileName: 'vendors.csv',
  getLabel: (row) => row?.vendorName,
  fetchUsers: loadVendors,
  apiUrl: 'https://jibs-ams-backend-production.up.railway.app/api/vendors'
});

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Vendor Management</h1>
          <p>Manage vendor details, AMC, purchase contacts and supplier history.</p>
        </div>
        <div className="page-actions">
          {pageActions}
        </div>
      </div>

      <DataTable
        columns={[
          { key: 'vendorName', label: 'Vendor' },
          { key: 'company', label: 'Company' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'gstNumber', label: 'GST Number' },
          { key: 'amc', label: 'AMC' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          actionColumn
        ]}
        rows={rows}
      />
      {modals}
    </section>
  );
}
