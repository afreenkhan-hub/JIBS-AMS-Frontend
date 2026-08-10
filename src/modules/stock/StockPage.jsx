import { DataTable } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useTableActions } from '../../hooks/useTableActions.jsx';
import { stockRows } from '../../data/stockData.js';
 
export default function StockPage() {
  const fields = [
    { key: 'category', label: 'Category' },
    { key: 'current_stock', label: 'Current Stock', type: 'number' },
    { key: 'minimum_stock_level', label: 'Min Level', type: 'number' },
    { key: 'vendor', label: 'Vendor' },
    { key: 'last_movement', label: 'Last Movement' },
    { key: 'status', label: 'Status' }
  ];
  const { rows, pageActions, actionColumn, modals } = useTableActions({
    initialRows: stockRows,
    fields,
    entityName: 'Stock',
    fileName: 'stock.csv',
    getLabel: (row) => row?.category
  });
 
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Stock Management</h1>
          <p>Monitor current stock, minimum levels, vendor supply and stock movements.</p>
        </div>
        <div className="page-actions">
          {pageActions}
        </div>
      </div>
 
      <div className="module-summary-grid">
        <article className="mini-summary"><span>Categories</span><strong>12</strong></article>
        <article className="mini-summary"><span>Total Stock</span><strong>214</strong></article>
        <article className="mini-summary"><span>Low Stock</span><strong>9</strong></article>
        <article className="mini-summary"><span>Movements</span><strong>48</strong></article>
      </div>
 
      <DataTable
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'current_stock', label: 'Current Stock' },
          { key: 'minimum_stock_level', label: 'Min Level' },
          { key: 'vendor', label: 'Vendor' },
          { key: 'last_movement', label: 'Last Movement' },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
          actionColumn
        ]}
        rows={rows}
      />
      {modals}
    </section>
  );
}
 