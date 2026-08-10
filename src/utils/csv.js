export function exportRowsToCsv(rows, filename = 'export.csv') {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headers = Array.from(new Set(safeRows.flatMap((row) => Object.keys(row))));
  const csv = [
    headers.join(','),
    ...safeRows.map((row) => headers.map((header) => escapeCsv(row[header])).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text) {
  const cleanText = String(text || '').replace(/^\uFEFF/, '');

  const lines = cleanText
    .split(/\r?\n/)
    .filter(line => line.trim() !== '');

  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map(header =>
    String(header || '')
      .replace(/^\uFEFF/, '')
      .trim()
  );

  return lines.slice(1).map(line => {
    const values = splitCsvLine(line);

    return headers.reduce((row, header, index) => {
      row[header] = String(values[index] || '').trim();
      return row;
    }, {});
  });
}

function escapeCsv(value = '') {
  const stringValue = String(value);

  return /[",\n]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

function splitCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += char;
    }
  }

  values.push(value);

  return values;
}
