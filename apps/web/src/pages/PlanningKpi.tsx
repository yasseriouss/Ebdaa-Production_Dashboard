import { CalendarRange, LineChart } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import {
  ebdaaHalfYearKpiFixture,
  ebdaaMonthlyKpiFixture,
  ebdaaWeeklyKpiFixture,
  ebdaaYearlyKpiFixture,
} from "../data/ebdaa";

export default function PlanningKpi() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6 space-y-3">
        <div className="flex items-center gap-3">
          <CalendarRange className="w-6 h-6 text-brand-wood" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Planning & KPI</h1>
            <ArabicText className="text-sm text-brand-metal">المتابعة الدورية — قوالب جاهزة للتحديث</ArabicText>
          </div>
        </div>
        <p className="text-sm text-brand-metal max-w-3xl">
          تعرض الصفحة هياكل KPI مطابقة لملف «المتابعة_الدورية_الشاملة.xlsx» (أسبوعي، شهري، نصف سنوي، وسنوي) مع قيم صفرية كبداية. استبدل الأرقام بالبيانات الفعلية؛ لا تُعامل هذه القيم كحقائق تاريخية حتى تُدخل يدويًا أو تُستورد لاحقًا.
        </p>
      </header>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <LineChart className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Weekly rollup</h2>
        </div>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">Week</th>
                <th className="p-2 text-start">From</th>
                <th className="p-2 text-start">To</th>
                <th className="p-2 text-end">Projects</th>
                <th className="p-2 text-end">Done</th>
                <th className="p-2 text-end">Active</th>
                <th className="p-2 text-end">Late</th>
                <th className="p-2 text-end">Achievement %</th>
                <th className="p-2 text-end">Pieces</th>
                <th className="p-2 text-end">Defects</th>
                <th className="p-2 text-end">Quality %</th>
                <th className="p-2 text-end">Runtime h</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaWeeklyKpiFixture.map((row) => (
                <tr key={row.week} className="border-t border-brand-border">
                  <td className="p-2 font-mono text-brand-luxury">{row.week}</td>
                  <td className="p-2 text-brand-metal">{row.from}</td>
                  <td className="p-2 text-brand-metal">{row.to}</td>
                  <td className="p-2 text-end">{row.projectsTotal}</td>
                  <td className="p-2 text-end">{row.projectsDone}</td>
                  <td className="p-2 text-end">{row.projectsActive}</td>
                  <td className="p-2 text-end">{row.projectsLate}</td>
                  <td className="p-2 text-end">{row.achievementPct}</td>
                  <td className="p-2 text-end">{row.piecesProduced}</td>
                  <td className="p-2 text-end">{row.defectivePieces}</td>
                  <td className="p-2 text-end">{row.qualityPct}</td>
                  <td className="p-2 text-end">{row.runtimeHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand-luxury">Monthly rollup</h2>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">Month</th>
                <th className="p-2 text-end">Year</th>
                <th className="p-2 text-end">Projects</th>
                <th className="p-2 text-end">Done</th>
                <th className="p-2 text-end">Late</th>
                <th className="p-2 text-end">Achievement %</th>
                <th className="p-2 text-end">Production</th>
                <th className="p-2 text-end">Quality %</th>
                <th className="p-2 text-end">Revenue plan</th>
                <th className="p-2 text-end">Costs</th>
                <th className="p-2 text-end">Margin %</th>
                <th className="p-2 text-end">Utilization %</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaMonthlyKpiFixture.map((row) => (
                <tr key={`${row.monthAr}-${row.year}`} className="border-t border-brand-border">
                  <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                    {row.monthAr}
                  </td>
                  <td className="p-2 text-end text-brand-metal">{row.year}</td>
                  <td className="p-2 text-end">{row.projectsTotal}</td>
                  <td className="p-2 text-end">{row.projectsDone}</td>
                  <td className="p-2 text-end">{row.projectsLate}</td>
                  <td className="p-2 text-end">{row.achievementPct}</td>
                  <td className="p-2 text-end">{row.productionTotal}</td>
                  <td className="p-2 text-end">{row.qualityPct}</td>
                  <td className="p-2 text-end">{row.revenuePlanned}</td>
                  <td className="p-2 text-end">{row.costs}</td>
                  <td className="p-2 text-end">{row.marginPct}</td>
                  <td className="p-2 text-end">{row.utilizationPct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand-luxury">Half-year rollup</h2>
        <ArabicText className="text-[10px] text-brand-metal">
          مطابق لورقة «نصف سنوي» في ملف المتابعة الدورية — قيم تمهيدية فقط.
        </ArabicText>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">Period (AR)</th>
                <th className="p-2 text-end">Year</th>
                <th className="p-2 text-end">Projects</th>
                <th className="p-2 text-end">Done</th>
                <th className="p-2 text-end">Achievement %</th>
                <th className="p-2 text-end">Production</th>
                <th className="p-2 text-end">Quality %</th>
                <th className="p-2 text-end">Revenue</th>
                <th className="p-2 text-end">Costs</th>
                <th className="p-2 text-end">Net profit</th>
                <th className="p-2 text-end">Margin %</th>
                <th className="p-2 text-start">Goals (AR)</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaHalfYearKpiFixture.map((row) => (
                <tr key={row.periodAr} className="border-t border-brand-border">
                  <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                    {row.periodAr}
                  </td>
                  <td className="p-2 text-end text-brand-metal">{row.year}</td>
                  <td className="p-2 text-end">{row.projectsTotal}</td>
                  <td className="p-2 text-end">{row.projectsDone}</td>
                  <td className="p-2 text-end">{row.achievementPct}</td>
                  <td className="p-2 text-end">{row.productionTotal}</td>
                  <td className="p-2 text-end">{row.qualityPct}</td>
                  <td className="p-2 text-end">{row.revenue}</td>
                  <td className="p-2 text-end">{row.costs}</td>
                  <td className="p-2 text-end">{row.netProfit}</td>
                  <td className="p-2 text-end">{row.marginPct}</td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {row.goalsAchievedAr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand-luxury">Yearly rollup</h2>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-end">Year</th>
                <th className="p-2 text-end">Projects</th>
                <th className="p-2 text-end">Done</th>
                <th className="p-2 text-end">Achievement %</th>
                <th className="p-2 text-end">Production</th>
                <th className="p-2 text-end">Quality %</th>
                <th className="p-2 text-end">Revenue</th>
                <th className="p-2 text-end">Costs</th>
                <th className="p-2 text-end">Net profit</th>
                <th className="p-2 text-end">Margin %</th>
                <th className="p-2 text-end">Growth %</th>
                <th className="p-2 text-end">Investments</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaYearlyKpiFixture.map((row) => (
                <tr key={row.year} className="border-t border-brand-border">
                  <td className="p-2 text-end font-mono text-brand-luxury">{row.year}</td>
                  <td className="p-2 text-end">{row.projectsTotal}</td>
                  <td className="p-2 text-end">{row.projectsDone}</td>
                  <td className="p-2 text-end">{row.achievementPct}</td>
                  <td className="p-2 text-end">{row.productionTotal}</td>
                  <td className="p-2 text-end">{row.qualityPct}</td>
                  <td className="p-2 text-end">{row.revenue}</td>
                  <td className="p-2 text-end">{row.costs}</td>
                  <td className="p-2 text-end">{row.netProfit}</td>
                  <td className="p-2 text-end">{row.marginPct}</td>
                  <td className="p-2 text-end">{row.growthPct}</td>
                  <td className="p-2 text-end">{row.investments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
