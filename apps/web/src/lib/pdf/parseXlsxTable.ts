export type ParsedSheetTable = {
  headers: string[];
  rows: string[][];
};

function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

/** Reads the first worksheet; row 0 = Arabic headers, data from row 2+ (skips English key row). */
export async function parseFirstSheetFromXlsx(buffer: ArrayBuffer): Promise<ParsedSheetTable> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };

  const sheet = wb.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  if (!aoa.length) return { headers: [], rows: [] };

  const headers = (aoa[0] ?? []).map(cellToString);
  const dataStart = aoa.length > 1 && looksLikeKeyRow(aoa[1]) ? 2 : 1;
  const rows: string[][] = [];

  for (let i = dataStart; i < aoa.length; i++) {
    const line = aoa[i] ?? [];
    if (!line.some((c) => cellToString(c) !== "")) continue;
    const row = headers.map((_, col) => cellToString(line[col]));
    rows.push(row);
  }

  return { headers, rows };
}

function looksLikeKeyRow(row: unknown[]): boolean {
  const sample = row.slice(0, 4).map(cellToString).join(" ");
  return /[a-z_]/.test(sample) && !/[\u0600-\u06FF]/.test(sample);
}

/** Caps columns for readable landscape PDFs. */
export function trimTableForPdf(table: ParsedSheetTable, maxCols = 12): ParsedSheetTable {
  if (table.headers.length <= maxCols) return table;
  return {
    headers: table.headers.slice(0, maxCols),
    rows: table.rows.map((r) => r.slice(0, maxCols)),
  };
}
