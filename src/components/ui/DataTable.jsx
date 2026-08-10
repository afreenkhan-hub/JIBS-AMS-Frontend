import { useMemo, useState, useEffect } from 'react';

export function DataTable({ columns, rows, empty = 'No records found.', searchable = true, pageSize = 8 }) {
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

const filteredRows = useMemo(() => {
  if (!searchable || !search.trim()) return rows || [];

  const term = search.trim().toLowerCase();

  return (rows || []).filter((row) =>
    Object.values(row).some((value) =>
      String(value ?? "").toLowerCase().includes(term)
    )
  );
}, [rows, search, searchable]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filteredRows.slice((safePage - 1) * pageSize, safePage * pageSize);
useEffect(() => {
  setPage(1);
}, [rows]);
  return (
    <div className="data-panel">
      {searchable && (
        <div className="table-toolbar">
          <input
            className="form-control"
            placeholder="Search records..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <span>{filteredRows.length} record(s)</span>
        </div>
      )}
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead>

  <tr>
    {columns.map((column) => (
      <th key={column.key}>{column.label}</th>
    ))}
  </tr>

          </thead>
          <tbody>
            {pagedRows?.length ? (
              pagedRows.map((row, index) => (
                <tr key={`${row.ticket_number || row.id || row.asset_id || 'row'}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">{empty}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button className="btn btn-outline-secondary btn-sm" type="button" disabled={safePage === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <span>Page {safePage} of {totalPages}</span>
          <button className="btn btn-outline-secondary btn-sm" type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
