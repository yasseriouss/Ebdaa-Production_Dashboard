import type { WorkOrderAnalysisSession } from "./types";

const SESSIONS_KEY = "fdh_work_order_analysis_sessions_v1";
const IMPORT_LOG_KEY = "fdh_work_order_analysis_import_log_v1";
const AUTOSAVE_KEY = "fdh_new_project_autosave_v1";

export interface NewProjectAutosave {
  draft: import("../../data/projectDraft").ProjectDraft;
  step: import("../../data/projectDraft").NewProjectStep;
  updatedAt: string;
}

export interface ImportLogEntry {
  fingerprint: string;
  importedAt: string;
  sessionId: string;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadAnalysisSessions(): WorkOrderAnalysisSession[] {
  return safeParse<WorkOrderAnalysisSession[]>(localStorage.getItem(SESSIONS_KEY), []);
}

export function saveAnalysisSessions(sessions: WorkOrderAnalysisSession[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function upsertAnalysisSession(session: WorkOrderAnalysisSession): void {
  const all = loadAnalysisSessions();
  const i = all.findIndex((s) => s.id === session.id);
  if (i >= 0) all[i] = session;
  else all.unshift(session);
  saveAnalysisSessions(all);
}

export function deleteAnalysisSession(id: string): void {
  saveAnalysisSessions(loadAnalysisSessions().filter((s) => s.id !== id));
}

export function loadImportLog(): ImportLogEntry[] {
  return safeParse<ImportLogEntry[]>(localStorage.getItem(IMPORT_LOG_KEY), []);
}

export function appendImportLog(entry: ImportLogEntry): void {
  const log = loadImportLog();
  log.push(entry);
  localStorage.setItem(IMPORT_LOG_KEY, JSON.stringify(log));
}

export function loadNewProjectAutosave(): NewProjectAutosave | null {
  return safeParse<NewProjectAutosave | null>(localStorage.getItem(AUTOSAVE_KEY), null);
}

export function saveNewProjectAutosave(data: NewProjectAutosave): void {
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
}

export function clearNewProjectAutosave(): void {
  localStorage.removeItem(AUTOSAVE_KEY);
}
