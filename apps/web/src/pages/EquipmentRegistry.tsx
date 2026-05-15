import { Factory } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { ebdaaMachinesFixture } from "../data/ebdaa";

export default function EquipmentRegistry() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6 space-y-2">
        <div className="flex items-center gap-3">
          <Factory className="w-6 h-6 text-brand-wood" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">Equipment registry</h1>
            <ArabicText className="text-sm text-brand-metal">سجل المعدات — خط HOMAG المعتمد</ArabicText>
          </div>
        </div>
        <p className="text-sm text-brand-metal max-w-3xl">
          يعرض الجدول الأصول الواردة من تقرير Tajawal الشامل (21 صفًا). أي مرجع SCM أو تفاصيل متعارضة تُدار كمحتوى تدريبي وليس كسجل
          تشغيل افتراضي إلى أن يتم التحقق من لوحة البيانات على كل ماكينة.
        </p>
      </header>

      <div className="overflow-x-auto glass-panel border border-brand-border">
        <table className="w-full text-xs">
          <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
            <tr>
              <th className="p-2 text-start">#</th>
              <th className="p-2 text-start">Serial</th>
              <th className="p-2 text-start">Model</th>
              <th className="p-2 text-start">Name (AR)</th>
              <th className="p-2 text-start">Section (AR)</th>
              <th className="p-2 text-start">Dept hint</th>
              <th className="p-2 text-start">Critical</th>
            </tr>
          </thead>
          <tbody>
            {ebdaaMachinesFixture.map((m) => (
              <tr key={m.serial} className="border-t border-brand-border">
                <td className="p-2 font-mono text-brand-luxury">{m.index}</td>
                <td className="p-2 font-mono text-brand-metal">{m.serial}</td>
                <td className="p-2 text-brand-luxury">{m.model}</td>
                <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                  {m.nameAr}
                </td>
                <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                  {m.section}
                </td>
                <td className="p-2 text-brand-metal">{m.departmentHint}</td>
                <td className="p-2">{m.critical ? <span className="text-brand-error font-bold">★</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
