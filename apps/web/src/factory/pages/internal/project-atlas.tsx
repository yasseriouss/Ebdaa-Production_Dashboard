import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import mermaid from "mermaid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@factory/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@factory/components/ui/accordion";

let mermaidInitialized = false;

function ensureMermaid() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    themeVariables: {
      primaryColor: "#1e3a5f",
      primaryTextColor: "#f1f5f9",
      lineColor: "#f59e0b",
      secondaryColor: "#0e1628",
      tertiaryColor: "#64748b",
    },
  });
  mermaidInitialized = true;
}

function MermaidBlock({ chart }: { chart: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureMermaid();
    let cancelled = false;
    const id = `atlas-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setError(null);
    mermaid
      .render(id, chart)
      .then(({ svg }: { svg: string }) => {
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svg;
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
      {error ? (
        <p className="text-sm text-destructive" dir="ltr">
          {error}
        </p>
      ) : null}
      <div ref={hostRef} className="overflow-x-auto [&_svg]:max-w-none" dir="ltr" />
    </div>
  );
}

const CHART_ARCHITECTURE = `flowchart LR
  subgraph client["factory-app"]
    UI["React · Wouter · RTL"]
  end
  subgraph api["api-server"]
    R["routes /api"]
    C["controllers"]
    S["services"]
  end
  subgraph db_pkg["lib/db"]
    D["Drizzle · SQLite/LibSQL"]
  end
  UI -->|"REST"| R
  R --> C
  C --> S
  S --> D`;

const CHART_SITEMAP = `flowchart TB
  root["/ لوحة التحكم"]
  prod["/production مركز الإنتاج"]
  mo["/orders/metal"]
  mod["/orders/metal/:id"]
  wo["/orders/wood"]
  wod["/orders/wood/:id"]
  proj["/projects"]
  wf["/workforce"]
  plan["/planning"]
  ana["/analytics"]
  ie["/import-export"]
  root --> prod
  root --> mo
  mo --> mod
  root --> wo
  wo --> wod
  root --> proj
  root --> wf
  root --> plan
  root --> ana
  root --> ie`;

const CHART_ER_CORE = `erDiagram
  factories ||--o{ departments : contains
  departments ||--o{ tasks : defines
  factories ||--o{ employees : employs
  departments ||--o{ employees : optional_scope
  auth_users }o--o| employees : linked_profile
  auth_users ||--o{ auth_user_roles : user_link
  auth_roles ||--o{ auth_user_roles : role_link
  auth_roles ||--o{ auth_role_permissions : role_perm
  auth_permissions ||--o{ auth_role_permissions : perm_row
`;

const CHART_ER_ORDERS = `erDiagram
  wooden_work_orders ||--o{ wooden_production_stages : stages
  metal_work_orders ||--o{ metal_production_stages : stages
  metal_work_orders ||--o{ metal_stage_log : daily_log
`;

const CHART_RBAC = `flowchart TD
  REQ["HTTP + optional Bearer JWT"]
  OPT["optionalAuth"]
  PERM["requirePermission"]
  SVC["services / Drizzle"]
  REQ --> OPT
  OPT --> PERM
  PERM --> SVC`;

const CHART_PERSONAS = `flowchart LR
  subgraph admin["factory_admin"]
    A1["Dashboard KPIs"]
    A2["Planning projects"]
    A3["Analytics import export"]
  end
  subgraph lead["department_lead"]
    L1["Dept planning"]
    L2["Shared projects"]
    L3["Scoped analytics"]
  end
  subgraph op["operator"]
    O1["Metal wood orders"]
    O2["Stage updates"]
    O3["Daily production"]
  end`;

export default function ProjectAtlas() {
  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-surface/95 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              داخلي — Project Atlas
            </p>
            <h1 className="text-xl font-bold tracking-tight">مخططات النظام وخرائط المسارات</h1>
            <p className="text-sm text-muted-foreground">
              للمطورين والعرض الداخلي فقط. غير مبني كواجهة نهائية للمصنع.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-border bg-foreground/5 px-4 py-2 text-sm font-semibold hover:bg-foreground/10"
          >
            العودة للتطبيق
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm leading-relaxed">
          <p className="font-bold text-amber-600 dark:text-amber-400">تشغيل هذه الصفحة</p>
          <p className="mt-1 text-muted-foreground">
            تظهر تلقائياً في وضع التطوير (<code className="rounded bg-muted px-1">import.meta.env.DEV</code>
            ). في الإنتاج اضبط{" "}
            <code className="rounded bg-muted px-1">VITE_SHOW_PROJECT_ATLAS=1</code> في{" "}
            <code className="rounded bg-muted px-1">.env</code> لعرضها عند الحاجة.
          </p>
        </section>

        <Tabs defaultValue="architecture" className="w-full">
          <TabsList className="flex h-auto min-h-9 w-full flex-wrap justify-start gap-1 p-1">
            <TabsTrigger value="architecture">بنية الطلبات</TabsTrigger>
            <TabsTrigger value="sitemap">سايت ماب</TabsTrigger>
            <TabsTrigger value="er">جداول وعلاقات</TabsTrigger>
            <TabsTrigger value="rbac">JWT والصلاحيات</TabsTrigger>
            <TabsTrigger value="personas">مسارات الأدوار</TabsTrigger>
            <TabsTrigger value="suggestions">اقتراحات قاعدة البيانات</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              يطابق وصف{" "}
              <span className="font-medium text-foreground">docs/ARCHITECTURE.md</span>: الواجهة →{" "}
              <code className="rounded bg-muted px-1">/api</code> → مسارات Express → خدمات → Drizzle.
            </p>
            <MermaidBlock chart={CHART_ARCHITECTURE} />
          </TabsContent>

          <TabsContent value="sitemap" className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              مسارات <code className="rounded bg-muted px-1">App.tsx</code> الحقيقية في factory-app.
            </p>
            <MermaidBlock chart={CHART_SITEMAP} />
          </TabsContent>

          <TabsContent value="er" className="mt-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-lg font-bold">العمود الفقري التنظيمي والصلاحيات</h2>
              <p className="text-sm text-muted-foreground">
                علاقات Drizzle المصرّحة: مصانع → أقسام → مهام، موظفون، مستخدمون وربط الأدوار.
              </p>
              <MermaidBlock chart={CHART_ER_CORE} />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold">أوامر العمل (خشب / معدن)</h2>
              <p className="text-sm text-muted-foreground">
                لا يوجد حالياً مفتاح أجنبي من{" "}
                <code className="rounded bg-muted px-1">*_work_orders</code> إلى{" "}
                <code className="rounded bg-muted px-1">factories</code> في المخطط — يُمثَّل كرسم
                منطقي منفصل؛ انظر تبويب الاقتراحات.
              </p>
              <MermaidBlock chart={CHART_ER_ORDERS} />
            </div>
          </TabsContent>

          <TabsContent value="rbac" className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              مصدر مفاتيح الصلاحيات:{" "}
              <code className="rounded bg-muted px-1">lib/db/src/permissionCatalog.ts</code>. التحقق
              من المسارات عبر <code className="rounded bg-muted px-1">requirePermission</code>{" "}
              (وبعض المسارات قد تحتاج تغطية أوسع في الإنتاج).
            </p>
            <MermaidBlock chart={CHART_RBAC} />
          </TabsContent>

          <TabsContent value="personas" className="mt-6 space-y-3">
            <p className="text-sm text-muted-foreground">
              ربط إنساني للأدوار البرمجية: <code className="rounded bg-muted px-1">factory_admin</code>{" "}
              / <code className="rounded bg-muted px-1">department_lead</code> /{" "}
              <code className="rounded bg-muted px-1">operator</code> — مع{" "}
              <code className="rounded bg-muted px-1">super_admin</code> و{" "}
              <code className="rounded bg-muted px-1">viewer</code> في الكatalog.
            </p>
            <MermaidBlock chart={CHART_PERSONAS} />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6 space-y-4">
            <h2 className="text-lg font-bold">اقتراحات تحسين المخطط والاستعلامات</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="fk">
                <AccordionTrigger className="text-right">
                  ربط أوامر العمل بالطوبولوجيا (مصنع / قسم)
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  إضافة أعمدة اختيارية مثل <code className="rounded bg-muted px-1">factory_id</code> /{" "}
                  <code className="rounded bg-muted px-1">department_id</code> إلى جداول{" "}
                  <code className="rounded bg-muted px-1">wooden_work_orders</code> و{" "}
                  <code className="rounded bg-muted px-1">metal_work_orders</code> مع قيود FK إلى{" "}
                  <code className="rounded bg-muted px-1">factories</code> /{" "}
                  <code className="rounded bg-muted px-1">departments</code> لتمكين التصفية الموحّدة
                  وحيز البيانات (data scope) على مستوى أمر العمل.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="hub">
                <AccordionTrigger className="text-right">
                  Factory Hub والجداول المعيارية
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  جداول <code className="rounded bg-muted px-1">fh_*</code> (لقطات، تحليل، حفظ تلقائي)
                  حالياً نسق JSON/مستند. مع الوقت يمكن توحيد المعرّفات مع أوامر العمل المعيارية أو
                  إضافة مفاتيح ارتباط صريحة لتقليل ازدواجية المصدر.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="idx">
                <AccordionTrigger className="text-right">فهارس للاستعلامات الثقيلة</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  بعد قياس الاستعلامات الفعلية في الإنتاج، إضافة فهارس على أعمدة التاريخ وحالة الطلب
                  والعميل/المشروع إذا ظهرت عمليات مسح كاملة على جداول كبيرة.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="audit">
                <AccordionTrigger className="text-right">تدقيق وأعمدة مرجعية</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  بعض حقول <code className="rounded bg-muted px-1">audit_events</code> نصية دون FK —
                  يمكن لاحقاً ربطها بـ <code className="rounded bg-muted px-1">departments.id</code>{" "}
                  عند توحيد نوع المعرّفات.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
