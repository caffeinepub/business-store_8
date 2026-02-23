// Utility functions for CSV generation and file download

/**
 * Escapes special characters in CSV fields (quotes, commas, newlines)
 */
function escapeCsvField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) {
    return '';
  }
  
  const stringField = String(field);
  
  // If field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  
  return stringField;
}

/**
 * Converts array data to CSV format
 */
export function arrayToCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  if (rows.length === 0) {
    return headers.map(escapeCsvField).join(',');
  }
  
  const csvHeaders = headers.map(escapeCsvField).join(',');
  const csvRows = rows.map(row => 
    row.map(escapeCsvField).join(',')
  ).join('\n');
  
  return `${csvHeaders}\n${csvRows}`;
}

/**
 * Triggers browser download of CSV file
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates a timestamp-based filename
 */
export function generateTimestampedFilename(prefix: string, extension: string = 'csv'): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${prefix}-${year}-${month}-${day}.${extension}`;
}
