import { useMemo, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
 
const getFileName = (filename, extension) => {
  const baseName = String(filename || 'export').replace(/\.(csv|xlsx|xls)$/i, '');
  return `${baseName}.${extension}`;
};
 
const escapeCsv = (value) => {
  const stringValue = String(value ?? '');
 
  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};
 
const downloadFile = (content, filename, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
 
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 
  window.setTimeout(() => URL.revokeObjectURL(url), 100);
};
const getValue = (obj, path) => {
  return path
    .split(".")
    .reduce((value, key) => value?.[key], obj) ?? "";
};
 
export function ExportMenu({
  columns = [],
  filteredRows = [],
  allRows = [],
  filename = 'export.csv',
  visibleColumns,
  onClose
}) {
  const selectableColumns = useMemo(
    () => columns.filter(
      (column) =>
        column.key !== 'actions' &&
        column.key !== 'approval' &&
        column.key !== 'select'
    ),
    [columns]
  );
 
  const [selected, setSelected] = useState(() =>
    selectableColumns.map((column) => column.key)
  );
 
  const selectedSet = useMemo(() => new Set(selected), [selected]);
 
  const visibleColumnKeys = useMemo(() => {
    if (Array.isArray(visibleColumns) && visibleColumns.length) {
      return visibleColumns;
    }
 
    return selectableColumns.map((column) => column.key);
  }, [selectableColumns, visibleColumns]);
 
  const toggle = (key) => {
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };
 
  const selectAllColumns = () => {
    setSelected(selectableColumns.map((column) => column.key));
  };
 
  const clearColumns = () => {
    setSelected([]);
  };
 
  const getExportColumns = (mode) => {
    if (mode === 'visible') {
      return selectableColumns.filter((column) =>
        visibleColumnKeys.includes(column.key)
      );
    }
 
    if (mode === 'all-columns') {
      return selectableColumns;
    }
 
    return selectableColumns.filter((column) => selectedSet.has(column.key));
  };
 
  const getExportRows = (scope) => (
    scope === 'all' ? allRows : filteredRows
  );
 
  const exportCsv = (scope, columnMode = 'selected') => {
    const exportColumns = getExportColumns(columnMode);
    const rows = getExportRows(scope);
 
    if (!exportColumns.length) {
      window.alert('Please select at least one column to export.');
      return;
    }
 
    if (!rows.length) {
      window.alert('There are no records available to export.');
      return;
    }
 
    const csv = [
      exportColumns.map((column) => escapeCsv(column.label)).join(','),
      ...rows.map((row) =>
        exportColumns
         .map((column) => escapeCsv(getValue(row, column.key)))
          .join(',')
      )
    ].join('\n');
 
    downloadFile(
      `\uFEFF${csv}`,
      getFileName(filename, 'csv'),
      'text/csv;charset=utf-8;'
    );
       onClose?.();
  };
 
  const exportExcel = (scope, columnMode = 'selected') => {
    const exportColumns = getExportColumns(columnMode);
    const rows = getExportRows(scope);
 
    if (!exportColumns.length) {
      window.alert('Please select at least one column to export.');
      return;
    }
 
    if (!rows.length) {
      window.alert('There are no records available to export.');
      return;
    }
 
    const escapeHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
 
    const tableRows = rows.map((row) => `
      <tr>
   ${exportColumns
  .map((column) => `<td>${escapeHtml(getValue(row, column.key))}</td>`)
  .join("")}
      </tr>
    `).join('');
 
    const excelContent = `
      <html>
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                ${exportColumns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;
 
    downloadFile(
      excelContent,
      getFileName(filename, 'xls'),
      'application/vnd.ms-excel;charset=utf-8;'
    );
       onClose?.();
  };

  return (
    <div className="export-panel">
      <div className="export-columns">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <strong>Select Columns</strong>
 
          <div className="d-flex gap-2">
            <button
              className="btn btn-link btn-sm p-0"
              type="button"
              onClick={selectAllColumns}
            >
              Select All
            </button>
 
            <button
              className="btn btn-link btn-sm p-0"
              type="button"
              onClick={clearColumns}
            >
              Clear
            </button>
          </div>
        </div>
 
        {selectableColumns.map((column) => (
          <label key={column.key}>
            <input
              type="checkbox"
              checked={selectedSet.has(column.key)}
              onChange={() => toggle(column.key)}
            />
            <span>{column.label}</span>
          </label>
        ))}
      </div>
 
      <div className="export-actions">
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => exportCsv('all', 'selected')}
        >
          <FiDownload />
          Export All
        </button>
 
        <button
          className="btn btn-outline-secondary btn-sm"
          type="button"
          onClick={() => exportCsv('filtered', 'selected')}
        >
          <FiDownload />
          Export Filtered
        </button>
 
        <button
          className="btn btn-outline-success btn-sm"
          type="button"
          onClick={() => exportExcel('filtered', 'selected')}
        >
          <FiDownload />
          Export Selected Columns Excel
        </button>
      </div>
    </div>
  );
}
 