import { useMemo, useState } from 'react';
import { FiEdit2, FiEye, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAssignedAssets } from '../../context/AssignedAssetsContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';


export default function AssignedAssetHistoryPage() {
  const { history, updateHistory, } = useAssignedAssets();
  const { user } = useAuth();
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [search, setSearch] = useState('');
  const rows = useMemo(() => history.filter((row) => Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())), [history, search]);
  console.log("History rows:", rows);
  return <section>
    <div className="page-title"><div><h1>Assigned Asset History</h1><p>Permanent lifecycle records for returned, replaced, and inactive assets.</p></div><Link className="btn btn-outline-secondary" to="/assigned-assets">Back to Assigned Assets</Link></div>
  <div className="filter-panel">
  <div className="d-flex align-items-center gap-2">
    <input
      className="form-control"
      placeholder="Search employee, asset, serial number or reason"
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    <button
  className="btn btn-outline-secondary text-nowrap px-4"
  onClick={() => setSearch('')}
>
  Clear Filter
</button>
  </div>
</div>
    <div className="table-responsive data-panel"><table className="table table-hover align-middle"><thead><tr>{['Employee ID', 'Employee Name', 'Project', 'Asset Name', 'Asset Type', 'Serial Number', 'Previous Status', 'Current Status', 'Assigned Date', 'Completed Date', 'Reason', 'Updated By', 'Actions'].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.id}>
  <td>{row.employeeId}</td>
  <td>{row.employeeName}</td>
  <td>{row.project}</td>
  <td>{row.assetName}</td>
  <td>{row.assetType}</td>
  <td>{row.serialNumber}</td>

  <td>
    <StatusBadge value={row.previousStatus} />
  </td>

  <td>
    <StatusBadge value={row.currentStatus} />
  </td>

  <td>
    {row.assignedDate
      ? new Date(row.assignedDate).toLocaleString()
      : "-"}
  </td>

  <td>
    {row.completedDate
      ? new Date(row.completedDate).toLocaleString()
      : "-"}
  </td>

  <td>{row.reason}</td>

  <td>{row.updatedBy}</td>

  <td>
    <div className="d-flex gap-1">
      <button
        className="icon-btn"
        onClick={() => setViewing(row)}
      >
        <FiEye />
      </button>

      <button
        className="icon-btn"
        onClick={() => setEditing(row)}
      >
        <FiEdit2 />
      </button>

  
    </div>
  </td>
</tr>) : <tr><td colSpan="13" className="text-center py-4 text-muted">No assignment history found.</td></tr>}</tbody></table></div>
    {viewing && <HistoryModal title="History Details" row={viewing} onClose={() => setViewing(null)} />}
    {editing && <div className="modal-backdrop-custom"><div className="action-modal action-modal-sm"><div className="action-modal-header"><h2>Edit History Details</h2><button className="icon-btn" onClick={() => setEditing(null)}>×</button></div><form className="action-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); updateHistory(editing.id, { remarks: data.get('remarks'), reason: data.get('reason'),  updatedBy: user?.username || 'Admin',}); toast.success('History details updated.'); setEditing(null); }}><label>Reason<textarea className="form-control" name="reason" defaultValue={editing.reason} required /></label><label>Remarks<textarea className="form-control" name="remarks" defaultValue={editing.remarks} /></label><label>Updated By<input className="form-control" name="updatedBy" defaultValue={editing.updatedBy} /></label><div className="modal-actions"><button className="btn btn-primary">Save Changes</button></div></form></div></div>}
  </section>;
}

function HistoryModal({ title, row, onClose }) { return <div className="modal-backdrop-custom"><div className="action-modal action-modal-sm"><div className="action-modal-header"><h2>{title}</h2><button className="icon-btn" onClick={onClose}>×</button></div><dl className="mb-0">{Object.entries(row).filter(([key]) => key !== "id").map(([key, value]) => <div key={key}><dt className="text-capitalize">{key.replaceAll('_', ' ')}</dt><dd>{String(value || '-')}</dd></div>)}</dl></div></div>; }
