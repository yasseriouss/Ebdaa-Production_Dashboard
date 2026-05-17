import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiJson } from "../client";

export type EntityNoteDto = {
  id: string;
  entityType: string;
  entityId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string | null;
  updatedByUserId: string | null;
};

export function useEntityNotesList(entityType: string, entityId: string | null) {
  return useQuery({
    queryKey: ["entity-notes", entityType, entityId],
    queryFn: () =>
      apiJson<{ notes: EntityNoteDto[] }>(
        `/api/entity-notes?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId!)}`,
      ),
    enabled: Boolean(entityId),
  });
}

export function useEntityNotesMutations(entityType: string, entityId: string | null) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["entity-notes", entityType, entityId] });
  };

  const create = useMutation({
    mutationFn: (body: string) =>
      apiJson<{ note: EntityNoteDto }>("/api/entity-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, body }),
      }),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      apiJson<{ note: EntityNoteDto }>(`/api/entity-notes/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) =>
      apiJson<void>(`/api/entity-notes/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
