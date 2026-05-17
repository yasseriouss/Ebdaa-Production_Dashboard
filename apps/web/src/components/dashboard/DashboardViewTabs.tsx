import { BarChart3, TrendingUp } from "lucide-react";
import type { DashboardTab } from "../../lib/dashboardTab";
import { useTranslation } from "../../context/I18nContext";
import { useDirection } from "../../lib/useDirection";
import { cn } from "../../lib/cn";

export function DashboardViewTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";

  const tabClass = (tab: DashboardTab) =>
    cn(
      "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-[11px] font-bold transition-colors sm:flex-none sm:px-5",
      rtl ? "font-arabic normal-case tracking-normal" : "uppercase tracking-wider",
      activeTab === tab
        ? "bg-brand-wood/15 text-brand-wood shadow-[inset_0_0_0_1px] shadow-brand-wood/40"
        : "text-brand-metal hover:bg-brand-border/30 hover:text-brand-luxury",
    );

  return (
    <div
      role="tablist"
      aria-label={t("dashboard.sectionNavLabel")}
      className="glass-panel flex gap-1 border-brand-wood/20 p-1 sm:p-1.5"
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
    >
      <button
        type="button"
        role="tab"
        id="dashboard-tab-executive"
        aria-selected={activeTab === "executive"}
        aria-controls="dashboard-panel-executive"
        tabIndex={activeTab === "executive" ? 0 : -1}
        className={tabClass("executive")}
        onClick={() => onTabChange("executive")}
      >
        <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("dashboard.jumpToExecutive")}
      </button>
      <button
        type="button"
        role="tab"
        id="dashboard-tab-operational"
        aria-selected={activeTab === "operational"}
        aria-controls="dashboard-panel-operational"
        tabIndex={activeTab === "operational" ? 0 : -1}
        className={tabClass("operational")}
        onClick={() => onTabChange("operational")}
      >
        <BarChart3 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {t("dashboard.jumpToOperational")}
      </button>
    </div>
  );
}
