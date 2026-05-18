import { pdf } from "@react-pdf/renderer";
import { ensurePdfFonts } from "./fonts";
import { TableReportDocument, type TableReportProps } from "./TableReportDocument";

export type DownloadTablePdfOptions = TableReportProps & {
  filename: string;
};

export async function downloadTablePdf(options: DownloadTablePdfOptions): Promise<void> {
  ensurePdfFonts();
  const { filename, ...docProps } = options;
  const blob = await pdf(<TableReportDocument {...docProps} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
