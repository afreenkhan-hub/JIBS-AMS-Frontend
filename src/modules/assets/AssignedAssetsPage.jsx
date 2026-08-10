import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { FiEdit2, FiEye, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAssignedAssets } from '../../context/AssignedAssetsContext.jsx';
import { ExportMenu } from '../../components/ui/ExportMenu';
import { AssetAssignmentRow } from '../../components/ui/AssetAssignmentRow.jsx';
 
const emptyRow = () => ({ assetType: '', assetName: '', assetId: '', status: 'Active' });
const emptyForm = {
  employeeId: '',
  employeeName: '',
  project: '',
  assignedDate: new Date().toISOString().slice(0, 16),
  remarks: '',
  rows: [emptyRow()]
};
const emptyLifecycleForm = {
  status: 'Returned',
  progress: '',
  reason: '',
  rows: []
};
 
const exportColumns = [
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'project', label: 'Project' },
  { key: 'asset.assetName', label: 'Asset Name' },
  { key: 'asset.assetType', label: 'Asset Type' },
  { key: 'asset.serialNumber', label: 'Serial Number' },
  { key: 'assignedDate', label: 'Assigned Date' },
  { key: 'status', label: 'Status' },
  { key: 'remarks', label: 'Remarks' }
];
 
export default function AssignedAssetsPage() {
  const { assets, assetsLoading, active, history, assign, moveToHistory, updateActive, deleteActive } = useAssignedAssets();
  const [showForm, setShowForm] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [lifecycle, setLifecycle] = useState(null);
  const [submitting, setSubmitting] = useState(false);
const [filters, setFilters] = useState({
  employeeName: '',
  project: '',
  assetType: '',
  serialNumber: '',
  dateFrom: '',
  dateTo: ''
});
 
  // ---- New Assignment form ----
  const { register, control, handleSubmit, reset, watch, setValue } = useForm({ defaultValues: emptyForm });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });
  const selectedRows = watch('rows') || [];
 
  // ---- Replacement / lifecycle form (Returned / Replacement / Inactive) ----
  const {
    register: registerLifecycle,
    control: lifecycleControl,
    handleSubmit: handleLifecycleSubmit,
    watch: watchLifecycle,
    setValue: setLifecycleValue,
    reset: resetLifecycle
  } = useForm({ defaultValues: emptyLifecycleForm });
  const { fields: lifecycleFields, append: appendLifecycleRow, remove: removeLifecycleRow } = useFieldArray({
    control: lifecycleControl,
    name: 'rows'
  });
  const lifecycleStatus = watchLifecycle('status');
  const lifecycleRows = watchLifecycle('rows') || [];
  const lifecycleProgress = watchLifecycle('progress');
 
  // Asset Master is the single source of truth - only "Available" assets
  // can ever be picked in the assignment / replacement dropdowns.
  const available = assets.filter((asset) => asset.status === 'Available');
 
  const filtered = useMemo(() => {
  return active.filter((row) => {
    if (
      filters.employeeName &&
      !row.employeeName?.toLowerCase().includes(filters.employeeName.toLowerCase())
    )
      return false;
 
    if (
      filters.project &&
      !row.project?.toLowerCase().includes(filters.project.toLowerCase())
    )
      return false;
 
    if (
      filters.assetType &&
      !row.asset?.assetType?.toLowerCase().includes(filters.assetType.toLowerCase())
    )
      return false;
 
    if (
      filters.serialNumber &&
      !row.asset?.serialNumber?.toLowerCase().includes(filters.serialNumber.toLowerCase())
    )
      return false;
 
    if (
      filters.dateFrom &&
      String(row.assignedDate).slice(0, 10) < filters.dateFrom
    )
      return false;
 
    if (
      filters.dateTo &&
      String(row.assignedDate).slice(0, 10) > filters.dateTo
    )
      return false;
 
    return true;
  });
}, [active, filters]);
 
  // Assigned Assets summary is always derived from assigned-asset records
  // only - never recalculated from Asset Master.
  const cards = {
    employees: new Set(active.map((row) => row.employeeId)).size,
    assigned: active.length,
    active: active.length,
    returned: history.filter((row) => row.currentStatus === 'Returned').length,
    replacement: history.filter((row) => row.currentStatus === 'Replacement').length,
    inactive: history.filter((row) => row.currentStatus === 'Inactive').length
  };
 
  const openForm = () => {
    reset({ ...emptyForm, rows: [emptyRow()] });
    setShowForm(true);
  };
 
  const saveAssignment = async (data) => {
    if (!data.rows.length) return toast.error('Add at least one asset.');
    setSubmitting(true);
    try {
      await assign({ employee: data, rows: data.rows });
      toast.success('Assets assigned successfully.');
      setShowForm(false);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };
 
 const openLifecycle = (row, pendingStatus) => {
  setLifecycle(row);

  resetLifecycle({
    status: pendingStatus || 'Returned',
    progress: '',
    reason: '',
    rows: []
  });
};
 
const completeLifecycle = async (data) => {
  setSubmitting(true);

  try {
    await moveToHistory(
      lifecycle,
      data.status,
      data.reason,
      data.status.toUpperCase() === 'REPLACEMENT'
        ? data.rows
        : [],
      data.status.toUpperCase() === 'REPLACEMENT'
        ? data.progress
        : null
    );

    toast.success('Asset moved to Assigned Asset History.');
    setLifecycle(null);
  } catch (error) {
    toast.error(error.message);
  } finally {
    setSubmitting(false);
  }
};
  const removeAssignment = async (row) => {
    try {
      await deleteActive(row.id);
      toast.success('Assignment removed.');
    } catch (error) {
      toast.error(error.message);
    }
  };
 
const saveRemarks = async (event) => {
  event.preventDefault();

  const data = new FormData(event.currentTarget);

  const status = data.get('status');
  const remarks = data.get('remarks');

  if (status === 'Active') {
    try {
      await updateActive(editing.id, {
        remarks
      });

      toast.success('Remarks updated.');
      setEditing(null);
    } catch (error) {
      toast.error(error.message);
    }

    return;
  }

  // Close the first modal and open lifecycle modal
  openLifecycle(editing, status);
  setEditing(null);
};
 
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Assigned Assets</h1>
          <p>Manage currently active employee asset assignments.</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-secondary" to="/assigned-assets/history">Assigned Asset History</Link>
          <button className="btn btn-primary" onClick={openForm} disabled={assetsLoading}>
            <FiPlus /> {assetsLoading ? 'Loading assets…' : 'New Assignment'}
          </button>
          <button className="btn btn-success"
            onClick={() => setShowExport(!showExport)}
          >Export</button>
        </div>
      </div>
 
      <div className="module-summary-grid">
        {[
          ['Total Employees', cards.employees],
          ['Total Assigned Assets', cards.assigned],
          ['Returned Assets', cards.returned],
          ['Replacement Assets', cards.replacement],
          ['Inactive Assets', cards.inactive]
        ].map(([label, value]) => (
          <article className="mini-summary" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
 
      <div className="filter-panel shadow-sm rounded-4 p-4 mb-4">
        <div className="filter-card">
          <div className="filter-header">
            <div>
              <h5>Assigned Asset Filters</h5>
              <p>Filter assigned assets using the fields below.</p>
            </div>
          </div>
 
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <label className="form-label">Employee Name</label>
              <input
                className="form-control"
                placeholder="Search employee"
                value={filters.employeeName}
                onChange={(e) => setFilters({ ...filters, employeeName: e.target.value })}
              />
            </div>
 
            <div className="col-lg-4">
              <label className="form-label">Project</label>
              <input
                className="form-control"
                placeholder="Search project"
                value={filters.project}
                onChange={(e) => setFilters({ ...filters, project: e.target.value })}
              />
            </div>
 
            <div className="col-lg-4">
              <label className="form-label">Asset Type</label>
              <input
                className="form-control"
placeholder="Search asset type"
value={filters.assetType}
onChange={(e) =>
  setFilters({ ...filters, assetType: e.target.value })
}
              />
            </div>
          </div>
 
          <div className="row g-4 align-items-end">
            <div className="col-lg-4">
              <label className="form-label">Serial Number</label>
              <input
                className="form-control"
                placeholder="Search serial number"
                value={filters.serialNumber}
                onChange={(e) => setFilters({ ...filters, serialNumber: e.target.value })}
              />
            </div>
 
            <div className="col-lg-2">
              <label className="form-label">From Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
 
            <div className="col-lg-2">
              <label className="form-label">To Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
 
            <div className="col-lg-4">
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light border px-4"
                  onClick={() =>
                    setFilters({
                      employeeName: '',
                      project: '',
                      assetType: '',
                      serialNumber: '',
                      dateFrom: '',
                      dateTo: ''
                    })
                  }
                >
                  Clear
                </button>
                <button type="button" className="btn btn-primary px-4">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
 
      {showExport && (
  <div className="card shadow-sm rounded-4 p-3 mb-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="mb-0">Export Assigned Assets</h5>
    </div>

    <ExportMenu
      columns={exportColumns}
      filteredRows={filtered}
      allRows={active}
      filename="Assigned_Assets"
      onClose={() => setShowExport(false)}
    />
  </div>
)}
 
      <div className="table-responsive data-panel">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              {['Employee ID', 'Employee Name', 'Project', 'Asset Name', 'Asset Type', 'Serial Number', 'Assigned Date', 'Status', 'Remarks', 'Actions'].map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.employeeId}</td>
                  <td>{row.employeeName}</td>
                  <td>{row.project}</td>
                  <td>{row.asset?.assetName}</td>
 
                  <td>{row.asset?.assetType}</td>
                 <td>{row.asset?.serialNumber}</td>
                  <td>{new Date(row.assignedDate).toLocaleString()}</td>
                  <td><StatusBadge value={row.status} /></td>
                  <td>{row.remarks || '-'}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="icon-btn" title="View" onClick={() => setSelected(row)}><FiEye /></button>
                      <button className="icon-btn" title="Edit" onClick={() => setEditing(row)}><FiEdit2 /></button>
                      <button className="icon-btn danger" title="Delete" onClick={() => removeAssignment(row)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center py-4 text-muted">No active assigned assets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
 
      {showForm && (
        <div className="modal-backdrop-custom">
          <div className="action-modal" role="dialog" aria-modal="true">
            <div className="action-modal-header">
              <h2>New Asset Assignment</h2>
              <button className="icon-btn" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="action-form" onSubmit={handleSubmit(saveAssignment)}>
              <label>Employee ID *<input className="form-control" {...register('employeeId', { required: true })} /></label>
              <label>Employee Name *<input className="form-control" {...register('employeeName', { required: true })} /></label>
              <label>Project<input className="form-control" {...register('project')} /></label>
              <label>Assigned Date &amp; Time<input className="form-control" type="datetime-local" {...register('assignedDate', { required: true })} /></label>
              <label className="form-span">Remarks<textarea className="form-control" {...register('remarks')} /></label>
 
              <div className="form-span">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Assigned Assets</strong>
                  <button className="btn btn-outline-primary btn-sm" type="button" onClick={() => append(emptyRow())}>
                    <FiPlus /> Add Asset
                  </button>
                </div>
 
                {fields.map((field, index) => (
                  <AssetAssignmentRow
                    key={field.id}
                    control={control}
                    index={index}
                    namePrefix="rows"
                    availableAssets={available}
                    selectedRows={selectedRows}
                    setValue={setValue}
                    remove={remove}
                    canRemove={fields.length > 1}
                  />
                ))}
              </div>
 
              <div className="modal-actions form-span">
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
 
      {selected && <Details title="Assigned Asset" row={selected} onClose={() => setSelected(null)} />}
 
     {editing && (
  <div className="modal-backdrop-custom">
    <div className="action-modal action-modal-sm">
      <div className="action-modal-header">
        <h2>Edit Assigned Asset</h2>

        <button
          className="icon-btn"
          type="button"
          onClick={() => setEditing(null)}
        >
          ×
        </button>
      </div>

      <form className="action-form" onSubmit={saveRemarks}>

        <label>
          Status

          <select
            className="form-select"
            name="status"
            defaultValue="Returned"
          >
            <option value="Returned">Returned</option>
            <option value="Replacement">Replacement</option>
            
          </select>
        </label>

        <label>
          Remarks

          <textarea
            className="form-control"
            name="remarks"
            defaultValue={editing.remarks}
          />
        </label>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setEditing(null)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Save
          </button>
        </div>

      </form>
    </div>
  </div>
)}
 
{lifecycle && (
  <div className="modal-backdrop-custom">
    <div className="action-modal action-modal-sm">

      <div className="action-modal-header">
        <h2>Update Asset Lifecycle</h2>

        <button
          className="icon-btn"
          type="button"
          onClick={() => setLifecycle(null)}
        >
          ×
        </button>
      </div>

      <form
        className="action-form"
        onSubmit={handleLifecycleSubmit(completeLifecycle)}
      >

        {/* STATUS */}
        <label>
          Status

          <select
            className="form-select"
            {...registerLifecycle('status')}
          >
            <option value="Returned">Returned</option>
            <option value="Replacement">Replacement</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        {/* REPLACEMENT PROGRESS */}
        {lifecycleStatus === 'Replacement' && (
          <label>
            Replacement Progress *

            <select
              className="form-select"
              {...registerLifecycle('progress', {
                required: 'Please select replacement progress'
              })}
            >
              <option value="">Select Progress</option>
              <option value="Repair">Repair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </label>
        )}

        {/* REASON */}
        <label>
          Reason *

          <textarea
            className="form-control"
            {...registerLifecycle('reason', {
              required: 'Reason is required'
            })}
          />
        </label>

        {/* REPLACEMENT ASSET */}
        {lifecycleStatus === 'Replacement' && (
          <div className="form-span">

            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="mb-0">
                Replacement Asset *
              </label>

              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => appendLifecycleRow(emptyRow())}
              >
                <FiPlus /> Add Asset
              </button>
            </div>

            {lifecycleFields.length === 0 && (
              <p className="text-muted small">
                Add at least one replacement asset.
              </p>
            )}

            {lifecycleFields.map((field, index) => (
              <AssetAssignmentRow
                key={field.id}
                control={lifecycleControl}
                index={index}
                namePrefix="rows"
                availableAssets={available}
                selectedRows={lifecycleRows}
                setValue={setLifecycleValue}
                remove={removeLifecycleRow}
                canRemove={lifecycleFields.length > 1}
              />
            ))}

          </div>
        )}

        {/* BUTTONS */}
        <div className="modal-actions">

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => setLifecycle(null)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Move to History'}
          </button>

        </div>

      </form>

    </div>
  </div>
)}
    </section>
  );
}

 
function Details({ title, row, onClose }) {
  return (
    <div className="modal-backdrop-custom">
      <div className="action-modal action-modal-sm">
        <div className="action-modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>
      <dl className="mb-0">
  <div>
    <dt>Employee ID</dt>
    <dd>{row.employeeId}</dd>
  </div>
 
  <div>
    <dt>Employee Name</dt>
    <dd>{row.employeeName}</dd>
  </div>
 
  <div>
    <dt>Project</dt>
    <dd>{row.project}</dd>
  </div>
 
  <div>
    <dt>Asset Name</dt>
    <dd>{row.asset?.assetName || "-"}</dd>
  </div>
 
  <div>
    <dt>Asset Type</dt>
    <dd>{row.asset?.assetType || "-"}</dd>
  </div>
 
  <div>
    <dt>Serial Number</dt>
    <dd>{row.asset?.serialNumber || "-"}</dd>
  </div>
 
  <div>
    <dt>Assigned Date</dt>
    <dd>{new Date(row.assignedDate).toLocaleString()}</dd>
  </div>
 
  <div>
    <dt>Status</dt>
    <dd>{row.status}</dd>
  </div>
 
  <div>
    <dt>Remarks</dt>
    <dd>{row.remarks || "-"}</dd>
  </div>
</dl>
      </div>
    </div>
  );
}
 
 
 