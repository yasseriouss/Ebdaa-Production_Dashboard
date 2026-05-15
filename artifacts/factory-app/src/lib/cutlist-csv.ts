/** Import cutlists exported from Excel as CSV (UTF-8). */

export type WorkflowStatus = "لم يبدأ" | "جاري التنفيذ" | "منتهي";

export type CutlistPart = {
  id: string;
  partCode: string;
  description: string;
  qty: number;
  dimensions: string;
  department: string;
  workflowStatus: WorkflowStatus;
};

export type DepartmentOption = { value: string; label: string; factories: ("wood" | "metal")[] };

export const WORKFLOW_OPTIONS: WorkflowStatus[] = ["لم يبدأ", "جاري التنفيذ", "منتهي"];

export const DEPARTMENT_OPTIONS: DepartmentOption[] = [
  { value: "DEPT_SOLID_WOOD", label: "خشب طبيعي", factories: ["wood"] },
  { value: "DEPT_PANEL_PROC", label: "ألواح / مقطع CNC", factories: ["wood"] },
  { value: "DEPT_VENEER", label: "قشرة / مكابس", factories: ["wood"] },
  { value: "DEPT_SANDING", label: "صنفرة", factories: ["wood"] },
  { value: "DEPT_WOOD_PAINT", label: "دهانات خشب", factories: ["wood"] },
  { value: "DEPT_UPHOLSTERY", label: "تنجيد", factories: ["wood"] },
  { value: "DEPT_WOOD_ASSY", label: "تجميع خشبي", factories: ["wood"] },
  { value: "SUPPORT_POOL", label: "دعم / مساعدين خشب", factories: ["wood"] },
  { value: "METAL_CUT", label: "تقطيع معدني", factories: ["metal"] },
  { value: "METAL_WELD", label: "لحام معدني", factories: ["metal"] },
  { value: "METAL_ASSY", label: "تجميع معدني", factories: ["metal"] },
  { value: "METAL_PAINT", label: "دهان معدني", factories: ["metal"] },
  { value: "UNASSIGNED", label: "بدون إسناد بعد", factories: ["wood", "metal"] },
];

function newId(): string {
  return crypto.randomUUID();
}

function norm(s: unknown): string {
  return String(s ?? "")
    .replace(/^\uFEFF/, "")
    .trim();
}

function parseNumber(v: unknown): number {
  const s = norm(v).replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/** Minimal RFC4180-style CSV row split (handles quoted fields). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  let inQuotes = false;
  while (i < line.length) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        cur += c;
        i++;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i++;
      } else if (c === ",") {
        out.push(cur);
        cur = "";
        i++;
      } else {
        cur += c;
        i++;
      }
    }
  }
  out.push(cur);
  return out.map(norm);
}

function detectDelimiter(sample: string): string {
  const firstLine = sample.split(/\r?\n/).find(l => norm(l).length > 0) ?? "";
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis = (firstLine.match(/;/g) ?? []).length;
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  if (tabs >= semis && tabs >= commas) return "\t";
  if (semis > commas) return ";";
  return ",";
}

const QTY_KEYS = ["qty", "quantity", "كمية", "الكمية", "qty.", "q'ty", "count"];
const DESC_KEYS = ["description", "desc", "وصف", "اسم", "name", "item", "part name"];
const CODE_KEYS = ["code", "part", "partcode", "رقم", "كود", "قطعة", "item no", "no"];
const DEPT_KEYS = ["department", "dept", "قسم", "القسم"];
const DIM_KEYS = ["dim", "dimensions", "size", "أبعاد", "المقاس", "length"];
const _PROD_KEYS = ["product", "منتج", "assembly"];

function keyMatch(cell: string, keys: string[]): boolean {
  const c = cell.toLowerCase().replace(/\s+/g, " ");
  return keys.some(k => c === k || c.includes(k));
}

export function parseCutlistCsv(text: string): CutlistPart[] {
  const raw = norm(text);
  if (!raw) return [];

  const delim = detectDelimiter(raw);
  const lines = raw.split(/\r?\n/).filter(l => norm(l).length > 0);
  if (lines.length < 2) return [];

  const headerCells =
    delim === ","
      ? splitCsvLine(lines[0])
      : lines[0].split(delim === "\t" ? "\t" : delim).map(norm);

  const colIndex: Record<string, number> = {};
  headerCells.forEach((h, idx) => {
    const hn = norm(h).toLowerCase();
    if (!hn) return;
    if (keyMatch(hn, QTY_KEYS)) colIndex.qty = idx;
    else if (keyMatch(hn, DESC_KEYS)) colIndex.description = idx;
    else if (keyMatch(hn, CODE_KEYS)) colIndex.partCode = idx;
    else if (keyMatch(hn, DEPT_KEYS)) colIndex.department = idx;
    else if (keyMatch(hn, DIM_KEYS)) colIndex.dimensions = idx;
    else if (keyMatch(hn, _PROD_KEYS)) colIndex.product = idx;
  });

  if (colIndex.qty === undefined && colIndex.description === undefined && colIndex.partCode === undefined) {
    return [];
  }

  const rows: CutlistPart[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells =
      delim === ","
        ? splitCsvLine(lines[r])
        : lines[r].split(delim === "\t" ? "\t" : delim).map(norm);

    const qty = colIndex.qty !== undefined ? parseNumber(cells[colIndex.qty]) : 0;
    const description =
      colIndex.description !== undefined ? norm(cells[colIndex.description]) : "";
    const partCode =
      colIndex.partCode !== undefined ? norm(cells[colIndex.partCode]) : "";
    const department =
      colIndex.department !== undefined ? norm(cells[colIndex.department]) : "";
    const dimensions =
      colIndex.dimensions !== undefined ? norm(cells[colIndex.dimensions]) : "";

    if (!partCode && !description) continue;
    if (qty <= 0 && !description && !partCode) continue;

    rows.push({
      id: newId(),
      partCode: partCode || "—",
      description: description || partCode,
      qty: qty > 0 ? qty : 1,
      dimensions,
      department: department || "UNASSIGNED",
      workflowStatus: "لم يبدأ",
    });
  }

  return rows;
}

export function formatCutlistForOrderNotes(
  lineLabel: string,
  mainDepartment: string,
  parts: CutlistPart[],
): string {
  if (parts.length === 0) return "";
  const header = `قائمة قطع / Cutlist — ${lineLabel}\nقسم تجميع السطر: ${mainDepartment}\n`;
  const body = parts
    .map(
      (p, i) =>
        `${i + 1}. ${p.partCode} — ${p.description} × ${p.qty}` +
        (p.dimensions ? ` — ${p.dimensions}` : "") +
        ` | قسم: ${p.department} | حالة سير العمل: ${p.workflowStatus}`,
    )
    .join("\n");
  return `${header}${body}`;
}
