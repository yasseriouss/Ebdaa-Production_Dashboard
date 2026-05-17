import { Link } from "wouter";
import { GitBranch, Waypoints } from "lucide-react";
import {
  ebdaaWorkflowRoutingRows,
  workflowRowsRoutineSplit,
  type EbdaaWorkflowStageRow,
} from "../data/ebdaa/workflowRoutingMap";
import { WOOD_STAGE_LABELS } from "../data/routing";
import { useTranslation } from "../context/I18nContext";

function RoutingLabel({ routingKey }: { routingKey: EbdaaWorkflowStageRow["routingKey"] }) {
  if (!routingKey) return null;
  const L = WOOD_STAGE_LABELS[routingKey];
  return (
    <span className="text-brand-metal" dir="ltr" lang="en">
      {L.english} · <span dir="rtl" lang="ar">{L.arabic}</span>
    </span>
  );
}

function StageTable({
  title,
  badgeClassName,
  rows,
}: {
  title: string;
  badgeClassName: string;
  rows: EbdaaWorkflowStageRow[];
}) {
  const { t } = useTranslation();
  return (
    <section className="glass-panel border border-brand-border p-4 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <GitBranch className="w-5 h-5 text-brand-wood shrink-0" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-luxury">{title}</h2>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${badgeClassName}`}
        >
          {rows.length}
        </span>
      </div>
      <div className="overflow-x-auto border border-brand-border rounded-sm">
        <table className="w-full text-xs min-w-[640px]">
          <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
            <tr>
              <th className="p-2 text-start">{t("pages.workflowRouting.colStep")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colStage")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colOwner")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colRoutingKey")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colRoutingLabel")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colDesc")}</th>
              <th className="p-2 text-start">{t("pages.workflowRouting.colNotes")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.stepOrder} className="border-t border-brand-border/80 hover:bg-brand-elevated/30">
                <td className="p-2 font-mono text-brand-luxury whitespace-nowrap">{row.stepOrder}</td>
                <td className="p-2 text-brand-luxury whitespace-nowrap" dir="rtl" lang="ar">
                  {row.stageNameAr}
                </td>
                <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                  {row.ownerAr}
                </td>
                <td className="p-2 font-mono text-[10px] text-brand-metal" dir="ltr">
                  {row.routingKey ?? t("pages.workflowRouting.emptyKey")}
                </td>
                <td className="p-2 min-w-[10rem]">
                  {row.routingKey ? <RoutingLabel routingKey={row.routingKey} /> : t("pages.workflowRouting.emptyKey")}
                </td>
                <td className="p-2 text-brand-metal max-w-[220px]" dir="rtl" lang="ar">
                  {row.descriptionAr}
                </td>
                <td className="p-2 text-brand-metal max-w-[180px]" dir="rtl" lang="ar">
                  {row.notesAr ?? t("pages.workflowRouting.emptyKey")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function WorkflowRoutingMapPage() {
  const { t } = useTranslation();
  const { routine, nonRoutine } = workflowRowsRoutineSplit(ebdaaWorkflowRoutingRows);

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      <header className="border-b border-brand-border pb-6">
        <div className="flex items-center gap-3">
          <Waypoints className="w-7 h-7 text-brand-wood" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter uppercase text-brand-luxury">
              {t("pages.workflowRouting.title")}
            </h1>
            <p className="text-sm text-brand-metal mt-1 max-w-3xl">{t("pages.workflowRouting.subtitle")}</p>
          </div>
        </div>
        <p className="text-xs text-brand-metal mt-4 max-w-4xl leading-relaxed">{t("pages.workflowRouting.intro")}</p>
        <p className="mt-3 text-xs">
          <Link href="/about-system" className="text-brand-wood underline-offset-2 hover:underline">
            {t("pages.workflowRouting.linkAbout")}
          </Link>
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <StageTable
          title={t("pages.workflowRouting.groupNonRoutine")}
          badgeClassName="border-brand-metal/50 text-brand-metal bg-brand-metal/10"
          rows={nonRoutine}
        />
        <StageTable
          title={t("pages.workflowRouting.groupRoutine")}
          badgeClassName="border-brand-wood/50 text-brand-wood bg-brand-wood/10"
          rows={routine}
        />
      </div>
    </div>
  );
}
