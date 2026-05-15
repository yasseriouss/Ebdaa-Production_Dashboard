import type { ProjectDraft } from "../../data/projectDraft";
import type { WorkOrderAnalysisSession } from "./types";

export function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function sessionFingerprint(s: WorkOrderAnalysisSession): string {
  const partNames = s.parts
    .filter((p) => p.includeInWorkOrder)
    .map((p) => norm(p.name))
    .filter(Boolean)
    .sort()
    .join("¦");
  return `${norm(s.projectName)}¦${norm(s.client)}¦${partNames}`;
}

export function draftProjectKey(d: Pick<ProjectDraft, "name" | "client">): string {
  return `${norm(d.name)}¦${norm(d.client)}`;
}

export function draftsLookRelated(
  draft: Pick<ProjectDraft, "name" | "client">,
  session: Pick<WorkOrderAnalysisSession, "projectName" | "client">,
): boolean {
  if (!norm(session.projectName) || !norm(session.client)) return false;
  return draftProjectKey(draft) === `${norm(session.projectName)}¦${norm(session.client)}`;
}
