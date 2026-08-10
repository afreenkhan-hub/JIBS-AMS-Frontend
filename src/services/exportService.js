import { exportRowsToCsv } from '../utils/csv.js';

export function exportRows({ rows, columns, selectedKeys, filename }) {
  const exportableColumns = columns.filter((column) => selectedKeys.includes(column.key));
  const shapedRows = rows.map((row) => exportableColumns.reduce((item, column) => {
    item[column.label] = row[column.key] ?? '';
    return item;
  }, {}));

  exportRowsToCsv(shapedRows, filename);
}
