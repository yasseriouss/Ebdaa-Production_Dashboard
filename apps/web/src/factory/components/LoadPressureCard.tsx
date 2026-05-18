import { Skeleton } from "@factory/components/ui/skeleton";
import { AnalyticsMetricRow } from "../../components/dashboard/AnalyticsMetricRow";
import { ExecutiveAnalyticsListPanel } from "../../components/dashboard/ExecutiveAnalyticsListPanel";

export function LoadPressureCard({
  title,
  subtitle,
  rows,
  isLoading,
  barColor,
  progressClassName = "bg-brand-wood",
  emptyLabel = "لا بيانات ضغط لعرضها",
  embedded = false,
  rtl = false,
  pressureWipLabel,
  pressureDoneLabel,
}: {
  title: string;
  subtitle?: string;
  rows: { name: string; wip: number; done: number }[];
  isLoading: boolean;
  barColor: string;
  progressClassName?: string;
  emptyLabel?: string;
  embedded?: boolean;
  rtl?: boolean;
  pressureWipLabel?: (wip: number) => string;
  pressureDoneLabel?: (done: number) => string;
}) {
  const maxWip = Math.max(1, ...rows.map((r) => r.wip));
  const wipLabel = pressureWipLabel ?? ((n: number) => `ضغط ${Math.round(n)}`);
  const doneLabel = pressureDoneLabel ?? ((n: number) => `منجز ${Math.round(n)}`);

  if (embedded) {
    if (isLoading) {
      return (
        <article className="glass-panel min-w-0 p-4 sm:p-6 md:p-8" dir={rtl ? "rtl" : "ltr"}>
          <Skeleton className="mb-2 h-5 w-44" />
          <Skeleton className="mb-6 h-3 w-full max-w-md" />
          <Skeleton className="h-40 w-full" />
        </article>
      );
    }

    return (
      <ExecutiveAnalyticsListPanel title={title} subtitle={subtitle} rtl={rtl}>
        <ul className="space-y-3" role="list">
          {rows.length === 0 ? (
            <li className="py-8 text-center text-sm text-brand-metal">{emptyLabel}</li>
          ) : (
            rows.map((row, idx) => {
              const pct = (row.wip / maxWip) * 100;
              return (
                <AnalyticsMetricRow
                  key={`${row.name}-${idx}`}
                  layout="pressure"
                  label={row.name}
                  progress={pct}
                  progressClassName={progressClassName}
                  pressureWip={wipLabel(row.wip)}
                  pressureDone={doneLabel(row.done)}
                  rtl={rtl}
                />
              );
            })
          )}
        </ul>
      </ExecutiveAnalyticsListPanel>
    );
  }

  if (isLoading) {
    return (
      <div className="double-bezel-outer min-w-0">
        <div className="double-bezel-inner p-4 sm:p-6">
          <Skeleton className="mb-2 h-5 w-44" />
          <Skeleton className="mb-6 h-3 w-full max-w-md" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="double-bezel-outer min-w-0">
      <div className="double-bezel-inner min-w-0 p-4 sm:p-6 lg:p-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {subtitle ? <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{subtitle}</p> : null}
        <div className="mt-4 space-y-5">
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            rows.map((row, idx) => {
              const pct = (row.wip / maxWip) * 100;
              return (
                <div key={`${row.name}-${idx}`} className="min-w-0 space-y-2.5">
                  <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                    <p className="order-1 min-w-0 break-words text-sm font-medium leading-relaxed text-foreground">
                      {row.name}
                    </p>
                    <div className="order-2 shrink-0 text-[11px] tabular-nums text-muted-foreground sm:text-end">
                      <span className="font-semibold text-foreground">{wipLabel(row.wip)}</span>
                      <span className="mx-1.5 opacity-60">·</span>
                      <span>{doneLabel(row.done)}</span>
                    </div>
                  </div>
                  <div
                    className="h-2.5 w-full overflow-hidden rounded-full bg-muted/45 ring-1 ring-border/35 sm:h-3"
                    dir="rtl"
                    aria-hidden
                  >
                    <div
                      className="h-full rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${pct}%`,
                        background: barColor,
                        minWidth: row.wip > 0 ? "4px" : undefined,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
