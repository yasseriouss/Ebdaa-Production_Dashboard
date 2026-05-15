import type { ProjectDraft } from "../../data/projectDraft";
import { woodWorkOrdersFixture } from "../../data/fixtures/woodWorkOrders";
import type { WorkOrderAnalysisSession } from "./types";
import {
  draftsLookRelated,
  norm,
  sessionFingerprint,
} from "./fingerprint";
import type { ImportLogEntry, NewProjectAutosave } from "./storage";
import { loadImportLog } from "./storage";

export interface FixtureSimilarOrder {
  work_order_id: string;
  project_name: string;
  client: string;
  product_name: string;
  remaining: number;
}

export interface DuplicateAssessment {
  fingerprint: string;
  /** سبق استيراد نفس البصمة تقريباً */
  reusedImport: boolean;
  matchingImportEntries: ImportLogEntry[];
  /** أوامر خشب في العيّنة تشبه المشروع/الزبون/اسم قطعة */
  fixtureMatches: FixtureSimilarOrder[];
  /** مسودة «مشروع جديد» غير مكتملة لنفس المشروع والعميل */
  incompleteAutosave: NewProjectAutosave | null;
  /** أسماء قطع من التحليل تظهر أيضاً في مسودة الدمج — يتطلب موافقة */
  draftPartOverlaps: string[];
}

export interface AssessDuplicatesContext {
  importMode: "replace" | "merge";
  mergeFromAutosave: boolean;
  currentDraft: ProjectDraft;
}

function isIncompleteRelatedAutosave(
  autosave: NewProjectAutosave | null,
  session: WorkOrderAnalysisSession,
): autosave is NewProjectAutosave {
  return !!(
    autosave &&
    draftsLookRelated(autosave.draft, session) &&
    autosave.step < 3 &&
    (autosave.draft.products.length > 0 || autosave.draft.name.trim())
  );
}

function collectDraftPartNormalizedNames(d: ProjectDraft): Set<string> {
  const set = new Set<string>();
  for (const p of d.products) {
    for (const part of p.parts) {
      const n = norm(part.name);
      if (n) set.add(n);
    }
  }
  return set;
}

/** قطع الجلسة (المفعّلة) التي لها نفس الاسم المعياري لقطعة في المسودة */
export function overlappingSessionPartsWithDraft(
  session: WorkOrderAnalysisSession,
  draft: ProjectDraft,
): string[] {
  const names = collectDraftPartNormalizedNames(draft);
  const hits: string[] = [];
  for (const p of session.parts) {
    if (!p.includeInWorkOrder || !p.name.trim()) continue;
    const n = norm(p.name);
    if (n && names.has(n)) hits.push(p.name.trim());
  }
  return [...new Set(hits)];
}

export function assessDuplicates(
  session: WorkOrderAnalysisSession,
  autosave: NewProjectAutosave | null,
  ctx?: AssessDuplicatesContext,
): DuplicateAssessment {
  const fingerprint = sessionFingerprint(session);
  const log = loadImportLog();
  const matchingImportEntries = log.filter((e) => e.fingerprint === fingerprint);

  const fixtureMatches: FixtureSimilarOrder[] = [];
  const pn = norm(session.projectName);
  const cl = norm(session.client);
  const partSet = new Set(
    session.parts.filter((x) => x.includeInWorkOrder).map((p) => norm(p.name)),
  );

  if (pn && cl) {
    for (const wo of woodWorkOrdersFixture.work_orders) {
      if (norm(wo.project_name) !== pn || norm(wo.client ?? "") !== cl) continue;
      const productKey = norm(wo.product_name);
      let hit =
        partSet.has(productKey) ||
        [...partSet].some((p) => p.length > 2 && productKey.includes(p)) ||
        [...partSet].some((p) => p.length > 2 && p.includes(productKey));
      if (!hit && partSet.size === 0) hit = true;
      if (hit) {
        fixtureMatches.push({
          work_order_id: wo.work_order_id,
          project_name: wo.project_name,
          client: wo.client ?? "",
          product_name: wo.product_name,
          remaining: wo.quantities.remaining,
        });
      }
    }
  }

  let incompleteAutosave: NewProjectAutosave | null = null;
  if (
    autosave &&
    draftsLookRelated(autosave.draft, session) &&
    autosave.step < 3 &&
    (autosave.draft.products.length > 0 || autosave.draft.name.trim())
  ) {
    incompleteAutosave = autosave;
  }

  let draftPartOverlaps: string[] = [];
  if (ctx?.importMode === "merge") {
    const useAutosaveBase = ctx.mergeFromAutosave && isIncompleteRelatedAutosave(autosave, session);
    const mergeBase = useAutosaveBase ? autosave.draft : ctx.currentDraft;
    draftPartOverlaps = overlappingSessionPartsWithDraft(session, mergeBase);
  }

  return {
    fingerprint,
    reusedImport: matchingImportEntries.length > 0,
    matchingImportEntries,
    fixtureMatches,
    incompleteAutosave,
    draftPartOverlaps,
  };
}

export function describeDuplicateReason(d: DuplicateAssessment): string {
  const parts: string[] = [];
  if (d.reusedImport)
    parts.push("تم سابقاً استيراد قائمة قطع مطابقة لهذا المستند (نفس البصمة).");
  if (d.fixtureMatches.length > 0)
    parts.push(
      `يوجد ${d.fixtureMatches.length} أمر(أوامر) شبيه في بيانات أوامر الأخشاب المعروضة لنفس المشروع والعميل.`,
    );
  if (d.draftPartOverlaps.length > 0)
    parts.push(
      `تتطابق ${d.draftPartOverlaps.length} قطعة(قطع) من التحليل مع أسماء موجودة بالفعل في مسودة الدمج: ${d.draftPartOverlaps.slice(0, 8).join("، ")}${d.draftPartOverlaps.length > 8 ? "…" : ""}.`,
    );
  return parts.join(" ") || "لا تنبيهات تكرار حسب المعايير الحالية.";
}
