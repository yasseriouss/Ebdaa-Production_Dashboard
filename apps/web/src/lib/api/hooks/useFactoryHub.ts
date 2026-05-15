import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, apiJson, type FhAnalysisEnvelope, type FhNewProjectAutosaveEnvelope, type FhReferenceRow, type FhWoodWorkOrderRow } from "../client";
import type { WoodWorkOrder } from "../../../data/types";
import type { WorkOrderAnalysisSession } from "../../workOrderAnalysis/types";
import type { NewProjectStep, ProjectDraft } from "../../../data/projectDraft";

export const QK = {
  woodOrders: ["factory-hub", "wood-work-orders"] as const,
  reference: (key: string) => ["factory-hub", "reference", key] as const,
  analysisSessions: ["factory-hub", "work-order-analysis-sessions"] as const,
  newProjectAutosave: ["factory-hub", "new-project-autosave"] as const,
};

function rowToWoodOrder(row: FhWoodWorkOrderRow): WoodWorkOrder {
  return row.payload as unknown as WoodWorkOrder;
}

export function useFhWoodOrders(placeholderWood?: WoodWorkOrder[]) {
  return useQuery({
    queryKey: QK.woodOrders,
    queryFn: async () => {
      const rows = await apiJson<FhWoodWorkOrderRow[]>("/api/factory-hub/wood-work-orders");
      return rows.map(rowToWoodOrder);
    },
    placeholderData: placeholderWood,
    staleTime: 15_000,
  });
}

export function useUpsertFhWoodOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (order: WoodWorkOrder) => {
      await apiJson<FhWoodWorkOrderRow>(
        `/api/factory-hub/wood-work-orders/${encodeURIComponent(order.work_order_id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        },
      );
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK.woodOrders });
    },
  });
}

export function useDeleteFhWoodOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workOrderId: string) => {
      await apiJson(`/api/factory-hub/wood-work-orders/${encodeURIComponent(workOrderId)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK.woodOrders });
    },
  });
}

export function useFhReferenceSnapshot(key: string, enabled = true) {
  return useQuery({
    queryKey: QK.reference(key),
    queryFn: async () => apiJson<FhReferenceRow>(`/api/factory-hub/reference/${encodeURIComponent(key)}`),
    enabled,
    staleTime: 60_000,
  });
}

export function useFhAnalysisSessions(placeholderSessions?: WorkOrderAnalysisSession[]) {
  return useQuery({
    queryKey: QK.analysisSessions,
    queryFn: async () => {
      const rows = await apiJson<FhAnalysisEnvelope[]>("/api/factory-hub/work-order-analysis-sessions");
      return rows.map(sessionPayloadFromRow);
    },
    placeholderData: placeholderSessions,
    staleTime: 15_000,
  });
}

function sessionPayloadFromRow(row: FhAnalysisEnvelope): WorkOrderAnalysisSession {
  return row.payload as unknown as WorkOrderAnalysisSession;
}

export function useUpsertFhAnalysisSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (session: WorkOrderAnalysisSession) => {
      const path = `/api/factory-hub/work-order-analysis-sessions/${encodeURIComponent(session.id)}`;
      try {
        await apiJson<FhAnalysisEnvelope>(path, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(session),
        });
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 404) {
          await apiJson<FhAnalysisEnvelope>("/api/factory-hub/work-order-analysis-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(session),
          });
          return;
        }
        throw e;
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK.analysisSessions });
    },
  });
}

export function useDeleteFhAnalysisSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiJson(`/api/factory-hub/work-order-analysis-sessions/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK.analysisSessions });
    },
  });
}

export interface NewProjectAutosavePayload {
  draft: ProjectDraft;
  step: NewProjectStep;
  updatedAt: string;
}

export function useFhNewProjectAutosave() {
  return useQuery({
    queryKey: QK.newProjectAutosave,
    queryFn: async (): Promise<NewProjectAutosavePayload | null> => {
      try {
        const row = await apiJson<FhNewProjectAutosaveEnvelope>("/api/factory-hub/new-project-autosave");
        return {
          draft: row.payload["draft"] as ProjectDraft,
          step: row.payload["step"] as NewProjectStep,
          updatedAt: String(row.payload["updatedAt"] ?? row.updatedAt ?? ""),
        };
      } catch (e: unknown) {
        if (e instanceof ApiError && e.status === 404) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 15_000,
  });
}

export function usePutFhNewProjectAutosave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: NewProjectAutosavePayload) => {
      await apiJson("/api/factory-hub/new-project-autosave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: QK.newProjectAutosave });
    },
  });
}
