import { Skeleton } from "@factory/components/ui/skeleton";

export function LoadPressureCard({
  title,
  subtitle,
  rows,
  isLoading,
  barColor,
  emptyLabel = "لا بيانات ضغط لعرضها",
}: {
  title: string;
  subtitle?: string;
  rows: { name: string; wip: number; done: number }[];
  isLoading: boolean;
  barColor: string;
  emptyLabel?: string;
}) {
  const maxWip = Math.max(1, ...rows.map((r) => r.wip));
  if (isLoading) {
    return (
      <div className="double-bezel-outer min-w-0">
        <div className="double-bezel-inner p-4 sm:p-6">
          <Skeleton className="h-5 w-44 mb-2" />
          <Skeleton className="h-3 w-full max-w-md mb-6" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  return (
    <div className="double-bezel-outer min-w-0">
      <div className="double-bezel-inner p-4 sm:p-6 lg:p-8 min-w-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{subtitle}</p>}
        <div className="mt-4 max-h-[min(420px,55vh)] overflow-y-auto overflow-x-hidden space-y-5 pe-1 -me-0.5">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">{emptyLabel}</p>
          ) : (
            rows.map((row, idx) => {
              const pct = (row.wip / maxWip) * 100;
              return (
                <div key={`${row.name}-${idx}`} className="space-y-2.5 min-w-0">
                  <div className="flex flex-col gap-1.5 min-w-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                    <p className="text-sm font-medium text-foreground leading-relaxed break-words min-w-0 order-1">
                      {row.name}
                    </p>
                    <div className="shrink-0 text-[11px] tabular-nums text-muted-foreground order-2 sm:text-end">
                      <span className="font-semibold text-foreground">ضغط {Math.round(row.wip)}</span>
                      <span className="mx-1.5 opacity-60">·</span>
                      <span>منجز {Math.round(row.done)}</span>
                    </div>
                  </div>
                  <div
                    className="h-2.5 sm:h-3 w-full rounded-full bg-muted/45 ring-1 ring-border/35 overflow-hidden"
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
