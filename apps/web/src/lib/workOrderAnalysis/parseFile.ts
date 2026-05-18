import type { FactoryId } from "../../data/types";
import type { AnalysisLineItem, AnalysisPart, WorkOrderAnalysisSession } from "./types";
import { uid } from "../../data/projectDraft";

const IMAGE_MIME = /^image\//i;

function cellStr(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return String(v).trim();
}

function scoreHeader(h: string): { part: number; qty: number; mat: number; acc: number } {
  const x = h.toLowerCase();
  let part = 0;
  let qty = 0;
  let mat = 0;
  let acc = 0;
  if (/قطع|قطعة|بند|صنف|وصف|description|item|part|product|name|اسم/.test(x)) part += 3;
  if (/كمية|qty|quantity|الكمية|عدد/.test(x)) qty += 3;
  if (/خامة|مادة|خشب|لوح|sheet|material|mdf|raw/.test(x)) mat += 2;
  if (/اكسسو|accessor|hardware|فitting|مفصل|قفل|مفصلة/.test(x)) acc += 2;
  return { part, qty, mat, acc };
}

function pickColumns(headers: string[]): {
  partCol: string | null;
  qtyCol: string | null;
  matCol: string | null;
  accCol: string | null;
} {
  let bestPart: { h: string; s: number } | null = null;
  let bestQty: { h: string; s: number } | null = null;
  let bestMat: { h: string; s: number } | null = null;
  let bestAcc: { h: string; s: number } | null = null;
  for (const h of headers) {
    if (!h) continue;
    const sc = scoreHeader(h);
    if (sc.part && (!bestPart || sc.part > bestPart.s)) bestPart = { h, s: sc.part };
    if (sc.qty && (!bestQty || sc.qty > bestQty.s)) bestQty = { h, s: sc.qty };
    if (sc.mat && (!bestMat || sc.mat > bestMat.s)) bestMat = { h, s: sc.mat };
    if (sc.acc && (!bestAcc || sc.acc > bestAcc.s)) bestAcc = { h, s: sc.acc };
  }
  return {
    partCol: bestPart?.h ?? null,
    qtyCol: bestQty?.h ?? null,
    matCol: bestMat?.h ?? null,
    accCol: bestAcc?.h ?? null,
  };
}

function defaultPart(factory: FactoryId): Omit<AnalysisPart, "id" | "name" | "qty"> {
  return {
    factory,
    department_id: factory === "WF-001" ? "DEPT_PANEL_PROC" : "DEPT_PREP",
    task_id: factory === "WF-001" ? "PANEL_CUT" : "TASK_SHEAR",
    optionalPlannedMinutes: null,
    includeInWorkOrder: true,
  };
}

export async function extractFromSpreadsheet(file: File, factoryHint: FactoryId): Promise<{
  parts: AnalysisPart[];
  materials: AnalysisLineItem[];
  accessories: AnalysisLineItem[];
  hints: string;
  preview: string[][];
}> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  if (rows.length === 0)
    return {
      parts: [],
      materials: [],
      accessories: [],
      hints: "لم يُعثر على صفوف في أول ورقة عمل.",
      preview: [] as string[][],
    };

  const headers = Object.keys(rows[0] ?? {}).map((k) => cellStr(k));
  const cols = pickColumns(headers);
  const hints: string[] = [
    cols.partCol ? `تم ربط عمود القطع: "${cols.partCol}"` : "لم يُكتشف عمود قطع صراحةً؛ راجع الصفوف يدوياً.",
    cols.qtyCol ? `الكمية: "${cols.qtyCol}"` : "",
    cols.matCol ? `خامات محتملة: "${cols.matCol}"` : "",
    cols.accCol ? `اكسسوارات محتملة: "${cols.accCol}"` : "",
  ].filter(Boolean);

  const materials: AnalysisLineItem[] = [];
  const accessories: AnalysisLineItem[] = [];
  const parts: AnalysisPart[] = [];

  const defPart = defaultPart(factoryHint);

  for (const row of rows) {
    const get = (c: string | null) => (c ? cellStr(row[c]) : "");
    const partName = cols.partCol ? get(cols.partCol) : "";
    const qty = cols.qtyCol ? get(cols.qtyCol) : "";
    const matName = cols.matCol ? get(cols.matCol) : "";
    const accName = cols.accCol ? get(cols.accCol) : "";

    if (matName) {
      materials.push({
        id: uid(),
        name: matName,
        spec: "",
        qty: qty || "",
        unit: "",
      });
    }
    if (accName) {
      accessories.push({
        id: uid(),
        name: accName,
        spec: "",
        qty: "",
        unit: "",
      });
    }
    if (partName && partName.length > 1) {
      parts.push({
        id: uid(),
        name: partName,
        qty: qty || "1",
        ...defPart,
      });
    }
  }

  if (parts.length === 0 && !cols.partCol) {
    for (const row of rows) {
      const values = Object.values(row).map((v) => cellStr(v)).filter((x) => x.length > 1);
      const line = values.join(" ").trim();
      if (line) {
        parts.push({
          id: uid(),
          name: line.slice(0, 200),
          qty: "1",
          ...defPart,
        });
      }
      if (parts.length >= 80) break;
    }
    hints.push("استُخدمت أسطر عامة كنص قطعة — يُستحسن تسمية الأعمدة في الملف لتقليل الأخطاء.");
  }

  const preview: string[][] = [
    headers,
    ...rows.slice(0, 24).map((row) => headers.map((h) => cellStr(row[h]))),
  ];

  return { parts, materials, accessories, hints: hints.join(" · "), preview };
}

export async function extractFromTextTable(file: File, factoryHint: FactoryId): Promise<{
  parts: AnalysisPart[];
  materials: AnalysisLineItem[];
  accessories: AnalysisLineItem[];
  hints: string;
}> {
  const text = await file.text();
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const defPart = defaultPart(factoryHint);
  const parts: AnalysisPart[] = [];
  for (const line of lines.slice(0, 120)) {
    if (/^sep=|^#/i.test(line)) continue;
    parts.push({
      id: uid(),
      name: line.slice(0, 200),
      qty: "1",
      ...defPart,
    });
  }
  return {
    parts,
    materials: [],
    accessories: [],
    hints:
      lines.length === 0
        ? "الملف نصّي فارغ."
        : "تم تقسيم الملف إلى أسطر؛ للملفات CSV يُفضَّل تحويلها إلى Excel بحقل «اسم القطعة» و«الكمية».",
  };
}

/** إنشاء جلسة جديدة ومحاولة الاستخراج حسب نوع الملف */
export async function analyzeUploadedFile(file: File, factoryHint: FactoryId): Promise<{
  session: Omit<WorkOrderAnalysisSession, "createdAt" | "updatedAt">;
  message: string;
  tablePreview: string[][];
}> {
  const base = file.name.replace(/\.[^.]+$/, "").replace(/_/g, " ");
  let parts: AnalysisPart[] = [];
  let materials: AnalysisLineItem[] = [];
  let accessories: AnalysisLineItem[] = [];
  let message = "";
  let tablePreview: string[][] = [];

  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  if (file.type === "application/pdf" || ext === "pdf") {
    message =
      "ملف PDF: المعاينة متاحة. الاستخراج الآلي يحتاج خدمة خلفية — أدخل أو صحّح القطع والخامات يدوياً في الجدول.";
  } else if (IMAGE_MIME.test(file.type) || ["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) {
    message =
      "صورة: المعاينة متاحة. راجع ما تم تقديره أو أدخل البيانات يدوياً بعد التحقق البصري من الملف.";
    parts.push({
      id: uid(),
      name: `قطعة من «${base}»`,
      qty: "1",
      ...defaultPart(factoryHint),
    });
  } else if (ext === "xlsx" || ext === "xls") {
    const r = await extractFromSpreadsheet(file, factoryHint);
    parts = r.parts;
    materials = r.materials;
    accessories = r.accessories;
    tablePreview = r.preview;
    message = `Excel · ${r.hints}`;
  } else if (ext === "csv" || file.type === "text/csv") {
    const r = await extractFromTextTable(file, factoryHint);
    parts = r.parts;
    message = `CSV · ${r.hints}`;
  } else {
    message =
      "نوع الملف غير مدعوم للاستخراج التلقائي؛ استخدم PDF/Excel/صورة أو حدّث الصف وأضف البيانات يدوياً.";
  }

  return {
    session: {
      id: uid(),
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      projectName: base,
      client: "",
      orderRef: "",
      notes: "",
      materials,
      accessories,
      parts,
      lastImportedAt: null,
    },
    message,
    tablePreview,
  };
}
