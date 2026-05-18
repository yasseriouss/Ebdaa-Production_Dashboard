import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  ExternalLink,
  FlaskConical,
  FolderTree,
  Globe,
  LayoutGrid,
  Server,
} from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";

type AppLink = { path: string; ar: string; en: string };

const APP_ROUTES: AppLink[] = [
  { path: "/", ar: "لوحة التحكم", en: "Dashboard" },
  { path: "/login", ar: "تسجيل الدخول", en: "Login" },
  { path: "/departments", ar: "الأقسام", en: "Departments" },
  { path: "/production", ar: "مركز الإنتاج (أوامر معدن/خشب)", en: "Production hub (metal/wood orders)" },
  { path: "/orders/metal", ar: "أوامر المعدن (إعادة توجيه → مركز الإنتاج)", en: "Metal orders (redirect → production hub)" },
  { path: "/orders/wood", ar: "أوامر الخشب (إعادة توجيه → مركز الإنتاج)", en: "Wood orders (redirect → production hub)" },
  { path: "/daily/metal", ar: "إنتاج يومي — معدن", en: "Daily production · metal" },
  { path: "/daily/wood", ar: "إنتاج يومي — خشب", en: "Daily production · wood" },
  { path: "/projects/joint", ar: "مشاريع مشتركة", en: "Joint projects" },
  { path: "/projects/new", ar: "مشروع جديد", en: "New project" },
  { path: "/projects/work-order-analysis", ar: "تحليل أوامر الشغل", en: "WO analysis" },
  { path: "/planning", ar: "التخطيط والجدولة", en: "Planning" },
  { path: "/about-system", ar: "حول النظام", en: "About & training" },
  { path: "/workflow-routing", ar: "خريطة سير العمل والتوجيه", en: "Workflow ↔ routing map" },
  { path: "/equipment", ar: "سجل المعدات", en: "Equipment" },
  { path: "/analytics", ar: "تحليلات — الكل", en: "Analytics · all" },
  { path: "/analytics/wood", ar: "تحليلات الخشب", en: "Analytics · wood" },
  { path: "/analytics/metal", ar: "تحليلات المعدن", en: "Analytics · metal" },
  { path: "/project-analytics", ar: "تحليلات المشاريع", en: "Project analytics" },
  { path: "/audit-log", ar: "سجل التدقيق", en: "Audit log" },
  { path: "/performance/departments", ar: "أداء الأقسام", en: "Performance · departments" },
  { path: "/performance/people", ar: "أداء الأفراد", en: "Performance · people" },
  { path: "/dev/tools", ar: "خريطة أدوات التطوير", en: "Dev tools map" },
];

type ApiLink = { path: string; note: string };

const API_TRY: ApiLink[] = [
  { path: "/api/healthz", note: "صحة الخادم" },
  { path: "/api/dashboard/stats", note: "إحصاءات لوحة التحكم JSON" },
  { path: "/api/auth/me", note: "المستخدم الحالي (قد يكون 401)" },
  { path: "/api/auth/catalog", note: "كتالوج الصلاحيات" },
  { path: "/api/factory-hub/wood-work-orders", note: "قائمة أوامر الخشب hub (قد يحتاج توكن وصلاحية)" },
];

const REPO_ROOTS = [
  { path: "apps/web", ar: "هذه الواجهة (Vite + React)" },
  { path: "artifacts/api-server", ar: "خادم Express / REST" },
  { path: "apps/web/src/factory", ar: "شاشات المصنع (مدمجة)" },
  { path: "lib/db", ar: "Drizzle + مخطط + ترحيلات" },
  { path: "lib/api-spec/openapi.yaml", ar: "عقد OpenAPI" },
  { path: "lib/api-zod", ar: "مخططات Zod مُولَّدة" },
  { path: "lib/api-client-react", ar: "عميل React Query" },
  { path: "docs/", ar: "توثيق عام" },
  { path: "scripts/", ar: "سكربتات مساعدة" },
  { path: "Data/off/factory-wood-dashboard", ar: "لوحة خشب إضافية" },
  { path: "Data/off/factory-floor-rtl", ar: "مصنع أرضي RTL" },
] as const;

const PNPM_HINTS = [
  "pnpm --filter @workspace/api-server dev  (مع PORT=8788)",
  "pnpm --filter web dev",
  "pnpm --filter @workspace/db run migrate",
  "pnpm --filter @workspace/db run rebuild-snapshots",
  "pnpm --filter @workspace/api-spec run codegen",
];

function LinkChip({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      href={to}
      className="inline-flex items-center gap-1.5 rounded-md border border-brand-border bg-brand-elevated/90 px-3 py-2 text-sm text-gray-200 transition hover:border-brand-metal/40 hover:bg-brand-elevated"
    >
      {children}
    </Link>
  );
}

export default function DevToolsMap() {
  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-brand-metal">
          <FlaskConical className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-widest">Dev</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-luxury">
          خريطة أدوات التطوير
        </h1>
        <ArabicText block className="text-sm text-brand-metal max-w-2xl leading-relaxed">
          صفحة تجريبية: روابط سريعة داخل هذه الواجهة، ونقاط API عبر البروكسي، ومسارات الحزم في المستودع
          (نسبية من جذر المشروع). افتح روابط API في تبويب جديد إن أردت المعاينة الخام.
        </ArabicText>
      </header>

      <section className="glass-panel rounded-xl border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury font-semibold">
          <LayoutGrid className="h-4 w-4" aria-hidden />
          مسارات الواجهة (نفس التطبيق)
        </div>
        <div className="flex flex-wrap gap-2">
          {APP_ROUTES.map((r) => (
            <LinkChip key={r.path} to={r.path}>
              <span className="font-mono text-xs opacity-80">{r.path}</span>
              <span className="text-end">{r.ar}</span>
            </LinkChip>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury font-semibold">
          <Server className="h-4 w-4" aria-hidden />
          API عبر البروكسي (يحتاج تشغيل api-server)
        </div>
        <p className="text-xs text-brand-metal">
          في التطوير، Vite يوجّه <code className="rounded bg-brand-border px-1">/api</code> إلى{" "}
          <code className="rounded bg-brand-border px-1">127.0.0.1:8788</code> (انظر{" "}
          <code className="rounded bg-brand-border px-1">vite.config.ts</code>).
        </p>
        <ul className="space-y-2">
          {API_TRY.map((a) => (
            <li key={a.path}>
              <a
                href={a.path}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-brand-wood hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                <code className="rounded bg-brand-border px-1.5 py-0.5 text-xs">{a.path}</code>
                <span className="text-brand-metal">— {a.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-panel rounded-xl border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury font-semibold">
          <FolderTree className="h-4 w-4" aria-hidden />
          حزم المستودع (مسارات نسبية من جذر Encid Factory Data Hub)
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          {REPO_ROOTS.map((r) => (
            <li
              key={r.path}
              className="flex gap-2 rounded-md border border-brand-border/60 bg-brand-elevated/50 px-3 py-2"
            >
              <code className="shrink-0 font-mono text-xs text-brand-wood">{r.path}</code>
              <span className="text-brand-metal text-xs leading-snug">{r.ar}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass-panel rounded-xl border border-brand-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-brand-luxury font-semibold">
          <Globe className="h-4 w-4" aria-hidden />
          واجهات أخرى (تشغّل يدوياً إن لزم)
        </div>
        <p className="text-xs text-brand-metal">
          المنفذ يعتمد على إعداداتك. جرّب الروابط بعد تشغيل الحزمة المناسبة.
        </p>
        <ul className="space-y-2 text-sm">
          <li>
            <a
              href="http://127.0.0.1:5173/dev/tools"
              className="text-brand-wood hover:underline"
            >
              http://127.0.0.1:5173/dev/tools
            </a>{" "}
            <span className="text-brand-metal">— هذه الصفحة (افتراضي Vite)</span>
          </li>
          <li>
            <a href="http://127.0.0.1:8788/api/healthz" className="text-brand-wood hover:underline">
              http://127.0.0.1:8788/api/healthz
            </a>{" "}
            <span className="text-brand-metal">— API مباشرة (PORT=8788)</span>
          </li>
        </ul>
      </section>

      <section className="glass-panel rounded-xl border border-brand-border p-6 space-y-3">
        <div className="text-brand-luxury font-semibold">أوامر pnpm مألوفة</div>
        <pre className="overflow-x-auto rounded-lg bg-brand-elevated/80 border border-brand-border p-4 text-xs leading-relaxed text-gray-200">
          {PNPM_HINTS.join("\n")}
        </pre>
      </section>
    </div>
  );
}
