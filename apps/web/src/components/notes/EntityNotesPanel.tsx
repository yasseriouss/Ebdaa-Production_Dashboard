import { useMemo, useState } from "react";
import { useTranslation } from "../../context/I18nContext";
import { usePermissions } from "../../context/PermissionContext";
import { useDirection } from "../../lib/useDirection";
import { appLocale, formatDateIso } from "../../lib/formatLocale";
import { cn } from "../../lib/cn";
import { useEntityNotesList, useEntityNotesMutations } from "../../lib/api/hooks/useEntityNotes";
import { ApiError } from "../../lib/api/client";
import { useToast } from "../ui/Toast";

export function EntityNotesPanel({
  entityType,
  entityId,
  className,
}: {
  entityType: string;
  entityId: string | null;
  className?: string;
}) {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const locale = appLocale(direction);
  const { keys, unrestricted, loading: permLoading } = usePermissions();
  const canRead = permLoading || unrestricted || keys.has("entity_notes:read");
  const canWrite = permLoading || unrestricted || keys.has("entity_notes:write");
  const toast = useToast();

  const { data, isLoading, isError, error } = useEntityNotesList(entityType, canRead ? entityId : null);
  const { create, remove } = useEntityNotesMutations(entityType, entityId);
  const [draft, setDraft] = useState("");

  const notes = data?.notes ?? [];

  const errMsg = useMemo(() => {
    if (!isError || !error) return null;
    if (error instanceof ApiError && error.status === 403) {
      return t("notes.forbidden");
    }
    return t("notes.error");
  }, [isError, error, t]);

  if (!entityId) return null;

  if (!canRead) {
    return (
      <div className={cn("text-[10px] text-brand-metal", className)} dir={direction === "rtl" ? "rtl" : "ltr"}>
        {t("notes.forbidden")}
      </div>
    );
  }

  return (
    <section
      className={cn("space-y-3 rounded-sm border border-brand-border bg-brand-elevated/50 p-3", className)}
      dir={direction === "rtl" ? "rtl" : "ltr"}
    >
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-brand-luxury">{t("notes.title")}</h3>
      {isLoading ? <p className="text-[10px] text-brand-metal">{t("notes.loading")}</p> : null}
      {errMsg ? <p className="text-[10px] text-brand-error">{errMsg}</p> : null}
      {!isLoading && !errMsg && notes.length === 0 ? (
        <p className="text-[10px] text-brand-metal">{t("notes.empty")}</p>
      ) : null}
      <ul className="space-y-2 max-h-48 overflow-y-auto">
        {notes.map((n) => (
          <li
            key={n.id}
            className="rounded-sm border border-brand-border/60 bg-brand-black/20 px-2 py-2 text-[10px]"
          >
            <div className="flex justify-between gap-2 text-brand-metal/80 font-mono text-[9px] mb-1">
              <span>{formatDateIso(n.createdAt, locale)}</span>
              {canWrite ? (
                <button
                  type="button"
                  className="text-brand-error hover:underline"
                  onClick={() => {
                    if (!window.confirm(t("notes.deleteConfirm"))) return;
                    void remove
                      .mutateAsync(n.id)
                      .then(() => toast.success(t("notes.deleted")))
                      .catch(() => toast.error(t("notes.error")));
                  }}
                >
                  {t("common.delete")}
                </button>
              ) : null}
            </div>
            <p className="text-brand-luxury whitespace-pre-wrap leading-relaxed">{n.body}</p>
          </li>
        ))}
      </ul>
      {canWrite ? (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            const b = draft.trim();
            if (!b) return;
            void create
              .mutateAsync(b)
              .then(() => {
                setDraft("");
                toast.success(t("notes.saved"));
              })
              .catch(() => toast.error(t("notes.error")));
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full bg-brand-black border border-brand-border text-[11px] text-brand-luxury p-2 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood"
            placeholder={t("notes.placeholder")}
          />
          <button type="submit" className="industrial-btn py-2 px-3 text-[10px]" disabled={create.isPending}>
            {t("notes.submit")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
