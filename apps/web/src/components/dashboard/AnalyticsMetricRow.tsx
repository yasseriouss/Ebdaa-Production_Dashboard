import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function AnalyticsMetricRow({
  icon: Icon,
  label,
  value,
  secondaryValue,
  progress,
  progressClassName = "bg-brand-wood",
  rtl = false,
  valueDir = "auto",
  layout = "default",
  pressureWip,
  pressureDone,
}: {
  icon?: ElementType<{ className?: string }>;
  label: ReactNode;
  value?: ReactNode;
  secondaryValue?: ReactNode;
  progress?: number;
  progressClassName?: string;
  rtl?: boolean;
  valueDir?: "auto" | "ltr" | "rtl";
  layout?: "default" | "client" | "pressure";
  pressureWip?: ReactNode;
  pressureDone?: ReactNode;
}) {
  const pct = progress == null ? null : Math.min(100, Math.max(0, progress));

  const progressBar =
    pct != null ? (
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border/80"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500 ease-out", progressClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    ) : null;

  if (layout === "client") {
    return (
      <li className="space-y-1.5" dir={rtl ? "rtl" : "ltr"}>
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-brand-metal" aria-hidden /> : null}
            <span
              className={cn(
                "min-w-0 truncate text-xs text-brand-luxury",
                rtl ? "text-end font-arabic normal-case" : "text-start",
              )}
            >
              {label}
            </span>
          </div>
          {value != null ? (
            <span
              className={cn(
                "shrink-0 text-[10px] text-brand-metal",
                rtl ? "normal-case" : "uppercase tracking-widest",
              )}
              dir={valueDir}
            >
              {value}
            </span>
          ) : null}
        </div>
        {progressBar}
        {secondaryValue != null ? (
          <p className="text-left text-[10px] font-semibold tabular-nums text-brand-luxury" dir="ltr">
            {secondaryValue}
          </p>
        ) : null}
      </li>
    );
  }

  if (layout === "pressure") {
    return (
      <li className="space-y-1.5" dir={rtl ? "rtl" : "ltr"}>
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-brand-metal" aria-hidden /> : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-xs text-brand-luxury text-start",
              rtl && "font-arabic normal-case",
            )}
          >
            {label}
          </span>
        </div>
        {progressBar}
        {pressureWip != null || pressureDone != null ? (
          <div
            className="flex items-baseline justify-between gap-3 text-[10px] tabular-nums text-brand-metal"
            dir={rtl ? "rtl" : "ltr"}
          >
            {pressureWip != null ? (
              <span className="font-semibold text-brand-luxury">{pressureWip}</span>
            ) : (
              <span aria-hidden />
            )}
            {pressureDone != null ? <span>{pressureDone}</span> : null}
          </div>
        ) : null}
      </li>
    );
  }

  return (
    <li className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-brand-metal" aria-hidden /> : null}
          <span
            className={cn(
              "truncate text-xs text-brand-luxury",
              rtl && "font-arabic normal-case",
            )}
          >
            {label}
          </span>
        </div>
        {value != null ? (
          <span
            className={cn(
              "shrink-0 text-[10px] text-brand-metal",
              rtl ? "normal-case" : "uppercase tracking-widest",
            )}
            dir={valueDir}
          >
            {value}
          </span>
        ) : null}
      </div>
      {progressBar}
    </li>
  );
}
