import type { CsvColumn } from "../csv";

export function rowsToTableData<T>(
  rows: T[],
  columns: CsvColumn<T>[],
): { headers: string[]; rows: string[][] } {
  const headers = columns.map((c) => c.header);
  const data = rows.map((row) =>
    columns.map((c) => {
      const v = c.accessor(row);
      return v === null || v === undefined ? "" : String(v);
    }),
  );
  return { headers, rows: data };
}
