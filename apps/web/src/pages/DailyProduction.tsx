import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ClipboardCheck, Cpu, Download, FileSpreadsheet, Printer, Trees } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { Select } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
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
import { completionPercent, statusFromCompletion, type WoodWorkOrder } from "../data/types";

type FactoryKind = "wood" | "metal";

export default function DailyProduction({ factory }: { factory: FactoryKind }) {
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
  const headerTitle = factory === "wood" ? "Wood Daily Logs" : "Metal Daily Logs";
  const headerArabic = factory === "wood" ? "اليومية - الخشب" : "اليومية - المعادن";

  const handleExport = (kind: "html" | "xls" | "print") => {
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
    toast.success(`Daily sheet generated for ${departmentName} (${tasks.length} tasks)`);
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
            <ArabicText>{headerArabic}</ArabicText>
            <span className="mx-2 text-brand-border">|</span>
            Export paper travelers for the factory floor.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Select
            label="Department"
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
            label="Date"
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
            Ebdaa daily columns (reference)
          </h3>
          <ArabicText className="text-[11px] text-brand-metal leading-relaxed">
            صف التصدير الحالي يملأ حقول المسافر الأساسية؛ عند النقل اليدوي إلى ملف «نظام_متابعة_الإنتاج_اليومي» استخدم أعمدة الملف كالتالي
            (تاريخ الملف، الفني، المرحلة، الكميات المخططة/المنتجة، إذن الترحيل، إلخ تُسجَّل على الأرض أو في الإكسل).
          </ArabicText>
          <p className="text-[10px] text-brand-metal/90 leading-snug" dir="rtl" lang="ar">
            {ebdaaExcelSheets.dailyProduction.sheets[0]?.columnsAr.join(" · ")}
          </p>
          <p className="text-[10px]">
            <Link href="/about-system" className="text-brand-wood underline-offset-2 hover:underline">
              فتح صفحة حول النظام — مطابقة الأعمدة مع اليومية
            </Link>
          </p>
        </section>
      )}

      <section className="glass-panel p-4 sm:p-6 md:p-8 space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest">Export Daily Task Sheet</h3>
            <p className="text-[10px] text-brand-metal uppercase tracking-wider">
              <ArabicText>تصدير يومية القسم</ArabicText>
              <span className="mx-1">·</span>
              Paper traveler with pre-filled tasks and blank input fields
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleExport("xls")}
              className="industrial-btn border-brand-success/40 text-brand-success"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export .xls</span>
            </button>
            <button
              type="button"
              onClick={() => handleExport("print")}
              className="industrial-btn border-brand-wood/60 text-brand-wood"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button type="button" onClick={() => handleExport("html")} className="industrial-btn">
              <Download className="w-3.5 h-3.5" />
              <span>Download HTML</span>
            </button>
          </div>
        </header>

        <div className="border border-brand-border bg-brand-black/40 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-brand-elevated">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">
                <th className="px-3 py-3 w-10">#</th>
                <th className="px-3 py-3">Order ID</th>
                <th className="px-3 py-3">Project</th>
                <th className="px-3 py-3">Product / Part</th>
                <th className="px-3 py-3 text-right">Target</th>
                <th className="px-3 py-3 w-44">
                  Completed Qty <span className="text-brand-wood">↳ handwriting</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-12 text-center text-xs text-brand-metal">
                    {factory === "metal"
                      ? "Metal factory work orders coming soon — connect once a metal dataset is provided."
                      : "No active tasks for this department."}
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
                    <td className="px-3 py-2 text-xs text-brand-luxury text-right">
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
          <h3 className="text-xs font-bold uppercase tracking-widest">How it works</h3>
        </div>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-brand-metal">
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">1 · Pick a department</p>
            Choose the department whose floor team needs the daily traveler.
          </li>
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">2 · Export</p>
            Print directly, save as PDF, or download .xls for Excel-based archives.
          </li>
          <li className="border border-brand-border p-3">
            <p className="text-xs font-bold text-brand-luxury">3 · Capture results</p>
            Data-entry clerks key in handwritten counts at end of shift to update routing.
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
