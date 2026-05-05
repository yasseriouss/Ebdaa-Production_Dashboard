/**
 * ======================================================
 *  نظام إدارة مصنعي إبداع للأثاث — Google Apps Script
 *  Ebdaa Furniture Factories — Google Apps Script
 * ======================================================
 *
 *  كيفية التثبيت / How to Install:
 *  1. افتح ملف Google Sheets / Open your Google Sheet
 *  2. Extensions > Apps Script
 *  3. احذف المحتوى الافتراضي والصق هذا الكود كاملاً
 *     Delete default content and paste this entire file
 *  4. احفظ (Ctrl+S) ثم أعد تحميل الشيت / Save then reload Sheet
 *  5. ستظهر قائمة "🏭 إبداع Tools" في شريط القوائم
 *     A "🏭 إبداع Tools" menu will appear in the menu bar
 *  6. اضغط "تشغيل" على دالة onOpen مرة واحدة لمنح الصلاحيات
 *     Run onOpen once to grant permissions
 * ======================================================
 *
 *  المشاريع المشتركة / Shared Projects:
 *  الشيت يستخدم صيغة FILTER تلقائياً تعمل في Google Sheets
 *  The sheet uses auto-FILTER formulas that work in Google Sheets
 * ======================================================
 */

// ─── Sheet Names (يجب أن تطابق أسماء الشيتات تماماً) ──────────────────────
const SHEET_METAL    = "أوامر معدني";
const SHEET_WOODEN   = "أوامر خشبي";
const SHEET_DASH     = "لوحة التحكم";
const SHEET_SHARED   = "مشاريع مشتركة";
const SHEET_TRACKER  = "متابعة المراحل";

// ─── Metal sheet column indices (1-based, for getRange) ─────────────────────
// Row 1 = Arabic headers, Row 2 = DB keys, Row 3+ = data
const METAL_DATA_START_ROW = 3;
const M_COL_MO_NUMBER    = 1;  // A — mo_number
const M_COL_QTY          = 5;  // E — qty
const M_COL_STAGE_FIRST  = 7;  // G — laser (ليزر)
const M_COL_STAGE_LAST   = 23; // W — delivery (التسليم)
const M_COL_COMPLETION   = 24; // X — completion_pct
const M_COL_BACKLOG      = 25; // Y — backlog_qty
const M_COL_BACKLOG_STS  = 26; // Z — backlog_status
const M_COL_STATUS       = 27; // AA — status
const M_COL_NOTES        = 28; // AB — notes
const M_TOTAL_COLS       = 28;

// ─── Wooden sheet column indices (1-based) ───────────────────────────────────
const WOOD_DATA_START_ROW = 3;
const W_COL_ORDER_NO   = 1;  // A — order_no
const W_COL_EXTENSION  = 2;  // B — extension (VBC-cleaned)
const W_COL_CLIENT     = 6;  // F — client
const W_COL_QTY        = 11; // K — qty
const W_COL_DONE       = 12; // L — done
const W_COL_REM        = 13; // M — rem
const W_COL_PCT        = 14; // N — completion_pct
const W_COL_STATUS     = 15; // O — status
const W_COL_PROD_END   = 17; // Q — prod_date_end
const W_TOTAL_COLS     = 18;

// ─── Status values (matching dashboard.ts exactly) ──────────────────────────
const STATUS_METAL_ACTIVE    = ["تحت التصنيع", "في المخزن"];
const STATUS_METAL_DONE      = ["تم الانتهاء", "تم التسليم"];
const STATUS_METAL_OVERDUE   = ["متوقف"];
const STATUS_WOODEN_ACTIVE   = ["تحت التصنيع", "Production"];
const STATUS_WOODEN_DONE     = ["تم التسليم", "Delivered"];
const STATUS_WOODEN_OVERDUE  = ["متوقف", "Hold"];

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLOR_OVERDUE  = "#F28B82"; // Red
const COLOR_ACTIVE   = "#FFE082"; // Amber
const COLOR_DONE     = "#CCFF90"; // Green
const COLOR_NONE     = null;      // No fill

// ══════════════════════════════════════════════════════════════════════════════
//  MENU SETUP — يُشغَّل تلقائياً عند فتح الملف
// ══════════════════════════════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏭 إبداع Tools")
    .addItem("♻️ تنظيف VBC (خشبي) — Clean VBC Extensions",      "cleanVBC")
    .addSeparator()
    .addItem("🔄 إعادة حساب نسب الإنجاز — Recalculate All",     "recalculateAll")
    .addSeparator()
    .addItem("🔴 تمييز الأوامر حسب الحالة — Highlight by Status","markOverdue")
    .addItem("🟢 مسح التمييز — Clear All Highlights",            "clearHighlights")
    .addSeparator()
    .addItem("📧 إرسال تقرير يومي — Send Daily Report",          "sendDailyReport")
    .addSeparator()
    .addItem("ℹ️ تعليمات الاستخدام — Instructions",             "showInstructions")
    .addToUi();
}

// ══════════════════════════════════════════════════════════════════════════════
//  onEdit TRIGGER
//  يُحدَّث تلقائياً عند تعديل أي خلية
//  Auto-updates when any cell is edited
// ══════════════════════════════════════════════════════════════════════════════

function onEdit(e) {
  if (!e || !e.range) return;

  const sheet   = e.range.getSheet();
  const name    = sheet.getName();
  const col     = e.range.getColumn();   // 1-based
  const row     = e.range.getRow();      // 1-based

  // Skip header rows
  if (row < METAL_DATA_START_ROW && name === SHEET_METAL)  return;
  if (row < WOOD_DATA_START_ROW  && name === SHEET_WOODEN) return;

  if (name === SHEET_METAL) {
    // Recalculate if Qty or any stage column changes
    const stageOrQty = col === M_COL_QTY ||
                       (col >= M_COL_STAGE_FIRST && col <= M_COL_STAGE_LAST);
    if (stageOrQty) {
      recalculateMetalRow_(sheet, row);
    }
  }

  if (name === SHEET_WOODEN) {
    // Recalculate if Qty or Done changes
    if (col === W_COL_QTY || col === W_COL_DONE) {
      recalculateWoodenRow_(sheet, row);
    }
    // If Order No changes, re-run VBC clean on that row
    if (col === W_COL_ORDER_NO) {
      cleanVBCRow_(sheet, row);
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  METAL — Row-level recalculation
//  يحسب نسبة الإنجاز والمتأخرات بناء على كميات المراحل
// ══════════════════════════════════════════════════════════════════════════════

function recalculateMetalRow_(sheet, row) {
  const qty = parseFloat(sheet.getRange(row, M_COL_QTY).getValue()) || 0;
  if (!qty) return;

  const stages = sheet
    .getRange(row, M_COL_STAGE_FIRST, 1, M_COL_STAGE_LAST - M_COL_STAGE_FIRST + 1)
    .getValues()[0];

  // Completion % = SUM(all 17 stage quantities) / (qty × 17) × 100.
  // Pipeline average completion: 100% when every stage column equals qty.
  // Matches sheet formula: =ROUND(SUM(G:W)/(E*17)*100, 1)
  const stageCount = M_COL_STAGE_LAST - M_COL_STAGE_FIRST + 1; // 17
  const sumStages  = stages.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  const completion = Math.round((sumStages / (qty * stageCount)) * 1000) / 10;

  // Backlog = qty - delivered (التسليم = last stage, col W)
  const delivered = parseFloat(stages[stages.length - 1]) || 0;
  const backlog   = Math.max(0, qty - delivered);

  sheet.getRange(row, M_COL_COMPLETION).setValue(Math.min(100, completion));
  sheet.getRange(row, M_COL_BACKLOG).setValue(backlog);
}

// ══════════════════════════════════════════════════════════════════════════════
//  WOODEN — Row-level recalculation
//  يحسب المتبقي ونسبة الإنجاز
// ══════════════════════════════════════════════════════════════════════════════

function recalculateWoodenRow_(sheet, row) {
  const qty  = parseFloat(sheet.getRange(row, W_COL_QTY).getValue())  || 0;
  const done = parseFloat(sheet.getRange(row, W_COL_DONE).getValue()) || 0;

  const rem = Math.max(0, qty - done);
  const pct = qty > 0 ? Math.round((done / qty) * 1000) / 10 : 0;

  sheet.getRange(row, W_COL_REM).setValue(rem);
  sheet.getRange(row, W_COL_PCT).setValue(pct);
}

// ══════════════════════════════════════════════════════════════════════════════
//  RECALCULATE ALL — Full-sheet batch recalculation
//  إعادة حساب كاملة لجميع الأوامر
// ══════════════════════════════════════════════════════════════════════════════

function recalculateAll() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const metal  = ss.getSheetByName(SHEET_METAL);
  const wooden = ss.getSheetByName(SHEET_WOODEN);

  if (!metal || !wooden) {
    SpreadsheetApp.getUi().alert(
      "⚠️ لم يتم العثور على أحد الشيتات. تأكد من أن أسماء الشيتات صحيحة.\n" +
      "Could not find required sheets. Check sheet names."
    );
    return;
  }

  let metalCount = 0, woodenCount = 0;

  const metalLastRow = metal.getLastRow();
  for (let r = METAL_DATA_START_ROW; r <= metalLastRow; r++) {
    const moNum = metal.getRange(r, M_COL_MO_NUMBER).getValue();
    if (!moNum) continue;
    recalculateMetalRow_(metal, r);
    metalCount++;
  }

  const woodenLastRow = wooden.getLastRow();
  for (let r = WOOD_DATA_START_ROW; r <= woodenLastRow; r++) {
    const orderNo = wooden.getRange(r, W_COL_ORDER_NO).getValue();
    if (!orderNo) continue;
    recalculateWoodenRow_(wooden, r);
    woodenCount++;
  }

  SpreadsheetApp.getUi().alert(
    `✅ تم تحديث نسب الإنجاز بنجاح.\n` +
    `Recalculation complete.\n\n` +
    `معدني / Metal: ${metalCount} أمر\n` +
    `خشبي / Wooden: ${woodenCount} أمر`
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLEAN VBC — Strips "VBC" prefix/suffix from Wooden orders Extension column
//  تنظيف كلمة VBC من عمود الامتداد في الأوامر الخشبية
// ══════════════════════════════════════════════════════════════════════════════

function cleanVBC() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const wooden = ss.getSheetByName(SHEET_WOODEN);
  if (!wooden) {
    SpreadsheetApp.getUi().alert("⚠️ شيت أوامر خشبي غير موجود.\nSheet 'أوامر خشبي' not found.");
    return;
  }

  const lastRow = wooden.getLastRow();
  let cleaned   = 0;

  for (let r = WOOD_DATA_START_ROW; r <= lastRow; r++) {
    const orderNo = wooden.getRange(r, W_COL_ORDER_NO).getValue();
    if (!orderNo) continue;
    cleanVBCRow_(wooden, r);
    cleaned++;
  }

  SpreadsheetApp.getUi().alert(
    `✅ تم تنظيف VBC من ${cleaned} صف.\nCleaned VBC from ${cleaned} rows.`
  );
}

/**
 * Cleans VBC from a single row's Extension field.
 * If Extension is empty, derives it from Order No.
 * Removes VBC- prefix, -VBC suffix, and standalone VBC (case-insensitive).
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row - 1-based row index
 */
function cleanVBCRow_(sheet, row) {
  const orderNo = sheet.getRange(row, W_COL_ORDER_NO).getValue().toString().trim();
  if (!orderNo) return;

  let ext = sheet.getRange(row, W_COL_EXTENSION).getValue().toString().trim();
  if (!ext) ext = orderNo; // fall back to order number

  // Remove VBC patterns (case-insensitive)
  const clean = ext.toUpperCase()
    .replace(/^VBC[-_\s]*/g, "")  // VBC prefix
    .replace(/[-_\s]*VBC$/g, "")  // VBC suffix
    .replace(/\bVBC\b/g,     "")  // standalone VBC
    .trim();

  sheet.getRange(row, W_COL_EXTENSION).setValue(clean || orderNo);
}

// ══════════════════════════════════════════════════════════════════════════════
//  MARK OVERDUE — Colour-codes rows by status
//  تمييز الصفوف بالألوان حسب الحالة
//  🔴 متوقف / Stalled    🟡 نشط / Active    🟢 مكتمل / Delivered
// ══════════════════════════════════════════════════════════════════════════════

function markOverdue() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const metal  = ss.getSheetByName(SHEET_METAL);
  const wooden = ss.getSheetByName(SHEET_WOODEN);
  const today  = new Date();

  // Day-level today (strips time component to avoid same-day false overdue)
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (metal) {
    const lastRow = metal.getLastRow();
    for (let r = METAL_DATA_START_ROW; r <= lastRow; r++) {
      const moNum = metal.getRange(r, M_COL_MO_NUMBER).getValue();
      if (!moNum) continue;
      const status  = (metal.getRange(r, M_COL_STATUS).getValue() || "").toString().trim();
      const rowRange = metal.getRange(r, 1, 1, M_TOTAL_COLS);

      // Date-based overdue: metal sheet col AC = expected_delivery_date (optional)
      const expDelivery = metal.getRange(r, M_TOTAL_COLS + 1).getValue();
      const isLateMetal = expDelivery
        ? new Date(new Date(expDelivery).getFullYear(), new Date(expDelivery).getMonth(), new Date(expDelivery).getDate()) < todayDate
          && !STATUS_METAL_DONE.includes(status)
        : false;

      if (STATUS_METAL_OVERDUE.includes(status) || isLateMetal) {
        rowRange.setBackground(COLOR_OVERDUE);
      } else if (STATUS_METAL_DONE.includes(status)) {
        rowRange.setBackground(COLOR_DONE);
      } else if (STATUS_METAL_ACTIVE.includes(status)) {
        rowRange.setBackground(COLOR_ACTIVE);
      } else {
        rowRange.setBackground(COLOR_NONE);
      }
    }
  }

  if (wooden) {
    const lastRow = wooden.getLastRow();
    for (let r = WOOD_DATA_START_ROW; r <= lastRow; r++) {
      const orderNo = wooden.getRange(r, W_COL_ORDER_NO).getValue();
      if (!orderNo) continue;
      const status   = (wooden.getRange(r, W_COL_STATUS).getValue()  || "").toString().trim();
      const dateEnd  = wooden.getRange(r, W_COL_PROD_END).getValue();
      const rowRange = wooden.getRange(r, 1, 1, W_TOTAL_COLS);

      const isDone    = STATUS_WOODEN_DONE.some(s => status === s);
      const isOverdue = STATUS_WOODEN_OVERDUE.some(s => status === s);
      // Day-level comparison: strip time from dateEnd to avoid same-day false positives
      const isLate    = dateEnd
        ? new Date(new Date(dateEnd).getFullYear(), new Date(dateEnd).getMonth(), new Date(dateEnd).getDate()) < todayDate
          && !isDone
        : false;

      if (isOverdue || isLate) {
        rowRange.setBackground(COLOR_OVERDUE);
      } else if (isDone) {
        rowRange.setBackground(COLOR_DONE);
      } else if (STATUS_WOODEN_ACTIVE.some(s => status === s)) {
        rowRange.setBackground(COLOR_ACTIVE);
      } else {
        rowRange.setBackground(COLOR_NONE);
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    "✅ تم تلوين الأوامر حسب الحالة.\nRows colour-coded by status.\n\n" +
    "🔴 متوقف / Stalled or Late\n" +
    "🟡 نشط / Active\n" +
    "🟢 مكتمل / Delivered"
  );
}

function clearHighlights() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_METAL, SHEET_WOODEN, SHEET_SHARED, SHEET_TRACKER].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) sheet.getDataRange().setBackground(COLOR_NONE);
  });
  SpreadsheetApp.getUi().alert(
    "✅ تم مسح جميع الألوان.\nAll highlights cleared."
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  SEND DAILY REPORT
//  يرسل ملخصاً بالبريد الإلكتروني كل يوم
//  Emails a daily summary to the active user
//
//  لإعداد الإرسال التلقائي / To set up automatic daily sending:
//    Apps Script > Triggers (⏰ icon) > Add Trigger
//    Function: sendDailyReport
//    Event source: Time-driven
//    Type: Day timer, between 7:00–8:00 AM
// ══════════════════════════════════════════════════════════════════════════════

function sendDailyReport() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const metal  = ss.getSheetByName(SHEET_METAL);
  const wooden = ss.getSheetByName(SHEET_WOODEN);
  const email  = Session.getActiveUser().getEmail();
  const date   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");

  // Aggregate metal stats
  const mStats = aggregateStats_(metal, METAL_DATA_START_ROW, M_COL_MO_NUMBER, M_COL_STATUS,
                                  STATUS_METAL_ACTIVE, STATUS_METAL_DONE, STATUS_METAL_OVERDUE);

  // Aggregate wooden stats
  const wStats = aggregateStats_(wooden, WOOD_DATA_START_ROW, W_COL_ORDER_NO, W_COL_STATUS,
                                  STATUS_WOODEN_ACTIVE, STATUS_WOODEN_DONE, STATUS_WOODEN_OVERDUE);

  const subject = `🏭 تقرير إبداع اليومي — ${date} / Ebdaa Daily Report`;
  const body = `
مرحباً / Hello,

هذا التقرير اليومي لنظام إدارة مصنعي إبداع للأثاث
Daily report for Ebdaa Furniture Factory Management System
التاريخ / Date: ${date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔩 المصنع المعدني / Metal Factory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total Orders:    ${mStats.total}
  نشط              / Active:           ${mStats.active}
  مكتمل            / Completed:        ${mStats.done}
  متوقف ⚠️         / Stalled:          ${mStats.overdue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪵 المصنع الخشبي / Wooden Factory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total Orders:    ${wStats.total}
  نشط              / Active:           ${wStats.active}
  مكتمل            / Completed:        ${wStats.done}
  متوقف ⚠️         / Stalled:          ${wStats.overdue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 الإجمالي الكلي / Grand Total
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total Orders:    ${mStats.total + wStats.total}
  تحتاج متابعة ⚠️  / Need Attention:  ${mStats.overdue + wStats.overdue}

🔗 رابط الشيت / Sheet URL:
${ss.getUrl()}

─────────────────────────────────────
نظام إدارة مصنعي إبداع للأثاث
Ebdaa Furniture Factory Management System
  `.trim();

  GmailApp.sendEmail(email, subject, body);

  SpreadsheetApp.getUi().alert(
    `✅ تم إرسال التقرير اليومي إلى:\n${email}\n\nDaily report sent to:\n${email}`
  );
}

/**
 * Aggregates order stats from a sheet.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} dataStart - first data row (1-based)
 * @param {number} keyCol    - column index of the order key (1-based)
 * @param {number} statusCol - column index of status (1-based)
 * @param {string[]} activeStatuses
 * @param {string[]} doneStatuses
 * @param {string[]} overdueStatuses
 * @returns {{ total: number, active: number, done: number, overdue: number }}
 */
function aggregateStats_(sheet, dataStart, keyCol, statusCol,
                          activeStatuses, doneStatuses, overdueStatuses) {
  const stats = { total: 0, active: 0, done: 0, overdue: 0 };
  if (!sheet) return stats;

  const lastRow = sheet.getLastRow();
  for (let r = dataStart; r <= lastRow; r++) {
    const key    = sheet.getRange(r, keyCol).getValue();
    if (!key) continue;
    stats.total++;
    const status = (sheet.getRange(r, statusCol).getValue() || "").toString().trim();
    if (activeStatuses.includes(status))  stats.active++;
    if (doneStatuses.includes(status))    stats.done++;
    if (overdueStatuses.includes(status)) stats.overdue++;
  }
  return stats;
}

// ══════════════════════════════════════════════════════════════════════════════
//  INSTRUCTIONS — نافذة تعليمات الاستخدام
// ══════════════════════════════════════════════════════════════════════════════

function showInstructions() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; direction: rtl; padding: 16px;
               max-width: 520px; color: #1a1a2e; }
        h2   { color: #1a1a2e; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; }
        h3   { color: #f59e0b; margin-top: 16px; }
        ul   { padding-right: 18px; }
        li   { margin-bottom: 6px; }
        code { background: #f0f0f0; padding: 2px 5px; border-radius: 3px;
               font-size: 12px; direction: ltr; display: inline-block; }
        .tip { background: #fff8e1; border-right: 3px solid #f59e0b;
               padding: 8px 12px; margin: 8px 0; border-radius: 4px; }
        footer { color: #888; font-size: 11px; margin-top: 16px; border-top: 1px solid #ddd;
                 padding-top: 8px; }
      </style>
    </head>
    <body>
      <h2>🏭 نظام إبداع — تعليمات الاستخدام</h2>

      <h3>📋 الشيتات / Sheets</h3>
      <ul>
        <li><b>أوامر معدني</b>: أدخل رقم MOM، الكميات في كل مرحلة (G→W). تُحسب النسبة تلقائياً.</li>
        <li><b>أوامر خشبي</b>: أدخل رقم الأمر، الكمية (K)، والمنجز (L). يُحسب المتبقي تلقائياً.</li>
        <li><b>لوحة التحكم</b>: تتحدث تلقائياً — لا تعديل يدوي.</li>
        <li><b>مشاريع مشتركة</b>: تملأ تلقائياً بالعملاء الموجودين في كلا المصنعين (في Google Sheets).</li>
        <li><b>متابعة المراحل</b>: سجّل كل تحريك كمية بين المراحل.</li>
      </ul>

      <h3>⚙️ الأدوات / Tools (قائمة 🏭 إبداع)</h3>
      <ul>
        <li><b>تنظيف VBC</b>: يحذف كلمة VBC من عمود الامتداد في الأوامر الخشبية.</li>
        <li><b>إعادة حساب نسب الإنجاز</b>: يعيد حساب % لجميع الصفوف دفعةً واحدة.</li>
        <li><b>تمييز الأوامر</b>: يلوّن الصفوف 🔴 متوقف 🟡 نشط 🟢 مكتمل.</li>
        <li><b>تقرير يومي</b>: يرسل ملخصاً لبريدك الإلكتروني.</li>
      </ul>

      <h3>⏰ التقرير التلقائي / Auto Daily Report</h3>
      <div class="tip">
        Apps Script &gt; Triggers (⏰) &gt; Add Trigger<br>
        Function: <code>sendDailyReport</code><br>
        Event: <code>Time-driven &gt; Day timer &gt; 7:00–8:00 AM</code>
      </div>

      <h3>🔢 ترتيب الصفوف / Row Structure</h3>
      <ul>
        <li>الصف 1: تسميات عربية / Arabic labels</li>
        <li>الصف 2: مفاتيح قاعدة البيانات / DB keys</li>
        <li>الصف 3+: البيانات / Data</li>
      </ul>

      <footer>نظام إدارة مصنعي إبداع للأثاث — 2025<br>
              Ebdaa Furniture Factory Management System</footer>
    </body>
    </html>
  `).setWidth(560).setHeight(540);
  SpreadsheetApp.getUi().showModalDialog(html, "تعليمات الاستخدام — Instructions");
}
