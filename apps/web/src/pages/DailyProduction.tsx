import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ClipboardCheck, Cpu, Download, FileSpreadsheet, Printer, Trees } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { useTranslation } from "../context/I18nContext";
import { ebdaaExcelSheets } from "../data/ebdaa";
import { factoryCapacityFixture, woodWorkOrdersFixture } from "../data/fixtures";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { useFhWoodOrders } from "../lib/api/hooks/useFactoryHub";
import {
  downloadDailySheetHtml,
  downloadDailySheetXls,
  openDailySheetPrint,
  type DailySheetRow,
} from "../lib/dailySheet";
import { downloadDailySheetPdf } from "../lib/pdf";
import { completionPercent, statusFromCompletion, type WoodWorkOrder } from "../data/types";

type FactoryKind = "wood" | "metal";

export default function DailyProduction({ factory }: { factory: FactoryKind }) {
  const { t } = useTranslation();
  const toast = useToast();
  const { data: woodOrders = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const factoryData =
    factory === "wood"
      ? factoryCapacityFixture.woodworking_factory
      : factoryCapacityFixture.metal_factory;

  const [department, setDepartment] = useState<string>(factoryData.departments[0]?.id ?? "");
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const tasks = useMemo<DailySheetRow[]>(() => {
    if (factory !== "wood") return [];
    return ordersForDepartment(department, woodOrders);
  }, [department, factory, woodOrders]);

  const departmentName =
    factoryData.departments.find((d) => d.id === department)?.name ?? "";

  const headerIcon = factory === "wood" ? Trees : Cpu;
  const headerTitle = factory === "wood" ? t("pages.dailyProduction.woodTitle") : t("pages.dailyProduction.metalTitle");
  const headerSecondary =
    factory === "wood" ? t("pages.dailyProduction.woodArabic") : t("pages.dailyProduction.metalArabic");

  const handleExport = async (kind: "html" | "xls" | "print" | "pdf") => {
    const params = {
      factory_id: factoryData.factory_id,
      factory_name: factoryData.name,
      department_id: department,
      department_name: departmentName,
      rows: tasks,
      date,
    };
    if (kind === "html") downloadDailySheetHtml(params);
    if (kind === "xls") downloadDailySheetXls(params);
    if (kind === "print") openDailySheetPrint(params);
    if (kind === "pdf") {
      try {
        await downloadDailySheetPdf(params);
      } catch {
        toast.error(t("pages.dailyProduction.exportPdfFail"));
        return;
      }
    }
    toast.success(
      t("pages.dailyProduction.toastGenerated", { dept: departmentName, n: String(tasks.length) }),
    );
  };

  const Header = headerIcon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end border-b border-brand-border pb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <Header className="w-5 h-5 text-brand-wood" />
            <h2 className="text-3xl font-bold tracking-tighter uppercase">{headerTitle}</h2>
          </div>
          <p className="text-sm text-brand-metal mt-1">
            <span className="font-medium">{headerSecondary}</span>
            <span className="mx-2 text-brand-border">|</span>
            {t("pages.dailyProduction.tagline")}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label={t("pages.dailyProduction.department")}
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
          >
            {factoryData.departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.id} · {dept.name}
              </option>
            ))}
          </Select>
          <Select
            label={t("pages.dailyProduction.date")}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="min-w-[10rem]"
          >
            <option value={date}>{date}</option>
          </Select>
        </div>
      </header>

      {factory === "wood" && (
        <section className="glass-panel border border-dashed border-brand-border/80 p-4 space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">
            {t("pages.dailyProduction.ebdaaRefTitle")}
          </h3>
          <p className="text-[11px] text-brand-metal leading-relaxed" dir="auto">
            {t("pages.dailyProduction.ebdaaExplain")}
          </p>
          <p className="text-[10px] text-brand-metal/90 leading-snug" dir="rtl" lang="ar">
            {ebdaaExcelSheets.dailyProduction.sheets[0]?.columnsAr.join(" · ")}
          </p>
          <p className="text-[10px]">
            <Link href="/about-system" className="text-brand-wood underline-offset-2 hover:underline">
              {t("pages.dailyProduction.ebdaaRefLink")}
            </Link>
          </p>
        </section>
      )}

      <section className="glass-panel p-4 sm:p-6 md:p-8 space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest">{t("pages.dailyProduction.exportTitle")}</h3>
            <p className="text-[10px] text-brand-metal uppercase tracking-wider">
              <span>{t("pages.dailyProduction.exportSubAr")}</span>
              <span className="mx-1">·</span>
              {t("pages.dailyProduction.exportSub")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleExport("xls")}
              className="industrial-btn border-brand-success/40 text-brand-success"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t("pages.dailyProduction.exportXls")}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleExport("print")}
              className="industrial-btn border-brand-wood/60 text-brand-wood"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t("pages.dailyProduction.exportPrint")}</span>
            </button>
            <button
              type="button"
              onClick={() => void handleExport("pdf")}
              className="industrial-btn border-brand-luxury/50 text-brand-luxury"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t("pages.dailyProduction.exportPdf")}</span>
            </button>
            <button type="button" onClick={() => handleExport("html")} className="industrial-btn">
              <Download className="w-3.5 h-3.5" />
              <span>{t("pages.dailyProduction.exportHtml")}</span>
            </button>
          </div>
        </header>

        <div className="border border-brand-border bg-brand-black/40 overflow-hidden">
          <table className="w-full text-start">
            <thead className="bg-brand-elevated">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">
                <th className="px-3 py-3 w-10">#</th>
                <th className="px-3 py-3">{t("pages.dailyProduction.tableOrderId")}</th>
                <th className="px-3 py-3">{t("pages.dailyProduction.tableProject")}</th>
                <th className="px-3 py-3">{t("pages.dailyProduction.tableProduct")}</th>
                <th className="px-3 py-3 text-end">{t("pages.dailyProduction.tableTarget")}</th>
                <th className="px-3 py-3 w-44">{t("pages.dailyProduction.tableCompleted")}</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-xs text-brand-metal">
                    {factory === "metal"
                      ? t("pages.dailyProduction.emptyMetal")
                      : t("pages.dailyProduction.emptyWood")}
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr
                    key={`${task.order_id}-${index}`}
                    className="border-t border-brand-border"
                  >
                    <td className="px-3 py-2 text-xs text-brand-metal">{index + 1}</td>
                    <td className="px-3 py-2 text-xs font-bold text-brand-luxury">
                      {task.order_id}
                    </td>
                    <td className="px-3 py-2 text-xs text-brand-luxury">{task.project}</td>
                    <td className="px-3 py-2 text-xs">
                      <ArabicText>{task.product}</ArabicText>
                    </td>
                    <td className="px-3 py-2 text-xs text-brand-luxury text-end">
                      {task.target_qty}
                    </td>
                    <td className="px-3 py-2 bg-brand-elevated/40">
                      <div className="h-6 border border-dashed border-brand-border" aria-hidden />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <ClipboardCheck className="w-4 h-4 text-brand-wood" />
          <h3 className="text-xs font-bold uppercase tracking-widest">{t("pages.dailyProduction.howItWorks")}</h3>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-brand-metal">
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">{t("pages.dailyProduction.step1Title")}</p>
            {t("pages.dailyProduction.step1Body")}
          </li>
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">{t("pages.dailyProduction.step2Title")}</p>
            {t("pages.dailyProduction.step2Body")}
          </li>
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">{t("pages.dailyProduction.step3Title")}</p>
            {t("pages.dailyProduction.step3Body")}
          </li>
        </ol>
      </section>
    </div>
  );
}

/**
 * Map active wood-factory work orders to rows targeting a specific department.
 * The fixture stores stage-level progress; we emit one row per stage that
 * still has work pending in the chosen department.
 */
function ordersForDepartment(departmentId: string, orders: WoodWorkOrder[]): DailySheetRow[] {
  const rows: DailySheetRow[] = [];
  for (const order of orders) {
    const status = statusFromCompletion(completionPercent(order.quantities));
    if (status === "Done") continue;
    for (const stage of WOOD_STAGE_ORDER) {
      if (WOOD_STAGE_LABELS[stage].department !== departmentId) continue;
      const passed = order.routing_progress[stage].qty_passed;
      if (passed >= order.quantities.total_required) continue;
      rows.push({
        order_id: `${order.work_order_id} · ${WOOD_STAGE_LABELS[stage].english}`,
        project: order.project_name,
        product: order.product_name,
        target_qty: order.quantities.total_required,
      });
    }
  }
  return rows;
}
