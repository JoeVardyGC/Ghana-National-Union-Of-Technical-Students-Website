/**
 * Utility to export an array of JSON objects to CSV file and trigger a download in the browser.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns?: { key: keyof T; header: string }[]
) {
  if (!rows || rows.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Determine headers and keys
  const keys = columns
    ? columns.map((col) => col.key)
    : (Object.keys(rows[0]) as (keyof T)[]);

  const headers = columns
    ? columns.map((col) => col.header)
    : (keys as string[]);

  // Build CSV content
  const csvContent = [
    // Header line
    headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','),
    // Data rows
    ...rows.map((row) =>
      keys
        .map((key) => {
          const val = row[key];
          if (val === null || val === undefined) return '""';
          if (Array.isArray(val)) return `"${val.join('; ').replace(/"/g, '""')}"`;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  // Create Blob & download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
