import type { FactoryId } from "../../data/types";
import type { AnalysisLineItem, AnalysisPart, WorkOrderAnalysisSession } from "./types";

function isAnalysisPart(x: unknown): x is AnalysisPart {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.qty === "string" &&
    (o.factory === "WF-001" || o.factory === "MF-001") &&
    typeof o.department_id === "string" &&
    typeof o.task_id === "string" &&
    (o.optionalPlannedMinutes === null || typeof o.optionalPlannedMinutes === "number") &&
    typeof o.includeInWorkOrder === "boolean"
  );
}

function isLineItem(x: unknown): x is AnalysisLineItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.spec === "string" &&
    typeof o.qty === "string" &&
    typeof o.unit === "string"
  );
}

/** يتحقق من شكل ملف JSON لتخزينه تحت مجلد Data/Projects محلياً */
export function parseWorkOrderAnalysisSessionJson(text: string): WorkOrderAnalysisSession {
  const raw = JSON.parse(text) as unknown;
  if (!raw || typeof raw !== "object") throw new Error("Invalid JSON root");
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string") throw new Error("Missing session id");
  if (typeof o.fileName !== "string") throw new Error("Missing fileName");
  if (typeof o.mimeType !== "string") throw new Error("Missing mimeType");
  if (!Array.isArray(o.materials) || !o.materials.every(isLineItem))
    throw new Error("Invalid materials");
  if (!Array.isArray(o.accessories) || !o.accessories.every(isLineItem))
    throw new Error("Invalid accessories");
  if (!Array.isArray(o.parts) || !o.parts.every(isAnalysisPart)) throw new Error("Invalid parts");

  return {
    id: o.id,
    createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date().toISOString(),
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : new Date().toISOString(),
    fileName: o.fileName,
    mimeType: o.mimeType,
    projectName: typeof o.projectName === "string" ? o.projectName : "",
    client: typeof o.client === "string" ? o.client : "",
    orderRef: typeof o.orderRef === "string" ? o.orderRef : "",
    notes: typeof o.notes === "string" ? o.notes : "",
    materials: o.materials,
    accessories: o.accessories,
    parts: o.parts.map((p) => ({
      ...p,
      factory: p.factory as FactoryId,
    })),
    lastImportedAt:
      o.lastImportedAt === null || o.lastImportedAt === undefined
        ? null
        : typeof o.lastImportedAt === "string"
          ? o.lastImportedAt
          : null,
  };
}

export function downloadAnalysisSessionJson(session: WorkOrderAnalysisSession): void {
  const slug = (session.projectName || session.fileName || "session")
    .replace(/[^\w\u0600-\u06FF\-]+/g, "_")
    .slice(0, 80);
  const blob = new Blob([JSON.stringify(session, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `${slug}-work-order-analysis.json`;
  a.click();
  URL.revokeObjectURL(url);
}
