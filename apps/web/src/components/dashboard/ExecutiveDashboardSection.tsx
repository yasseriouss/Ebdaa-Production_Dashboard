import { lazy, Suspense } from "react";
import { TrendingUp } from "lucide-react";
import { FactorySurface } from "../factory/FactorySurface";
import { useTranslation } from "../../context/I18nContext";
import { DashboardSectionHeader } from "./DashboardSectionHeader";

const ExecutiveDashboard = lazy(() => import("@factory/pages/dashboard"));

function ExecutiveSkeleton() {
  return (
    <div
      className="grid auto-rows-[minmax(140px,auto)] gap-4 sm:gap-5 md:grid-cols-6 lg:grid-cols-12"
      aria-hidden
    >
      <div className="h-40 animate-pulse rounded-2xl bg-foreground/5 md:col-span-4" />
      <div className="h-40 animate-pulse rounded-2xl bg-foreground/5 md:col-span-4" />
      <div className="h-40 animate-pulse rounded-2xl bg-foreground/5 md:col-span-4" />
      <div className="h-52 animate-pulse rounded-2xl bg-foreground/5 md:col-span-6 lg:col-span-6" />
      <div className="h-52 animate-pulse rounded-2xl bg-foreground/5 md:col-span-3" />
      <div className="h-52 animate-pulse rounded-2xl bg-foreground/5 md:col-span-3" />
    </div>
  );
}

function ExecutiveFallback() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 p-4 sm:p-5" role="status" aria-label={t("factory.dashboard.loading")}>
      <p className="text-center text-sm text-muted-foreground">{t("factory.dashboard.loading")}</p>
      <ExecutiveSkeleton />
    </div>
  );
}

/** Live executive KPIs, charts, and load pressure — lazy-loaded for performance. */
export function ExecutiveDashboardSection() {
  const { t } = useTranslation();

  return (
    <section id="executive" aria-labelledby="executive-overview-heading" className="space-y-4">
      <DashboardSectionHeader
        badge={t("nav.executiveDashboard")}
        badgeIcon={TrendingUp}
        titleId="executive-overview-heading"
        title={t("factory.dashboard.title")}
        guidanceLabel={t("dashboard.guidanceToggle")}
        guidance={
          <>
            <p className="font-medium text-brand-luxury">{t("factory.dashboard.subtitle")}</p>
            <p>{t("factory.dashboard.dataHint")}</p>
          </>
        }
      />

      <div className="glass-panel overflow-hidden p-3 sm:p-4 md:p-5">
        <FactorySurface embedded>
          <Suspense fallback={<ExecutiveFallback />}>
            <ExecutiveDashboard embedded />
          </Suspense>
        </FactorySurface>
      </div>
    </section>
  );
}
