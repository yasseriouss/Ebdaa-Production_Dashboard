import type { ElementType, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function AnalyticsMetricRow({
  icon: Icon,
  label,
  value,
  progress,
  progressClassName = "bg-brand-wood",
  rtl = false,
  valueDir = "auto",
}: {
  icon?: ElementType<{ className?: string }>;
  label: ReactNode;
  value: ReactNode;
  /** 0–100; when set, renders the same rounded progress track as dept load. */
  progress?: number;
  progressClassName?: string;
  rtl?: boolean;
  valueDir?: "auto" | "ltr" | "rtl";
}) {
  const pct = progress == null ? null : Math.min(100, Math.max(0, progress));

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
        <span
          className={cn(
            "shrink-0 text-[10px] text-brand-metal",
            rtl ? "normal-case" : "uppercase tracking-widest",
          )}
          dir={valueDir}
        >
          {value}
        </span>
      </div>
      {pct != null ? (
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
      ) : null}
    </li>
  );
}
