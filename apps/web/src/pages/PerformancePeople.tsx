import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EntityNotesPanel } from "../components/notes/EntityNotesPanel";
import { useTranslation } from "../context/I18nContext";
import { useDirection } from "../lib/useDirection";
import { cn } from "../lib/cn";
import { apiJson } from "../lib/api/client";
import { BrandLogoOverlay } from "../components/brand/BrandLogoLoader";
import { useDeferredLoading } from "../lib/useDeferredLoading";

type Person = {
  employeeId: string;
  name: string;
  departmentName: string | null;
  auditActions30d: number;
};

export default function PerformancePeople() {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["performance", "people"],
    queryFn: () => apiJson<{ people: Person[] }>("/api/performance/people?limit=80"),
  });
  const showOverlay = useDeferredLoading(isFetching || isLoading);

  return (
    <div className="space-y-6 animate-in fade-in">
      <BrandLogoOverlay label={t("loader.busy")} show={showOverlay} />
      <header className="border-b border-brand-border pb-6">
        <h1
          className={cn("text-2xl font-bold text-brand-luxury", rtl ? "font-arabic normal-case" : "tracking-tighter uppercase")}
        >
          {t("pages.performancePeople.title")}
        </h1>
        <p className={cn("text-sm text-brand-metal mt-1", rtl && "font-arabic")}>
          {t("pages.performancePeople.subtitle")}
        </p>
        <p className="text-[10px] text-brand-metal mt-2">{t("pages.performancePeople.hint")}</p>
      </header>

      {isError ? (
        <p className="text-xs text-brand-error">{t("pages.performancePeople.loadError")}</p>
      ) : null}

      <div className="overflow-x-auto glass-panel border border-brand-border text-xs">
        <table className="w-full text-start">
          <thead className="border-b border-brand-border text-[10px] uppercase tracking-widest text-brand-metal">
            <tr>
              <th className="p-2">{t("pages.performancePeople.colName")}</th>
              <th className="p-2">{t("pages.performancePeople.colDept")}</th>
              <th className="p-2">{t("pages.performancePeople.colAudit")}</th>
            </tr>
          </thead>
          <tbody>
            {(data?.people ?? []).map((p) => (
              <tr
                key={p.employeeId}
                className={cn(
                  "border-b border-brand-border/50 cursor-pointer hover:bg-brand-border/20",
                  selectedId === p.employeeId && "bg-brand-border/30",
                )}
                onClick={() => setSelectedId((id) => (id === p.employeeId ? null : p.employeeId))}
              >
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.departmentName ?? "—"}</td>
                <td className="p-2 font-mono">{p.auditActions30d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId ? (
        <div className="space-y-2">
          <p className="text-[10px] text-brand-metal">{t("pages.performancePeople.notesForSelection")}</p>
          <EntityNotesPanel entityType="employee" entityId={selectedId} />
        </div>
      ) : null}
    </div>
  );
}
