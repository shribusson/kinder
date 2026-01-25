export function toCsv<T extends Record<string, unknown>>(rows: T[]) {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    if (value === null || value === undefined) {
      return "";
    }
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escape(row[header])).join(","));
  });
  return lines.join("\n");
}
