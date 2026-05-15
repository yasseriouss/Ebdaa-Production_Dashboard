import { Link } from "wouter";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Factory,
  FileSpreadsheet,
  ShieldCheck,
  Waypoints,
  Compass,
  HelpCircle,
} from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import {
  EBdaa_DATA_POLICY,
  ebdaaDailySheetFieldMap,
  ebdaaDailySheetMappingNotes,
  ebdaaDocumentRequirements,
  ebdaaExcelSheets,
  ebdaaQCCheckpoints,
  ebdaaWorkflowRoutingRows,
} from "../data/ebdaa";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";

const trainingModules = [
  {
    title: "تعريف الوحدات",
    body:
      "الفرق بين لوحة التحكم (ملخص حي)، أوامر الخشب (تفاصيل التوجيه)، والإنتاج اليومي (مخرجات أرضية قابلة للطباعة).",
  },
  {
    title: "مسار أمر الشغل",
    body: "المقاطع ← لزق الشريط ← CNC ← الجودة (بوابة) ← التجميع ← التغليف ← التسليم — يطابق الحقول داخل التوجيه الرقمي.",
  },
  {
    title: "الوثائق ونقاط التفتيش",
    body:
      "أمر الشغل، إذن صرف خامات، إذن ترحيل بعد كل مرحلة، وملفات DXF من المكتب الفني؛ معايير مثل ±2 مم للتقطيع تُطبَّق يدويًا حتى ربط أتمتة الجودة.",
  },
  {
    title: "المعدات الحرجة",
    body: "V-200 للتخريم عالي الدقة، راوتر 5 محاور لعمليات ثلاثية الأبعاد، والالتزام بجدول الصيانة اليومي لتقليل التوقف.",
  },
  {
    title: "التقارير والتصدير",
    body: "ابدأ بملفات HTML/XLS اليومية، ثم تابع لوحة التخطيط للـ KPI الأسبوعية والشهرية عند توفر الأرقام الفعلية.",
  },
];

const faqItems = [
  {
    q: "لماذا لا أرى SCM في سجل المعدات؟",
    a: "السجل الرقمي يعتمد خط HOMAG حسب سياسة المصنع. مرجع SCM مذكور كمرجع تقني فقط إلى أن يُحدَّد ميدانيًا.",
  },
  {
    q: "أين أجد KPI الأسبوعية والشهرية؟",
    a: "من القائمة الجانبية: التخطيط والجدولة (/planning). القيم الافتراضية صفر حتى تُدخل بيانات حقيقية.",
  },
  {
    q: "هل أرقام ROI في ملفات Excel حقيقية في النظام؟",
    a: "لا. مقترحات ROI للعرض الإداري؛ لا تُستورد كحقائق تشغيل آلية دون مراجعة مالية.",
  },
  {
    q: "ماذا أفعل إذا ظهر #DIV/0! في تقييم العمالة؟",
    a: "لا تستورد الورقة قبل إصلاح المعادلات؛ راجع التوثيق في قسم قوالب Excel أدناه.",
  },
];

export default function AboutSystem() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section className="glass-panel border border-brand-wood/30 p-5 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <Compass className="w-4 h-4 text-brand-wood" />
          <h2 className="text-sm font-bold uppercase tracking-wide">ابدأ من هنا</h2>
        </div>
        <p className="text-xs text-brand-metal max-w-3xl" dir="rtl" lang="ar">
          مسار مقترح: لوحة التحكم ← أوامر الخشب ← الإنتاج اليومي ← التخطيط؛ راجع المعدات والوثائق عند الحاجة.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="industrial-btn text-[10px] py-2 px-3">
            Dashboard
          </Link>
          <Link href="/orders/wood" className="industrial-btn text-[10px] py-2 px-3">
            Wood orders
          </Link>
          <Link href="/daily/wood" className="industrial-btn text-[10px] py-2 px-3">
            Daily wood
          </Link>
          <Link href="/planning" className="industrial-btn text-[10px] py-2 px-3">
            Planning KPI
          </Link>
          <Link href="/equipment" className="industrial-btn text-[10px] py-2 px-3">
            Equipment
          </Link>
        </div>
      </section>

      <header className="border-b border-brand-border pb-6 space-y-3">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-brand-wood" />
          <div>
            <h1 className="text-3xl font-bold tracking-tighter uppercase">About the System</h1>
            <ArabicText className="text-sm text-brand-metal">حول النظام والتدريب الموجز</ArabicText>
          </div>
        </div>
        <p className="text-sm text-brand-metal max-w-3xl">
          هذه الصفحة تلخص حزمة «إبداع» (ماكينات، سير عمل، قوالب Excel) وكيفية استخدامها داخل Factory Data Hub. تم اعتماد بيانات
          المعدات من خط HOMAG وفق سياسة البيانات أدناه.
        </p>
      </header>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <ShieldCheck className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Data policy</h2>
        </div>
        <ArabicText className="text-sm text-brand-metal leading-relaxed block space-y-2">
          <span className="block">المصدر الرسمي: {EBdaa_DATA_POLICY.canonicalMachineSource}</span>
          <span className="block">مرجع ثانوي: {EBdaa_DATA_POLICY.secondaryReference}</span>
          <span className="block">خصوصية: {EBdaa_DATA_POLICY.sensitivityNote}</span>
        </ArabicText>
        <p className="text-xs text-brand-metal">
          سجل المعدات المعروض برمجيًا موجود في{" "}
          <Link href="/equipment" className="text-brand-luxury underline-offset-2 hover:underline">
            /equipment
          </Link>
          .
        </p>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <GraduationCap className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Training path</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {trainingModules.map((mod) => (
            <article key={mod.title} className="border border-brand-border p-4 bg-brand-black/40">
              <h3 className="text-sm font-bold text-brand-luxury mb-2" dir="rtl" lang="ar">
                {mod.title}
              </h3>
              <p className="text-xs leading-relaxed text-brand-metal" dir="rtl" lang="ar">
                {mod.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <Waypoints className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Workflow ↔ routing map</h2>
        </div>
        <p className="text-xs text-brand-metal">
          يربط الجدول التالي مراحل الدليل الورقي بمفاتيح التوجيه في التطبيق (إن وُجدت). الخلايا الفارغة تعني أعمال مكتبية أو جودة
          قبل التجميع.
        </p>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">#</th>
                <th className="p-2 text-start">Stage (AR)</th>
                <th className="p-2 text-start">Owner (AR)</th>
                <th className="p-2 text-start">Routing key</th>
                <th className="p-2 text-start">Notes (AR)</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaWorkflowRoutingRows.map((row) => (
                <tr key={row.stepOrder} className="border-t border-brand-border">
                  <td className="p-2 font-mono text-brand-luxury">{row.stepOrder}</td>
                  <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                    {row.stageNameAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {row.ownerAr}
                  </td>
                  <td className="p-2 text-brand-metal">{row.routingKey ?? "—"}</td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {row.notesAr ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <ClipboardList className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Wood routing keys (GL)</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {WOOD_STAGE_ORDER.map((key) => (
            <div key={key} className="border border-brand-border p-3">
              <p className="text-[11px] font-bold text-brand-luxury">{key}</p>
              <ArabicText className="text-xs text-brand-metal">{WOOD_STAGE_LABELS[key].arabic}</ArabicText>
              <p className="text-[10px] text-brand-metal mt-1">{WOOD_STAGE_LABELS[key].english}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <ClipboardList className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Document requirements</h2>
        </div>
        <p className="text-xs text-brand-metal" dir="rtl" lang="ar">
          مستخرج من دليل المستندات في حزمة سير العمل؛ التوقيعات والمسؤوليات تقابل مسارات أوامر الشغل على الأرض.
        </p>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">Document (AR)</th>
                <th className="p-2 text-start">Purpose (AR)</th>
                <th className="p-2 text-start">Issuer (AR)</th>
                <th className="p-2 text-start">Signatures (AR)</th>
                <th className="p-2 text-start">Notes (AR)</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaDocumentRequirements.map((doc) => (
                <tr key={doc.documentAr} className="border-t border-brand-border">
                  <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                    {doc.documentAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {doc.purposeAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {doc.issuerAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {doc.signaturesAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {doc.notesAr ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <ShieldCheck className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">QC checkpoints</h2>
        </div>
        <div className="overflow-x-auto border border-brand-border">
          <table className="w-full text-xs">
            <thead className="bg-brand-elevated text-[10px] uppercase tracking-wide text-brand-metal">
              <tr>
                <th className="p-2 text-start">Stage (AR)</th>
                <th className="p-2 text-start">Checkpoint (AR)</th>
                <th className="p-2 text-start">Owner (AR)</th>
                <th className="p-2 text-start">Acceptance (AR)</th>
                <th className="p-2 text-start">Rejection (AR)</th>
                <th className="p-2 text-start">Importance (AR)</th>
              </tr>
            </thead>
            <tbody>
              {ebdaaQCCheckpoints.map((qc, idx) => (
                <tr key={`${qc.stageAr}-${qc.checkpointAr}-${idx}`} className="border-t border-brand-border">
                  <td className="p-2 text-brand-luxury" dir="rtl" lang="ar">
                    {qc.stageAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {qc.checkpointAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {qc.ownerAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {qc.acceptanceCriteriaAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {qc.rejectionActionsAr}
                  </td>
                  <td className="p-2 text-brand-metal" dir="rtl" lang="ar">
                    {qc.importanceAr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-panel border border-brand-border border-dashed p-6 space-y-3">
        <h2 className="text-lg font-bold uppercase tracking-wide text-brand-luxury">SCM technical reference (non-canonical)</h2>
        <ArabicText className="text-xs text-brand-metal leading-relaxed">
          بعض الوثائق القديمة تصف منشار SCM Nova SI 400 — لا يُدمَج في السجل التشغيلي الافتراضي إلى أن يُوافَق على دمج المرجعين أو التحقق من لوحة
          البيانات. استخدم سجل HOMAG في صفحة المعدات للعمل اليومي.
        </ArabicText>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <HelpCircle className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">FAQ — أسئلة سريعة</h2>
        </div>
        <dl className="space-y-4 text-xs">
          {faqItems.map((item) => (
            <div key={item.q} className="border border-brand-border p-4 bg-brand-black/30">
              <dt className="font-bold text-brand-luxury mb-2" dir="rtl" lang="ar">
                {item.q}
              </dt>
              <dd className="text-brand-metal leading-relaxed" dir="rtl" lang="ar">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="glass-panel border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury">
          <FileSpreadsheet className="w-4 h-4" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Excel templates inventory</h2>
        </div>
        <div className="space-y-3 text-xs text-brand-metal">
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.workflowPack.file}</p>
            <ul className="list-disc ms-4 mt-1 space-y-1">
              {ebdaaExcelSheets.workflowPack.sheets.map((s) => (
                <li key={s.name}>
                  {s.name}: {s.columnsAr.join(" · ")}
                  {"appMapping" in s && s.appMapping ? ` → ${s.appMapping}` : ""}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-dashed border-brand-border p-3 space-y-2 bg-brand-black/20">
            <p className="font-bold text-brand-luxury">Daily traveler ↔ Ebdaa columns</p>
            <pre className="text-[10px] font-mono text-brand-metal overflow-x-auto whitespace-pre-wrap break-all">
              {JSON.stringify(ebdaaDailySheetFieldMap, null, 2)}
            </pre>
            <ul className="list-disc ms-4 space-y-1">
              {ebdaaDailySheetMappingNotes.map((note: string) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.dailyProduction.file}</p>
            <ul className="list-disc ms-4 mt-1 space-y-1">
              {ebdaaExcelSheets.dailyProduction.sheets.map((s) => (
                <li key={s.name}>
                  {s.name}: {s.columnsAr.join(" · ")}
                  {s.appMapping ? ` → ${s.appMapping}` : ""}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.periodic.file}</p>
            <ul className="list-disc ms-4 mt-1 space-y-1">
              {ebdaaExcelSheets.periodic.sheets.map((s) => (
                <li key={s.name}>{s.name}: {s.columnsAr.join(" · ")}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.technicians.file}</p>
            <ul className="list-disc ms-4 mt-1 space-y-1">
              {ebdaaExcelSheets.technicians.sheets.map((s) => (
                <li key={s.name}>{s.name}: {s.columnsAr.join(" · ")}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.laborEvaluation.file}</p>
            <p className="text-brand-error mt-1">{ebdaaExcelSheets.laborEvaluation.warning}</p>
          </div>
          <div>
            <p className="font-bold text-brand-luxury">{ebdaaExcelSheets.roi.file}</p>
            <p>{ebdaaExcelSheets.roi.note}</p>
          </div>
        </div>
      </section>

      <section className="glass-panel border border-brand-border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Factory className="w-5 h-5 text-brand-wood" />
          <div>
            <h3 className="text-sm font-bold uppercase text-brand-luxury">Next steps</h3>
            <ArabicText className="text-xs text-brand-metal leading-relaxed">
              راجع لوحة التخطيط للـ KPI الدورية، وسجل المعدات للتحقق الميداني من أي فروقات قبل استيراد SCM.
            </ArabicText>
          </div>
        </div>
        <Link href="/planning" className="industrial-btn inline-flex justify-center">
          Open planning KPI
        </Link>
      </section>
    </div>
  );
}
