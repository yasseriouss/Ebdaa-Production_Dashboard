import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { apiJson } from "../lib/api/client";

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
          Audit log
        </h1>
        <ArabicText className="text-brand-metal mt-1">سجل التحركات والمسارات</ArabicText>
      </header>

      {isLoading ? (
        <p className="text-xs text-brand-metal">Loading…</p>
      ) : isError ? (
        <p className="text-xs text-brand-error">{error instanceof Error ? error.message : "Failed to load"}</p>
      ) : (
        <div className="overflow-x-auto glass-panel border border-brand-border text-[10px]">
          <table className="w-full text-left">
            <thead className="border-b border-brand-border text-[9px] uppercase tracking-widest text-brand-metal">
              <tr>
                <th className="p-2">Time</th>
                <th className="p-2">Actor</th>
                <th className="p-2">Action</th>
                <th className="p-2">Resource</th>
                <th className="p-2">Route</th>
                <th className="p-2">HTTP</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-brand-border/50 font-mono">
                  <td className="p-2 whitespace-nowrap">{row.occurredAt}</td>
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
