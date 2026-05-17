import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { apiJson } from "../lib/api/client";
import { useTranslation } from "../context/I18nContext";
import { useDirection } from "../lib/useDirection";
import { appLocale, formatDateIso } from "../lib/formatLocale";

type AuditEvent = {
  id: string;
  occurredAt: string;
  actorLabel: string;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  route: string;
  method: string;
  statusCode: number | null;
};

export default function AuditLog() {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const locale = appLocale(direction);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["audit-events"],
    queryFn: () => apiJson<AuditEvent[]>("/api/audit-events?limit=100"),
    staleTime: 15_000,
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Shield className="w-6 h-6 text-brand-luxury" />
          {t("pages.audit.title")}
        </h1>
        <p className="text-sm text-brand-metal mt-1">{t("pages.audit.subtitle")}</p>
      </header>

      {isLoading ? (
        <p className="text-xs text-brand-metal">{t("common.loading")}</p>
      ) : isError ? (
        <p className="text-xs text-brand-error">
          {error instanceof Error ? error.message : t("pages.audit.loadFail")}
        </p>
      ) : (
        <div className="overflow-x-auto glass-panel border border-brand-border text-[10px]">
          <table className="w-full text-start">
            <thead className="border-b border-brand-border text-[9px] uppercase tracking-widest text-brand-metal">
              <tr>
                <th className="p-2">{t("pages.audit.colTime")}</th>
                <th className="p-2">{t("pages.audit.colActor")}</th>
                <th className="p-2">{t("pages.audit.colAction")}</th>
                <th className="p-2">{t("pages.audit.colResource")}</th>
                <th className="p-2">{t("pages.audit.colRoute")}</th>
                <th className="p-2">{t("pages.audit.colHttp")}</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-brand-border/50 font-mono">
                  <td className="p-2 whitespace-nowrap">{formatDateIso(row.occurredAt, locale)}</td>
                  <td className="p-2">{row.actorLabel}</td>
                  <td className="p-2">{row.action}</td>
                  <td className="p-2">
                    {row.resourceType ?? "—"}
                    {row.resourceId ? ` / ${row.resourceId}` : ""}
                  </td>
                  <td className="p-2 max-w-[200px] truncate" title={row.route}>
                    {row.route}
                  </td>
                  <td className="p-2">
                    {row.method} {row.statusCode ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
