import { downloadTablePdf } from "./downloadTablePdf";
import { parseFirstSheetFromXlsx, trimTableForPdf } from "./parseXlsxTable";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export type ApiPdfExportOptions = {
  endpoint: string;
  query?: URLSearchParams;
  title: string;
  filename: string;
  subtitle?: string;
  maxColumns?: number;
};

/** Fetches the same XLSX export the API provides, then renders a branded PDF client-side. */
export async function downloadPdfFromApiExport(options: ApiPdfExportOptions): Promise<void> {
  const params = new URLSearchParams(options.query);
  params.set("format", "xlsx");

  const res = await fetch(`${API_BASE}${options.endpoint}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Export failed (${res.status})`);
  }

  const buffer = await res.arrayBuffer();
  const table = trimTableForPdf(await parseFirstSheetFromXlsx(buffer), options.maxColumns ?? 12);

  if (!table.headers.length) {
    throw new Error("No export data");
  }

  await downloadTablePdf({
    title: options.title,
    subtitle: options.subtitle,
    headers: table.headers,
    rows: table.rows,
    filename: options.filename,
  });
}
