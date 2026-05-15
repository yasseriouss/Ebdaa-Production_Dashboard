/**
 * Daily task-sheet generator. Produces a printable HTML document containing
 * a paper-traveler table with pre-filled order columns and blank input columns
 * (grey background) for handwritten capture on the factory floor.
 *
 * Outputs:
 * - downloadDailySheetHtml — saves a standalone `.html` file ready to print.
 * - openDailySheetPrint    — opens a hidden window and triggers `window.print`
 *                            so the supervisor can save as PDF directly.
 * - downloadDailySheetXls  — writes Excel-compatible HTML (`.xls`) using the
 *                            same column layout; opens cleanly in Excel/LibreOffice.
 */

export interface DailySheetRow {
  order_id: string;
  project: string;
  product: string;
  target_qty: number | string;
}

export interface DailySheetParams {
  factory_id: string;
  factory_name: string;
  department_id: string;
  department_name: string;
  rows: DailySheetRow[];
  /** ISO date string for the sheet header. */
  date?: string;
}

function escape(value: string | number): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHtmlDocument(params: DailySheetParams): string {
  const today = params.date ?? new Date().toISOString().slice(0, 10);
  const rowsHtml = params.rows
    .map(
      (row, index) => `
      <tr>
        <td class="num">${index + 1}</td>
        <td>${escape(row.order_id)}</td>
        <td>${escape(row.project)}</td>
        <td dir="rtl" lang="ar">${escape(row.product)}</td>
        <td class="num">${escape(row.target_qty)}</td>
        <td class="blank"></td>
        <td class="blank"></td>
        <td class="blank"></td>
        <td class="blank"></td>
        <td class="blank wide"></td>
      </tr>
    `,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Daily Task Sheet · ${escape(params.department_name)} · ${escape(today)}</title>
    <style>
      :root { color-scheme: light; }
      body { font-family: 'Helvetica Neue', Arial, 'Tajawal', sans-serif; color: #111; padding: 24px; }
      header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #111; padding-bottom: 8px; }
      h1 { margin: 0; font-size: 18px; letter-spacing: 2px; text-transform: uppercase; }
      .meta { font-size: 11px; color: #444; line-height: 1.4; }
      .meta strong { color: #111; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #888; padding: 6px 8px; font-size: 11px; vertical-align: middle; }
      th { background: #f0f0f0; text-transform: uppercase; letter-spacing: 1.5px; font-size: 10px; }
      td.num { text-align: center; font-weight: 600; }
      td.blank { background: #f4f4f4; min-height: 32px; height: 32px; }
      td.blank.wide { width: 180px; }
      .arabic { font-family: 'Tajawal', 'Cairo', Arial; direction: rtl; }
      footer { margin-top: 24px; display: flex; justify-content: space-between; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 1.5px; }
      @media print {
        body { padding: 12mm; }
        table { font-size: 10px; }
      }
    </style>
  </head>
  <body>
    <header>
      <div>
        <h1>Daily Task Sheet</h1>
        <p class="arabic" style="margin: 4px 0 0; font-size: 14px;">يومية القسم</p>
      </div>
      <div class="meta">
        <p><strong>Department:</strong> ${escape(params.department_id)} · ${escape(params.department_name)}</p>
        <p><strong>Factory:</strong> ${escape(params.factory_id)} · ${escape(params.factory_name)}</p>
        <p><strong>Date:</strong> ${escape(today)}</p>
      </div>
    </header>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Order ID</th>
          <th>Project</th>
          <th>Product / Part<br/><span class="arabic">المنتج / الجزء</span></th>
          <th>Target<br/><span class="arabic">المطلوب</span></th>
          <th>Completed Qty<br/><span class="arabic">المنفذ</span></th>
          <th>Scrap / Waste<br/><span class="arabic">الهالك</span></th>
          <th>Technician<br/><span class="arabic">الفني</span></th>
          <th>Date<br/><span class="arabic">التاريخ</span></th>
          <th>Notes<br/><span class="arabic">ملاحظات</span></th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || `<tr><td colspan="10" style="text-align:center; padding:24px;">No active tasks for this department.</td></tr>`}
      </tbody>
    </table>
    <footer>
      <div>
        Supervisor signature: ____________________
        <br/><span class="arabic">توقيع المشرف</span>
      </div>
      <div>
        Data entry clerk: ____________________
        <br/><span class="arabic">موظف إدخال البيانات</span>
      </div>
    </footer>
  </body>
</html>`;
}

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadDailySheetHtml(params: DailySheetParams) {
  const filename = `daily-sheet-${params.department_id}-${params.date ?? new Date().toISOString().slice(0, 10)}.html`;
  triggerDownload(filename, buildHtmlDocument(params), "text/html");
}

export function openDailySheetPrint(params: DailySheetParams) {
  const html = buildHtmlDocument(params);
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  window.setTimeout(() => win.print(), 300);
}

/**
 * Excel reads HTML tables saved with the `.xls` extension. Avoids pulling
 * SheetJS into the bundle while still producing a file Excel/Sheets accept.
 */
export function downloadDailySheetXls(params: DailySheetParams) {
  const filename = `daily-sheet-${params.department_id}-${params.date ?? new Date().toISOString().slice(0, 10)}.xls`;
  triggerDownload(filename, buildHtmlDocument(params), "application/vnd.ms-excel");
}
