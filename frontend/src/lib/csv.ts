/**
 * Convert an array of objects to a CSV string.
 */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (rows.length === 0) return "";

  const cols: { key: keyof T; label: string }[] =
    headers ||
    (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({
      key: k,
      label: String(k),
    }));

  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // Quote if contains comma, quote, or newline
    if (/[",\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const head = cols.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => cols.map((c) => escape(row[c.key])).join(","))
    .join("\n");

  return `${head}\n${body}`;
}

/**
 * Trigger a client-side download of a CSV string.
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
