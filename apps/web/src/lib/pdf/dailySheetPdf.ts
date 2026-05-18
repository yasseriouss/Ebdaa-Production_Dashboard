import type { DailySheetParams } from "../dailySheet";
import { downloadTablePdf } from "./downloadTablePdf";

export async function downloadDailySheetPdf(params: DailySheetParams): Promise<void> {
  const date = params.date ?? new Date().toISOString().slice(0, 10);
  const headers = [
    "#",
    "رقم الأمر",
    "المشروع",
    "المنتج",
    "الكمية المستهدفة",
    "منجز",
    "ملاحظات",
  ];

  const rows = params.rows.map((row, index) => [
    String(index + 1),
    row.order_id,
    row.project,
    row.product,
    String(row.target_qty),
    "",
    "",
  ]);

  await downloadTablePdf({
    title: `يومية الإنتاج — ${params.department_name}`,
    subtitle: `${params.factory_name} · ${date}`,
    headers,
    rows,
    filename: `daily-sheet-${params.department_id}-${date}`,
  });
}
