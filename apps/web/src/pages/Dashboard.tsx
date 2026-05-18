import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BarChart3 } from "lucide-react";
import { ExecutiveDashboardSection } from "../components/dashboard/ExecutiveDashboardSection";
import { useTranslation } from "../context/I18nContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#operational") {
      navigate("/analytics", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border/50 bg-brand-elevated/40 px-4 py-3">
        <p className="text-sm text-brand-metal max-w-2xl leading-relaxed">{t("dashboard.executiveOnlyHint")}</p>
        <Link
          href="/analytics"
          className="inline-flex items-center gap-2 rounded-md border border-brand-wood/40 bg-brand-wood/10 px-3 py-2 text-xs font-bold text-brand-wood hover:bg-brand-wood/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-wood"
        >
          <BarChart3 className="h-4 w-4 shrink-0" aria-hidden />
          {t("dashboard.jumpToOperational")}
        </Link>
      </div>

      <section aria-label={t("dashboard.jumpToExecutive")} className="animate-in fade-in duration-300">
        <ExecutiveDashboardSection />
      </section>
    </div>
  );
}
