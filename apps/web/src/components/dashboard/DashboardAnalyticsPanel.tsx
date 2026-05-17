import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function dashboardAnalyticsTitleClass(rtl: boolean) {
  return cn(
    "text-sm font-bold",
    rtl ? "font-arabic normal-case tracking-tight text-brand-luxury" : "uppercase tracking-widest text-brand-luxury",
  );
}

export function dashboardAnalyticsSubtitleClass(rtl: boolean) {
  return cn(
    "text-[10px] text-brand-metal",
    rtl ? "normal-case" : "uppercase tracking-wider",
  );
}

/** Operational analytics card — same chrome as «حمل الأقسام». */
export function DashboardAnalyticsPanel({
  title,
  subtitle,
  titleId,
  aside,
  footer,
  children,
  className,
  rtl,
}: {
  title: string;
  subtitle: string;
  titleId?: string;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  rtl: boolean;
}) {
  return (
    <article
      className={cn("glass-panel p-4 sm:p-6 md:p-8", className)}
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
    >
      <header className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 id={titleId} className={dashboardAnalyticsTitleClass(rtl)}>
              {title}
            </h3>
            <p className={dashboardAnalyticsSubtitleClass(rtl)}>{subtitle}</p>
          </div>
          {aside ? <div className="shrink-0 pt-0.5">{aside}</div> : null}
        </div>
      </header>

      {children}

      {footer ? (
        <ul className="mt-4 space-y-3 border-t border-brand-border/60 pt-4" role="list">
          {footer}
        </ul>
      ) : null}
    </article>
  );
}
