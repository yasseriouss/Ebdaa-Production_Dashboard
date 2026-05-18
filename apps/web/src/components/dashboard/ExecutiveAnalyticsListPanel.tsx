import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  dashboardAnalyticsSubtitleClass,
  dashboardAnalyticsTitleClass,
} from "./DashboardAnalyticsPanel";

/** List/chart panel chrome — matches operational «حمل الأقسام» cards. */
export function ExecutiveAnalyticsListPanel({
  title,
  subtitle,
  rtl,
  children,
  className,
  titleId,
}: {
  title: string;
  subtitle?: string;
  rtl: boolean;
  children: ReactNode;
  className?: string;
  titleId?: string;
}) {
  return (
    <article
      className={cn("glass-panel min-w-0 p-4 sm:p-6 md:p-8", className)}
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
    >
      <header className="mb-4">
        <div className="min-w-0 space-y-1">
          <h3 id={titleId} className={dashboardAnalyticsTitleClass(rtl)}>
            {title}
          </h3>
          {subtitle ? <p className={dashboardAnalyticsSubtitleClass(rtl)}>{subtitle}</p> : null}
        </div>
      </header>
      {children}
    </article>
  );
}
