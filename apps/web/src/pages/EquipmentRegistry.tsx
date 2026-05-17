import { Factory } from "lucide-react";
import { ebdaaMachineMainDepartmentAr, ebdaaMachinesFixture } from "../data/ebdaa";
import { factoryCapacityFixture } from "../data/fixtures";
import { useTranslation } from "../context/I18nContext";
import { woodDepartmentLabel } from "../data/routing";
import type { WoodDepartmentId } from "../data/types";
import { appLocale } from "../lib/formatLocale";
import { useDirection } from "../lib/useDirection";

function factoryDisplayName(factoryId: string, locale: string, t: (key: string) => string): string {
  if (factoryId === "WF-001") {
    return locale.startsWith("ar")
      ? factoryCapacityFixture.woodworking_factory.name
      : t("pages.departments.woodFactoryOfficial");
  }
  if (factoryId === "MF-001") {
    return locale.startsWith("ar")
      ? factoryCapacityFixture.metal_factory.name
      : t("pages.departments.metalFactoryOfficial");
  }
  return factoryId;
}

function mainDeptDisplay(dept: WoodDepartmentId, locale: string): string {
  if (locale.startsWith("ar")) return ebdaaMachineMainDepartmentAr(dept);
  return woodDepartmentLabel(dept, "en");
}

export default function EquipmentRegistry() {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const locale = appLocale(direction);
  const arPrimary = locale.startsWith("ar");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6 space-y-2">
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-brand-wood" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">{t("pages.equipment.title")}</h1>
            <p className="text-sm text-brand-metal">{t("pages.equipment.subtitle")}</p>
          </div>
        </div>
        <p className="text-sm text-brand-metal max-w-3xl leading-relaxed">{t("pages.equipment.intro")}</p>
      </header>

      <div className="overflow-x-auto glass-panel border border-brand-border">
        <table className="w-full text-xs">
          <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
            <tr>
              <th className="p-2 text-start">{t("pages.equipment.colIdx")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colFactory")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colMainDept")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colSubDept")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colWorkCell")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colSerial")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colModel")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colNameAr")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colDeptHint")}</th>
              <th className="p-2 text-start">{t("pages.equipment.colCritical")}</th>
            </tr>
          </thead>
          <tbody>
            {ebdaaMachinesFixture.map((m) => (
              <tr key={m.serial} className="border-t border-brand-border">
                <td className="p-2 font-mono text-brand-luxury">{m.index}</td>
                <td className={`p-2 text-brand-luxury ${arPrimary ? "font-arabic" : ""}`} dir={arPrimary ? "rtl" : "ltr"}>
                  {factoryDisplayName(m.factoryId, locale, t)}
                </td>
                <td className="p-2 text-brand-luxury" dir={arPrimary ? "rtl" : "ltr"} lang={arPrimary ? "ar" : "en"}>
                  {mainDeptDisplay(m.departmentHint, locale)}
                </td>
                <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                  {m.subDepartmentAr}
                </td>
                <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                  {m.workCellAr ?? "—"}
                </td>
                <td className="p-2 font-mono text-brand-metal">{m.serial}</td>
                <td className="p-2 text-brand-luxury">{m.model}</td>
                <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                  {m.nameAr}
                </td>
                <td className="p-2 font-mono text-[10px] text-brand-metal">{m.departmentHint}</td>
                <td className="p-2">{m.critical ? <span className="text-brand-error font-bold">★</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
