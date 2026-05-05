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
 *  6. من القائمة اضغط: الأمان > تهيئة الحماية والنسخ الاحتياطي
 *     From menu: Security > Setup Protection & Backup Trigger
 *
 *  ⚠️ IMPORTANT — استخدام Installable Trigger بدلاً من Simple Trigger:
 *  لتسجيل البريد الإلكتروني للمستخدم بدقة في سجل التعديلات، يجب إنشاء
 *  installable trigger يدوياً:
 *    Apps Script > Triggers (⏰) > Add Trigger
 *    Function: onEditInstallable
 *    Event source: From spreadsheet
 *    Event type: On edit
 *  This logs the actual editing user's email, not just the script owner.
 * ======================================================
 */

// ─── Sheet Names (يجب أن تطابق أسماء الشيتات تماماً) ──────────────────────
const SHEET_METAL    = "أوامر معدني";
const SHEET_WOODEN   = "أوامر خشبي";
const SHEET_DASH     = "لوحة التحكم";
const SHEET_SHARED   = "مشاريع مشتركة";
const SHEET_TRACKER  = "متابعة المراحل";
const SHEET_LOG      = "سجل التعديلات";   // Audit log sheet
const SHEET_ARCHIVE  = "أرشيف";           // Completed orders archive

// ─── Metal sheet column indices (1-based, for getRange) ─────────────────────
// Row 1 = Arabic headers, Row 2 = DB keys, Row 3+ = data
const METAL_DATA_START_ROW = 3;
const M_COL_MO_NUMBER    = 1;  // A — mo_number
const M_COL_QTY          = 5;  // E — qty
const M_COL_STAGE_FIRST  = 7;  // G — laser (ليزر)
const M_COL_STAGE_LAST   = 23; // W — delivery (التسليم)
const M_COL_COMPLETION   = 24; // X — completion_pct (derived)
const M_COL_BACKLOG      = 25; // Y — backlog_qty (derived)
const M_COL_BACKLOG_STS  = 26; // Z — backlog_status
const M_COL_STATUS       = 27; // AA — status
const M_COL_NOTES        = 28; // AB — notes
const M_COL_DELIVERED    = 29; // AC — delivered_qty
const M_COL_FACTORY      = 30; // AD — factory
const M_COL_EXP_DATE     = 31; // AE — expected_delivery_date
const M_TOTAL_COLS       = 31;

// ─── Wooden sheet column indices (1-based) ───────────────────────────────────
const WOOD_DATA_START_ROW = 3;
const W_COL_ORDER_NO   = 1;  // A — order_no
const W_COL_EXTENSION  = 2;  // B — extension (VBC-cleaned)
const W_COL_CLIENT     = 6;  // F — client
const W_COL_QTY        = 11; // K — qty
const W_COL_DONE       = 12; // L — done
const W_COL_REM        = 13; // M — rem (derived)
const W_COL_PCT        = 14; // N — completion_pct (derived)
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
const COLOR_HEADER   = "#1a1a2e"; // Dark navy (header rows)
const COLOR_NONE     = null;      // No fill

// ─── Security ────────────────────────────────────────────────────────────────
// أضف بريد كل مستخدم مسموح له بالتعديل (بالإضافة إلى مالك الملف دائماً)
// Add every editor's email here (the file owner is always allowed).
// Leave empty [] to allow ANY Google account that has sheet access to edit.
const ALLOWED_EDITORS = [
  // "manager@ebdaa.com",
  // "supervisor@ebdaa.com",
];

// ─── Backup settings ─────────────────────────────────────────────────────────
const BACKUP_FOLDER_NAME = "إبداع Backups";
const BACKUP_MAX_KEEP    = 30;  // Number of daily backups to retain

// ─── Edit-log columns (1-based) ──────────────────────────────────────────────
const LOG_DATA_START_ROW = 3;
const LOG_COL_TIMESTAMP  = 1; // A
const LOG_COL_USER       = 2; // B
const LOG_COL_SHEET      = 3; // C
const LOG_COL_CELL       = 4; // D
const LOG_COL_FIELD      = 5; // E
const LOG_COL_OLD        = 6; // F
const LOG_COL_NEW        = 7; // G
const LOG_COL_TYPE       = 8; // H — "تعديل" | "BLOCKED" | "BACKUP" | "PROTECT"
const LOG_TOTAL_COLS     = 8;

// ══════════════════════════════════════════════════════════════════════════════
//  MENU SETUP — يُشغَّل تلقائياً عند فتح الملف
// ══════════════════════════════════════════════════════════════════════════════

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🏭 إبداع Tools")
    // Data tools
    .addItem("♻️ تنظيف VBC (خشبي) — Clean VBC Extensions",        "cleanVBC")
    .addSeparator()
    .addItem("🔄 إعادة حساب نسب الإنجاز — Recalculate All",       "recalculateAll")
    .addSeparator()
    .addItem("🔴 تمييز الأوامر حسب الحالة — Highlight by Status",  "markOverdue")
    .addItem("🟢 مسح التمييز — Clear All Highlights",              "clearHighlights")
    .addSeparator()
    .addItem("📧 إرسال تقرير يومي — Send Daily Report",            "sendDailyReport")
    .addSeparator()
    // Security sub-menu
    .addSubMenu(SpreadsheetApp.getUi().createMenu("🔒 الأمان — Security")
      .addItem("🛡️ تطبيق الحماية على الشيتات — Protect Sheets",   "protectSheets")
      .addItem("⚙️ تهيئة النسخ الاحتياطي التلقائي — Setup Backup Trigger", "setupBackupTrigger")
      .addItem("💾 إنشاء نسخة احتياطية الآن — Backup Now",         "createDailyBackup")
    )
    .addSeparator()
    // Audit log sub-menu
    .addSubMenu(SpreadsheetApp.getUi().createMenu("📋 سجل التعديلات — Edit Log")
      .addItem("👁️ عرض السجل — View Log",                          "viewEditLog")
      .addItem("📤 إرسال السجل بالبريد — Export Log by Email",      "exportEditLog")
      .addItem("🗑️ مسح السجل القديم — Clear Old Log Entries",       "clearEditLog")
    )
    .addSeparator()
    .addItem("📦 أرشفة الأوامر المكتملة 100٪ — Archive Completed", "archiveCompleted")
    .addSeparator()
    .addItem("ℹ️ تعليمات الاستخدام — Instructions",               "showInstructions")
    .addToUi();
}

// ══════════════════════════════════════════════════════════════════════════════
//  onEdit — Simple trigger (يعمل تلقائياً عند كل تعديل)
//  NOTE: For accurate user email logging, also set up the installable trigger
//  "onEditInstallable" via Apps Script > Triggers > Add Trigger > On edit.
// ══════════════════════════════════════════════════════════════════════════════

function onEdit(e) {
  if (!e || !e.range) return;
  handleEdit_(e);
}

/**
 * Installable trigger version — set this up via Apps Script > Triggers.
 * Gives reliable Session.getActiveUser().getEmail() for all editors.
 */
function onEditInstallable(e) {
  if (!e || !e.range) return;
  handleEdit_(e);
}

/**
 * Core edit handler called by both simple and installable triggers.
 * @param {GoogleAppsScript.Events.SheetsOnEdit} e
 */
function handleEdit_(e) {
  const sheet = e.range.getSheet();
  const name  = sheet.getName();
  const col   = e.range.getColumn();
  const row   = e.range.getRow();

  // ── 1. Access control check ──────────────────────────────────────────────
  if (!isAllowedEditor_()) {
    // Revert the edit
    e.range.setValue(e.oldValue !== undefined ? e.oldValue : "");
    logEntry_(name,
              XLSX_cellRef_(row, col),
              getFieldName_(sheet, row, col),
              e.newValue,
              e.oldValue,
              "BLOCKED");
    SpreadsheetApp.getUi().alert(
      "🔒 ليس لديك صلاحية التعديل على هذا الملف.\n" +
      "You do not have edit permission for this file.\n\n" +
      "تواصل مع مدير النظام.\nContact the system administrator."
    );
    return;
  }

  // ── 2. Block edits to protected (derived) columns in data rows ────────────
  const DERIVED_METAL  = [M_COL_COMPLETION, M_COL_BACKLOG]; // X, Y
  const DERIVED_WOODEN = [W_COL_REM, W_COL_PCT];            // M, N

  if (name === SHEET_METAL  && row >= METAL_DATA_START_ROW && DERIVED_METAL.includes(col))  return;
  if (name === SHEET_WOODEN && row >= WOOD_DATA_START_ROW  && DERIVED_WOODEN.includes(col)) return;

  // ── 3. Log the edit to "سجل التعديلات" ───────────────────────────────────
  const fieldName = getFieldName_(sheet, row, col);
  logEntry_(name,
            XLSX_cellRef_(row, col),
            fieldName,
            e.oldValue !== undefined ? e.oldValue : "",
            e.value    !== undefined ? e.value    : "",
            "تعديل");

  // ── 4. Recalculate derived fields if needed ───────────────────────────────
  if (row < METAL_DATA_START_ROW && name === SHEET_METAL)  return;
  if (row < WOOD_DATA_START_ROW  && name === SHEET_WOODEN) return;

  if (name === SHEET_METAL) {
    const stageOrQty = col === M_COL_QTY ||
                       (col >= M_COL_STAGE_FIRST && col <= M_COL_STAGE_LAST);
    if (stageOrQty) recalculateMetalRow_(sheet, row);
  }

  if (name === SHEET_WOODEN) {
    if (col === W_COL_QTY || col === W_COL_DONE) recalculateWoodenRow_(sheet, row);
    if (col === W_COL_ORDER_NO)                  cleanVBCRow_(sheet, row);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  SECURITY — Sheet Protection
//  تطبيق الحماية على صفوف الرؤوس والأعمدة المحسوبة
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Protects:
 *  1. Header rows 1–2 on Metal, Wooden, Tracker, Dashboard, Shared sheets (read-only).
 *  2. Derived-formula columns on Metal (X, Y) and Wooden (M, N) — data rows 3+.
 *  3. Entire Dashboard and Shared Projects sheets (formula-only — no manual edits).
 * Allowed editors for protected ranges = file owner + ALLOWED_EDITORS list.
 */
function protectSheets() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const owner   = ss.getOwner().getEmail();
  const editors = [owner, ...ALLOWED_EDITORS].filter(Boolean);

  // Remove all existing protections first to avoid duplicates
  ss.getProtections(SpreadsheetApp.ProtectionType.RANGE).forEach(p => p.remove());
  ss.getProtections(SpreadsheetApp.ProtectionType.SHEET).forEach(p => p.remove());

  let count = 0;

  // Helper: protect a named range with description
  function protect_(sheet, range, description) {
    if (!sheet || !range) return;
    const p = range.protect().setDescription(description);
    p.removeEditors(p.getEditors());
    if (p.canDomainEdit()) p.setDomainEdit(false);
    p.addEditors(editors);
    count++;
  }

  // 1. Header rows (rows 1-2) on all data sheets — read-only for everyone
  [SHEET_METAL, SHEET_WOODEN, SHEET_TRACKER].forEach(sheetName => {
    const s = ss.getSheetByName(sheetName);
    if (!s) return;
    protect_(s, s.getRange("1:2"), `🔒 رؤوس ${sheetName} — لا تعديل`);
  });

  // 2. Derived-formula columns on Metal: X (completion) and Y (backlog)
  const metal = ss.getSheetByName(SHEET_METAL);
  if (metal) {
    protect_(metal, metal.getRange(`X3:X${metal.getMaxRows()}`),
             "🔒 نسبة الإنجاز (مشتقة) — لا تعديل يدوي");
    protect_(metal, metal.getRange(`Y3:Y${metal.getMaxRows()}`),
             "🔒 الباقي من المتأخرات (مشتق) — لا تعديل يدوي");
  }

  // 3. Derived-formula columns on Wooden: M (rem) and N (completion_pct)
  const wooden = ss.getSheetByName(SHEET_WOODEN);
  if (wooden) {
    protect_(wooden, wooden.getRange(`M3:M${wooden.getMaxRows()}`),
             "🔒 المتبقي (مشتق) — لا تعديل يدوي");
    protect_(wooden, wooden.getRange(`N3:N${wooden.getMaxRows()}`),
             "🔒 نسبة الإنجاز (مشتقة) — لا تعديل يدوي");
  }

  // 4. Dashboard and Shared Projects — fully protected (formula-driven sheets)
  [SHEET_DASH, SHEET_SHARED].forEach(sheetName => {
    const s = ss.getSheetByName(sheetName);
    if (!s) return;
    const p = s.protect().setDescription(`🔒 ${sheetName} — قراءة فقط`);
    p.removeEditors(p.getEditors());
    if (p.canDomainEdit()) p.setDomainEdit(false);
    p.addEditors(editors);
    count++;
  });

  // 5. Edit log sheet — protect header rows 1-2
  const logSheet = ss.getSheetByName(SHEET_LOG);
  if (logSheet) {
    protect_(logSheet, logSheet.getRange("1:2"), "🔒 رؤوس سجل التعديلات — لا تعديل");
  }

  logEntry_("SYSTEM", "—", "protectSheets", "", `${count} نطاق`, "PROTECT");

  SpreadsheetApp.getUi().alert(
    `✅ تم تطبيق الحماية على ${count} نطاق/شيت.\n` +
    `Protection applied to ${count} ranges/sheets.\n\n` +
    `المسموح لهم بالتعديل / Allowed editors:\n${editors.join("\n")}`
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DAILY BACKUP — نسخ احتياطي يومي تلقائي
//  ينسخ الملف كاملاً إلى مجلد "إبداع Backups" في Google Drive
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Creates an installable time-driven trigger that runs createDailyBackup()
 * every day at midnight (00:00–01:00).
 * Also calls protectSheets() once to initialise protections.
 * Safe to call multiple times — deletes existing backup triggers first.
 */
function setupBackupTrigger() {
  // Remove existing backup triggers to avoid duplicates
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "createDailyBackup")
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("createDailyBackup")
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();

  // Also set up protections on first run
  protectSheets();

  SpreadsheetApp.getUi().alert(
    "✅ تم إعداد النسخ الاحتياطي اليومي بنجاح.\n" +
    "Daily backup trigger created — runs every night at midnight.\n\n" +
    "📁 مجلد النسخ: " + BACKUP_FOLDER_NAME + "\n" +
    "🗂️ Backup folder: " + BACKUP_FOLDER_NAME + " (in Google Drive root)\n\n" +
    "تم تطبيق الحماية أيضاً / Sheet protections also applied."
  );
}

/**
 * Creates a full copy of the spreadsheet in the Drive backup folder.
 * Automatically deletes backups older than BACKUP_MAX_KEEP days.
 * Can be triggered manually or by a daily time-driven trigger.
 */
function createDailyBackup() {
  const ss   = SpreadsheetApp.getActiveSpreadsheet();
  const tz   = Session.getScriptTimeZone();
  const date = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm");
  const name = `إبداع Backup — ${date}`;

  // Get or create backup folder
  const folders = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  const folder  = folders.hasNext()
    ? folders.next()
    : DriveApp.createFolder(BACKUP_FOLDER_NAME);

  // Copy the spreadsheet file
  const file     = DriveApp.getFileById(ss.getId());
  const backup   = file.makeCopy(name, folder);

  // Log backup event
  logEntry_("SYSTEM", "—", "createDailyBackup", "", backup.getName(), "BACKUP");

  // Prune old backups — keep only the most recent BACKUP_MAX_KEEP
  deleteOldBackups_(folder);

  // If triggered automatically (no UI), skip the alert
  try {
    SpreadsheetApp.getUi().alert(
      `✅ تم إنشاء النسخة الاحتياطية بنجاح.\n` +
      `Backup created successfully.\n\n` +
      `📄 ${name}\n` +
      `📁 ${BACKUP_FOLDER_NAME}\n\n` +
      `محافظة على آخر ${BACKUP_MAX_KEEP} نسخة.\n` +
      `Keeping last ${BACKUP_MAX_KEEP} backups.`
    );
  } catch (_) {}
}

/**
 * Deletes the oldest backups in the folder, keeping at most BACKUP_MAX_KEEP.
 * @param {GoogleAppsScript.Drive.Folder} folder
 */
function deleteOldBackups_(folder) {
  const files = [];
  const iter  = folder.getFiles();
  while (iter.hasNext()) {
    const f = iter.next();
    files.push({ file: f, date: f.getDateCreated() });
  }

  // Sort newest first
  files.sort((a, b) => b.date - a.date);

  // Delete everything beyond the retention limit
  files.slice(BACKUP_MAX_KEEP).forEach(({ file }) => {
    logEntry_("SYSTEM", "—", "deleteOldBackup", file.getName(), "DELETED", "BACKUP");
    file.setTrashed(true);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  EDIT LOG — سجل التعديلات
//  يسجل كل تعديل: المستخدم، الوقت، الشيت، الخلية، الحقل، القيمة القديمة والجديدة
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Appends one entry to the "سجل التعديلات" sheet.
 * @param {string} sheetName
 * @param {string} cellRef    - e.g. "B5"
 * @param {string} fieldName  - DB key from row 2, or column label
 * @param {*}      oldValue
 * @param {*}      newValue
 * @param {string} type       - "تعديل" | "BLOCKED" | "BACKUP" | "PROTECT"
 */
function logEntry_(sheetName, cellRef, fieldName, oldValue, newValue, type) {
  try {
    const ss       = SpreadsheetApp.getActiveSpreadsheet();
    const logSheet = ss.getSheetByName(SHEET_LOG);
    if (!logSheet) return;

    const tz        = Session.getScriptTimeZone();
    const timestamp = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");
    let   user      = "";
    try { user = Session.getActiveUser().getEmail(); } catch (_) {}
    if (!user) user = "نظام / System";

    logSheet.appendRow([
      timestamp,
      user,
      sheetName,
      cellRef,
      fieldName  || "",
      oldValue   !== undefined && oldValue !== null ? oldValue.toString() : "",
      newValue   !== undefined && newValue !== null ? newValue.toString() : "",
      type       || "تعديل",
    ]);
  } catch (_) {
    // Silently ignore log errors to never block the actual edit
  }
}

/**
 * Returns the DB-key field name from row 2 of the given sheet for a column.
 * Falls back to the column letter if row 2 is empty.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} row - 1-based
 * @param {number} col - 1-based
 * @returns {string}
 */
function getFieldName_(sheet, row, col) {
  try {
    const key = sheet.getRange(2, col).getValue();
    if (key) return key.toString();
  } catch (_) {}
  return columnLetter_(col) + row;
}

/**
 * Converts a 1-based column index to a spreadsheet column letter (A, B, … AA, AB …).
 * @param {number} col
 * @returns {string}
 */
function columnLetter_(col) {
  let letter = "";
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter    = String.fromCharCode(65 + rem) + letter;
    col       = Math.floor((col - 1) / 26);
  }
  return letter;
}

/**
 * Returns an A1-style cell reference string, e.g. "AA5".
 * @param {number} row - 1-based
 * @param {number} col - 1-based
 * @returns {string}
 */
function XLSX_cellRef_(row, col) {
  return columnLetter_(col) + row;
}

/**
 * Returns true if the current user is allowed to edit.
 * Always allows if ALLOWED_EDITORS is empty (open access within sheet permissions).
 * @returns {boolean}
 */
function isAllowedEditor_() {
  if (ALLOWED_EDITORS.length === 0) return true;
  let email = "";
  try { email = Session.getActiveUser().getEmail(); } catch (_) {}
  if (!email) return true; // Cannot determine user — allow (fail open)
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const owner = ss.getOwner().getEmail();
  return email === owner || ALLOWED_EDITORS.includes(email);
}

/** Opens the edit log sheet so the user can review it. */
function viewEditLog() {
  const ss       = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(SHEET_LOG);
  if (!logSheet) {
    SpreadsheetApp.getUi().alert("⚠️ شيت سجل التعديلات غير موجود.\nLog sheet not found.");
    return;
  }
  ss.setActiveSheet(logSheet);
  SpreadsheetApp.getUi().alert(
    `📋 سجل التعديلات / Edit Log\n\n` +
    `إجمالي السجلات / Total entries: ${Math.max(0, logSheet.getLastRow() - 2)}`
  );
}

/**
 * Sends the full edit log as a CSV attachment to the active user's email.
 * الحد الأقصى / Max rows sent: 5000
 */
function exportEditLog() {
  const ss       = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(SHEET_LOG);
  if (!logSheet) {
    SpreadsheetApp.getUi().alert("⚠️ شيت سجل التعديلات غير موجود.");
    return;
  }

  const lastRow = logSheet.getLastRow();
  if (lastRow < LOG_DATA_START_ROW) {
    SpreadsheetApp.getUi().alert("ℹ️ السجل فارغ / Log is empty.");
    return;
  }

  const maxRows = Math.min(lastRow - 1, 5000);
  const data    = logSheet.getRange(1, 1, maxRows + 1, LOG_TOTAL_COLS).getValues();

  // Build CSV
  const csv = data.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const tz      = Session.getScriptTimeZone();
  const date    = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  const email   = Session.getActiveUser().getEmail();
  const subject = `📋 سجل التعديلات — إبداع — ${date}`;
  const body    = `مرحباً،\n\nمرفق سجل التعديلات لنظام إبداع حتى تاريخ ${date}.\n\nEbdaa edit log attached.\n\nالنظام / System`;

  GmailApp.sendEmail(email, subject, body, {
    attachments: [
      Utilities.newBlob(csv, "text/csv", `Ebdaa-EditLog-${date}.csv`)
    ],
  });

  SpreadsheetApp.getUi().alert(
    `✅ تم إرسال سجل التعديلات إلى:\n${email}\n\nEdit log sent to:\n${email}\n\n` +
    `السجلات المُرسلة: ${maxRows}`
  );
}

/**
 * Keeps only the most recent 1000 log entries (deletes older rows).
 * Preserves rows 1-2 (headers).
 */
function clearEditLog() {
  const ss       = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(SHEET_LOG);
  if (!logSheet) return;

  const ui = SpreadsheetApp.getUi();
  const res = ui.alert(
    "⚠️ تأكيد / Confirm",
    "هل تريد مسح السجلات الأقدم من آخر 1000 سطر؟\n" +
    "Delete log entries older than the last 1000 rows?",
    ui.ButtonSet.YES_NO
  );
  if (res !== ui.Button.YES) return;

  const lastRow  = logSheet.getLastRow();
  const dataRows = lastRow - 2;

  if (dataRows <= 1000) {
    ui.alert(`ℹ️ السجل يحتوي على ${dataRows} سطر فقط — لا شيء للحذف.`);
    return;
  }

  const deleteCount = dataRows - 1000;
  logSheet.deleteRows(LOG_DATA_START_ROW, deleteCount);

  ui.alert(
    `✅ تم حذف ${deleteCount} سطر قديم.\n` +
    `Deleted ${deleteCount} old log entries.\n` +
    `السجل الحالي: 1000 سطر / Current log: 1000 entries.`
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  ARCHIVE COMPLETED ORDERS — أرشفة الأوامر المكتملة 100٪
//
//  شرط الأرشفة / Archive condition:
//   • معدني: نسبة الإنجاز = 17 (كل المراحل مكتملة) أو الحالة "تم الانتهاء"/"تم التسليم"
//     Metal:  completion_pct = 17 (all 17 stages done) OR status in done list
//   • خشبي:  نسبة الإنجاز = 100 أو الحالة "تم التسليم"/"Delivered"
//     Wooden: completion_pct = 100 OR status in done list
//
//  العملية / Process:
//   1. تحديد الصفوف المكتملة في كل شيت.
//   2. نسخها إلى شيت "أرشيف" مع إضافة عمودَي: وقت الأرشفة + المصدر.
//   3. حذفها من الشيت الأصلي (من الأسفل للأعلى لتجنب إزاحة الفهارس).
//   4. تسجيل العملية في سجل التعديلات.
// ══════════════════════════════════════════════════════════════════════════════

function archiveCompleted() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const ui      = SpreadsheetApp.getUi();
  const metal   = ss.getSheetByName(SHEET_METAL);
  const wooden  = ss.getSheetByName(SHEET_WOODEN);

  // Confirm before moving
  const confirm = ui.alert(
    "📦 تأكيد الأرشفة / Confirm Archive",
    "سيتم نقل جميع الأوامر ذات نسبة الإنجاز 100٪ إلى شيت 'أرشيف'.\n" +
    "All 100% completed orders will be moved to the 'أرشيف' sheet.\n\n" +
    "هذا الإجراء لا يمكن التراجع عنه مباشرةً.\n" +
    "This action cannot be easily undone.\n\n" +
    "هل تريد المتابعة؟ / Continue?",
    ui.ButtonSet.YES_NO
  );
  if (confirm !== ui.Button.YES) return;

  // Get or create the Archive sheet
  let archive = ss.getSheetByName(SHEET_ARCHIVE);
  if (!archive) {
    archive = ss.insertSheet(SHEET_ARCHIVE);
    // Write header rows
    archive.getRange(1, 1, 1, 3).setValues([[
      "وقت الأرشفة", "المصدر",
      "← بيانات الأمر الكاملة / Full order row data →",
    ]]);
    archive.getRange(2, 1, 1, 3).setValues([[
      "archived_at", "source_sheet",
      "← see source sheet column layout →",
    ]]);
    archive.getRange("1:2").setFontWeight("bold").setBackground("#1a1a2e").setFontColor("#ffffff");
    archive.setFrozenRows(2);
  }

  const tz        = Session.getScriptTimeZone();
  const timestamp = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd HH:mm:ss");

  let metalArchived  = 0;
  let woodenArchived = 0;

  // ── METAL: collect rows to archive ────────────────────────────────────────
  const metalRowsToDelete = [];
  if (metal) {
    const mLastRow = metal.getLastRow();
    for (let r = METAL_DATA_START_ROW; r <= mLastRow; r++) {
      const moNum = metal.getRange(r, M_COL_MO_NUMBER).getValue();
      if (!moNum) continue;

      const compPct = parseFloat(metal.getRange(r, M_COL_COMPLETION).getValue()) || 0;
      const status  = (metal.getRange(r, M_COL_STATUS).getValue() || "").toString().trim();
      const isDone  = STATUS_METAL_DONE.includes(status) || compPct >= 17;

      if (!isDone) continue;

      // Read full row data
      const rowData = metal.getRange(r, 1, 1, M_TOTAL_COLS).getValues()[0];

      // Append to archive: [timestamp, source, ...rowData]
      archive.appendRow([timestamp, SHEET_METAL, ...rowData]);

      logEntry_(SHEET_METAL, `row ${r}`, moNum.toString(), status, "أرشيف", "ARCHIVE");
      metalRowsToDelete.push(r);
      metalArchived++;
    }
  }

  // ── WOODEN: collect rows to archive ───────────────────────────────────────
  const woodenRowsToDelete = [];
  if (wooden) {
    const wLastRow = wooden.getLastRow();
    for (let r = WOOD_DATA_START_ROW; r <= wLastRow; r++) {
      const orderNo = wooden.getRange(r, W_COL_ORDER_NO).getValue();
      if (!orderNo) continue;

      const compPct = parseFloat(wooden.getRange(r, W_COL_PCT).getValue()) || 0;
      const status  = (wooden.getRange(r, W_COL_STATUS).getValue() || "").toString().trim();
      const isDone  = STATUS_WOODEN_DONE.includes(status) || compPct >= 100;

      if (!isDone) continue;

      const rowData = wooden.getRange(r, 1, 1, W_TOTAL_COLS).getValues()[0];
      archive.appendRow([timestamp, SHEET_WOODEN, ...rowData]);

      logEntry_(SHEET_WOODEN, `row ${r}`, orderNo.toString(), status, "أرشيف", "ARCHIVE");
      woodenRowsToDelete.push(r);
      woodenArchived++;
    }
  }

  // ── Delete source rows bottom-to-top (avoids index shift) ─────────────────
  metalRowsToDelete.slice().reverse().forEach(r => metal.deleteRow(r));
  woodenRowsToDelete.slice().reverse().forEach(r => wooden.deleteRow(r));

  // ── Style archive rows (green background for new entries) ─────────────────
  const archLastRow = archive.getLastRow();
  const newRows     = metalArchived + woodenArchived;
  if (newRows > 0 && archLastRow >= 3) {
    archive.getRange(archLastRow - newRows + 1, 1, newRows, archive.getLastColumn())
      .setBackground(COLOR_DONE);
  }

  if (metalArchived + woodenArchived === 0) {
    ui.alert(
      "ℹ️ لا توجد أوامر مكتملة 100٪ للأرشفة.\n" +
      "No 100% completed orders found to archive."
    );
    return;
  }

  ui.alert(
    `✅ تمت الأرشفة بنجاح! / Archive complete!\n\n` +
    `🔩 معدني / Metal:  ${metalArchived} أمر\n` +
    `🪵 خشبي / Wooden:  ${woodenArchived} أمر\n` +
    `📦 الإجمالي / Total: ${metalArchived + woodenArchived} أمر\n\n` +
    `جميع الأوامر المكتملة نُقلت إلى شيت "أرشيف".\n` +
    `All completed orders moved to the 'أرشيف' sheet.`
  );
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

  // Completion = SUM(all 17 stage quantities) / qty.
  // Matches sheet formula: =ROUND(SUM(G:W)/E, 1)
  const sumStages  = stages.reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
  const completion = Math.round((sumStages / qty) * 10) / 10;

  // Backlog = qty - delivered (التسليم = last stage, col W)
  const delivered = parseFloat(stages[stages.length - 1]) || 0;
  const backlog   = Math.max(0, qty - delivered);

  sheet.getRange(row, M_COL_COMPLETION).setValue(completion);
  sheet.getRange(row, M_COL_BACKLOG).setValue(backlog);
}

// ══════════════════════════════════════════════════════════════════════════════
//  WOODEN — Row-level recalculation
// ══════════════════════════════════════════════════════════════════════════════

function recalculateWoodenRow_(sheet, row) {
  const qty  = parseFloat(sheet.getRange(row, W_COL_QTY).getValue())  || 0;
  const done = parseFloat(sheet.getRange(row, W_COL_DONE).getValue()) || 0;

  sheet.getRange(row, W_COL_REM).setValue(Math.max(0, qty - done));
  sheet.getRange(row, W_COL_PCT).setValue(qty > 0 ? Math.round((done / qty) * 1000) / 10 : 0);
}

// ══════════════════════════════════════════════════════════════════════════════
//  RECALCULATE ALL — Full-sheet batch recalculation
// ══════════════════════════════════════════════════════════════════════════════

function recalculateAll() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const metal  = ss.getSheetByName(SHEET_METAL);
  const wooden = ss.getSheetByName(SHEET_WOODEN);

  if (!metal || !wooden) {
    SpreadsheetApp.getUi().alert(
      "⚠️ لم يتم العثور على أحد الشيتات.\nCould not find required sheets."
    );
    return;
  }

  let metalCount = 0, woodenCount = 0;

  const metalLastRow = metal.getLastRow();
  for (let r = METAL_DATA_START_ROW; r <= metalLastRow; r++) {
    if (!metal.getRange(r, M_COL_MO_NUMBER).getValue()) continue;
    recalculateMetalRow_(metal, r);
    metalCount++;
  }

  const woodenLastRow = wooden.getLastRow();
  for (let r = WOOD_DATA_START_ROW; r <= woodenLastRow; r++) {
    if (!wooden.getRange(r, W_COL_ORDER_NO).getValue()) continue;
    recalculateWoodenRow_(wooden, r);
    woodenCount++;
  }

  SpreadsheetApp.getUi().alert(
    `✅ تم تحديث نسب الإنجاز.\nRecalculation complete.\n\n` +
    `معدني / Metal: ${metalCount} أمر\n` +
    `خشبي / Wooden: ${woodenCount} أمر`
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  CLEAN VBC — Strips "VBC" prefix/suffix from Wooden Extension column
// ══════════════════════════════════════════════════════════════════════════════

function cleanVBC() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const wooden = ss.getSheetByName(SHEET_WOODEN);
  if (!wooden) {
    SpreadsheetApp.getUi().alert("⚠️ شيت أوامر خشبي غير موجود.");
    return;
  }

  const lastRow = wooden.getLastRow();
  let cleaned   = 0;
  for (let r = WOOD_DATA_START_ROW; r <= lastRow; r++) {
    if (!wooden.getRange(r, W_COL_ORDER_NO).getValue()) continue;
    cleanVBCRow_(wooden, r);
    cleaned++;
  }

  SpreadsheetApp.getUi().alert(
    `✅ تم تنظيف VBC من ${cleaned} صف.\nCleaned VBC from ${cleaned} rows.`
  );
}

function cleanVBCRow_(sheet, row) {
  const orderNo = sheet.getRange(row, W_COL_ORDER_NO).getValue().toString().trim();
  if (!orderNo) return;

  let ext = sheet.getRange(row, W_COL_EXTENSION).getValue().toString().trim();
  if (!ext) ext = orderNo;

  const clean = ext.toUpperCase()
    .replace(/^VBC[-_\s]*/g, "")
    .replace(/[-_\s]*VBC$/g, "")
    .replace(/\bVBC\b/g,     "")
    .trim();

  sheet.getRange(row, W_COL_EXTENSION).setValue(clean || orderNo);
}

// ══════════════════════════════════════════════════════════════════════════════
//  MARK OVERDUE — Colour-codes rows by status
// ══════════════════════════════════════════════════════════════════════════════

function markOverdue() {
  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const metal   = ss.getSheetByName(SHEET_METAL);
  const wooden  = ss.getSheetByName(SHEET_WOODEN);
  const today   = new Date();
  const todayD  = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (metal) {
    const lastRow = metal.getLastRow();
    for (let r = METAL_DATA_START_ROW; r <= lastRow; r++) {
      if (!metal.getRange(r, M_COL_MO_NUMBER).getValue()) continue;
      const status   = (metal.getRange(r, M_COL_STATUS).getValue()   || "").toString().trim();
      const expDate  = metal.getRange(r, M_COL_EXP_DATE).getValue();
      const rowRange = metal.getRange(r, 1, 1, M_TOTAL_COLS);
      const isLate   = expDate
        ? new Date(new Date(expDate).getFullYear(), new Date(expDate).getMonth(), new Date(expDate).getDate()) < todayD
          && !STATUS_METAL_DONE.includes(status)
        : false;

      if (STATUS_METAL_OVERDUE.includes(status) || isLate)  rowRange.setBackground(COLOR_OVERDUE);
      else if (STATUS_METAL_DONE.includes(status))           rowRange.setBackground(COLOR_DONE);
      else if (STATUS_METAL_ACTIVE.includes(status))         rowRange.setBackground(COLOR_ACTIVE);
      else                                                   rowRange.setBackground(COLOR_NONE);
    }
  }

  if (wooden) {
    const lastRow = wooden.getLastRow();
    for (let r = WOOD_DATA_START_ROW; r <= lastRow; r++) {
      if (!wooden.getRange(r, W_COL_ORDER_NO).getValue()) continue;
      const status   = (wooden.getRange(r, W_COL_STATUS).getValue()  || "").toString().trim();
      const dateEnd  = wooden.getRange(r, W_COL_PROD_END).getValue();
      const rowRange = wooden.getRange(r, 1, 1, W_TOTAL_COLS);
      const isDone   = STATUS_WOODEN_DONE.some(s => status === s);
      const isOver   = STATUS_WOODEN_OVERDUE.some(s => status === s);
      const isLate   = dateEnd
        ? new Date(new Date(dateEnd).getFullYear(), new Date(dateEnd).getMonth(), new Date(dateEnd).getDate()) < todayD
          && !isDone
        : false;

      if (isOver || isLate)                                  rowRange.setBackground(COLOR_OVERDUE);
      else if (isDone)                                       rowRange.setBackground(COLOR_DONE);
      else if (STATUS_WOODEN_ACTIVE.some(s => status === s)) rowRange.setBackground(COLOR_ACTIVE);
      else                                                   rowRange.setBackground(COLOR_NONE);
    }
  }

  SpreadsheetApp.getUi().alert(
    "✅ تم تلوين الأوامر حسب الحالة.\nRows colour-coded.\n\n" +
    "🔴 متوقف / Stalled or Late\n🟡 نشط / Active\n🟢 مكتمل / Delivered"
  );
}

function clearHighlights() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_METAL, SHEET_WOODEN, SHEET_SHARED, SHEET_TRACKER].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) sheet.getDataRange().setBackground(COLOR_NONE);
  });
  SpreadsheetApp.getUi().alert("✅ تم مسح جميع الألوان.\nAll highlights cleared.");
}

// ══════════════════════════════════════════════════════════════════════════════
//  SEND DAILY REPORT — إرسال التقرير اليومي بالبريد الإلكتروني
//
//  لإعداد الإرسال التلقائي / Automatic daily email:
//    Apps Script > Triggers (⏰) > Add Trigger
//    Function: sendDailyReport
//    Event source: Time-driven > Day timer > 7:00–8:00 AM
// ══════════════════════════════════════════════════════════════════════════════

function sendDailyReport() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const metal = ss.getSheetByName(SHEET_METAL);
  const wooden= ss.getSheetByName(SHEET_WOODEN);
  const email = Session.getActiveUser().getEmail();
  const tz    = Session.getScriptTimeZone();
  const date  = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

  const mStats = aggregateStats_(metal,  METAL_DATA_START_ROW, M_COL_MO_NUMBER, M_COL_STATUS,
                                  STATUS_METAL_ACTIVE,  STATUS_METAL_DONE,  STATUS_METAL_OVERDUE);
  const wStats = aggregateStats_(wooden, WOOD_DATA_START_ROW,  W_COL_ORDER_NO,  W_COL_STATUS,
                                  STATUS_WOODEN_ACTIVE, STATUS_WOODEN_DONE, STATUS_WOODEN_OVERDUE);

  // Count today's edit-log entries
  const logSheet  = ss.getSheetByName(SHEET_LOG);
  let editsToday  = 0;
  if (logSheet && logSheet.getLastRow() >= LOG_DATA_START_ROW) {
    const logData = logSheet.getRange(LOG_DATA_START_ROW, 1,
                      logSheet.getLastRow() - 2, 1).getValues();
    editsToday = logData.filter(r => r[0] && r[0].toString().startsWith(date)).length;
  }

  const subject = `🏭 تقرير إبداع اليومي — ${date}`;
  const body    = `
مرحباً / Hello,

هذا التقرير اليومي لنظام إدارة مصنعي إبداع للأثاث
Daily report for Ebdaa Furniture Factory Management System
التاريخ / Date: ${date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔩 المصنع المعدني / Metal Factory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total:     ${mStats.total}
  نشط              / Active:    ${mStats.active}
  مكتمل            / Completed: ${mStats.done}
  متوقف ⚠️         / Stalled:   ${mStats.overdue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🪵 المصنع الخشبي / Wooden Factory
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total:     ${wStats.total}
  نشط              / Active:    ${wStats.active}
  مكتمل            / Completed: ${wStats.done}
  متوقف ⚠️         / Stalled:   ${wStats.overdue}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 الإجمالي / Grand Total
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  إجمالي الأوامر   / Total:        ${mStats.total + wStats.total}
  تحتاج متابعة ⚠️  / Need Attention: ${mStats.overdue + wStats.overdue}
  تعديلات اليوم    / Today's Edits:  ${editsToday}

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

function aggregateStats_(sheet, dataStart, keyCol, statusCol,
                          activeStatuses, doneStatuses, overdueStatuses) {
  const stats = { total: 0, active: 0, done: 0, overdue: 0 };
  if (!sheet) return stats;
  const lastRow = sheet.getLastRow();
  for (let r = dataStart; r <= lastRow; r++) {
    if (!sheet.getRange(r, keyCol).getValue()) continue;
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
        body  { font-family: Arial, sans-serif; direction: rtl; padding: 16px;
                max-width: 560px; color: #1a1a2e; }
        h2    { color: #1a1a2e; border-bottom: 2px solid #f59e0b; padding-bottom: 8px; }
        h3    { color: #f59e0b; margin-top: 16px; }
        ul    { padding-right: 18px; }
        li    { margin-bottom: 6px; }
        code  { background: #f0f0f0; padding: 2px 5px; border-radius: 3px;
                font-size: 12px; direction: ltr; display: inline-block; }
        .tip  { background: #fff8e1; border-right: 3px solid #f59e0b;
                padding: 8px 12px; margin: 8px 0; border-radius: 4px; }
        .sec  { background: #e8f5e9; border-right: 3px solid #4caf50;
                padding: 8px 12px; margin: 8px 0; border-radius: 4px; }
        footer{ color: #888; font-size: 11px; margin-top: 16px;
                border-top: 1px solid #ddd; padding-top: 8px; }
      </style>
    </head>
    <body>
      <h2>🏭 نظام إبداع — تعليمات الاستخدام</h2>

      <h3>📋 الشيتات / Sheets</h3>
      <ul>
        <li><b>أوامر معدني</b>: أدخل رقم MOM، الكميات في كل مرحلة (G→W). تُحسب النسبة تلقائياً.</li>
        <li><b>أوامر خشبي</b>: أدخل رقم الأمر، الكمية (K)، والمنجز (L). يُحسب المتبقي تلقائياً.</li>
        <li><b>لوحة التحكم</b>: تتحدث تلقائياً — قراءة فقط.</li>
        <li><b>مشاريع مشتركة</b>: تملأ تلقائياً — قراءة فقط.</li>
        <li><b>متابعة المراحل</b>: سجّل كل تحريك كمية بين المراحل.</li>
        <li><b>سجل التعديلات</b>: يُملأ تلقائياً — لا تعديل. يسجل كل تغيير مع المستخدم والوقت.</li>
      </ul>

      <h3>🔒 الأمان / Security</h3>
      <div class="sec">
        <b>أول خطوة:</b> من قائمة 🏭 إبداع > الأمان > تهيئة الحماية والنسخ الاحتياطي.<br>
        هذا يطبق الحماية على رؤوس الجداول والأعمدة المحسوبة، ويُعدّ النسخ الاحتياطي اليومي.<br><br>
        <b>First step:</b> Menu 🏭 > Security > Setup Protection &amp; Backup Trigger.<br>
        Protects headers &amp; formula columns. Sets up daily auto-backup.
      </div>

      <h3>📋 سجل التعديلات / Edit Log</h3>
      <ul>
        <li>كل تعديل يُسجَّل تلقائياً في شيت "سجل التعديلات".</li>
        <li>العمود A: التاريخ/الوقت — B: المستخدم — C: الشيت — D: الخلية — E: الحقل — F: القديم — G: الجديد — H: النوع.</li>
        <li>لعرض السجل: قائمة > سجل التعديلات > عرض السجل.</li>
        <li>لتصديره CSV: قائمة > سجل التعديلات > إرسال السجل بالبريد.</li>
      </ul>
      <div class="tip">
        لتسجيل البريد الإلكتروني الفعلي للمستخدم (وليس مالك الملف فقط)، أنشئ:<br>
        Apps Script &gt; Triggers &gt; Add Trigger<br>
        Function: <code>onEditInstallable</code> &nbsp;|&nbsp;
        Event: <code>From spreadsheet &gt; On edit</code>
      </div>

      <h3>💾 النسخ الاحتياطي / Backup</h3>
      <ul>
        <li>يحفظ تلقائياً كل يوم في Google Drive مجلد "<b>إبداع Backups</b>".</li>
        <li>يحتفظ بآخر ${BACKUP_MAX_KEEP} نسخة ويحذف الأقدم تلقائياً.</li>
        <li>للنسخ الفوري: قائمة > الأمان > إنشاء نسخة احتياطية الآن.</li>
      </ul>

      <h3>⚙️ الأدوات الأخرى / Other Tools</h3>
      <ul>
        <li><b>تنظيف VBC</b>: يحذف كلمة VBC من عمود الامتداد في الأوامر الخشبية.</li>
        <li><b>إعادة حساب</b>: يعيد حساب % لجميع الصفوف دفعةً واحدة.</li>
        <li><b>تمييز الأوامر</b>: يلوّن الصفوف 🔴 متوقف 🟡 نشط 🟢 مكتمل.</li>
        <li><b>تقرير يومي</b>: يرسل ملخصاً + عدد تعديلات اليوم لبريدك الإلكتروني.</li>
      </ul>

      <footer>نظام إدارة مصنعي إبداع للأثاث — 2025<br>
              Ebdaa Furniture Factory Management System</footer>
    </body>
    </html>
  `).setWidth(580).setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, "تعليمات الاستخدام — Instructions");
}
