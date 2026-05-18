# مصنع البيانات — ENCID Factory Data Hub

مستودع **pnpm workspaces** لإدارة مصنعين (معدني وخشبي): أوامر عمل، مراحل إنتاج، مشاريع مشتركة، تخطيط، تحليلات، واستيراد/تصدير. الواجهة **RTL** بالعربية مع دعم الإنجليزية عبر نظام i18n مخصّص.

## البنية السريعة

| المكوّن | المسار | الوصف |
|--------|--------|--------|
| **واجهة الإنتاج** | `apps/web` | React 19 + Vite 8 + Wouter + TanStack Query + Tailwind v4 |
| **شاشات المصنع** | `apps/web/src/factory` | لوحة تنفيذية، أوامر، إنتاج، مشاريع — داخل `FactorySurface` (shadcn/Radix) |
| **الـ API** | `artifacts/api-server` | Express 5، controllers ← services، Drizzle عبر `@workspace/db` |
| **قاعدة البيانات** | `lib/db` | **Drizzle ORM** + **SQLite عبر LibSQL** (`@libsql/client`) |
| **عقد API** | `lib/api-spec`، `lib/api-zod`، `lib/api-client-react` | OpenAPI + Zod + React Query (Orval) |
| **سكربتات** | `scripts` | ETL من Postgres → LibSQL عند الحاجة |

تفاصيل أعمق: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) و [docs/DATABASE.md](docs/DATABASE.md).  
مصفوفة دمج المسارات: [docs/FACTORY_WEB_MERGE_PARITY.md](docs/FACTORY_WEB_MERGE_PARITY.md).

## التقنيات المستخدمة (ملخّص)

### أدوات المستودع

- **pnpm workspaces** · **TypeScript** · **Prettier** · **tsx** · **esbuild** (بناء API)
- **GitHub Actions** — CI: build + Vitest + Playwright ([`.github/workflows/web.yml`](.github/workflows/web.yml))

### الواجهة (`apps/web`)

| الفئة | التقنيات |
|--------|-----------|
| أساس | React 19، Vite 8، Wouter |
| بيانات | TanStack React Query v5، `@workspace/api-client-react` (Orval) |
| UI | Tailwind CSS v4، Radix UI، shadcn/ui (نمط)، CVA، Lucide |
| رسوم / حركة | Recharts، Framer Motion، Mermaid |
| نماذج / تحقق | React Hook Form، Zod |
| i18n | `I18nContext` + `DirectionContext` (عربي/إنجليزي، RTL/LTR) |
| ثيم | سمتان: تنفيذية (فاتح) / صناعية (داكن) — `data-theme` + OKLCH |
| اختبارات | Vitest، Testing Library، Playwright |

### الخلفية (`artifacts/api-server`)

Express 5 · Drizzle ORM · Zod · LibSQL · **jose** (JWT) · Pino · Multer · pdfkit/pdf-lib · xlsx

### قاعدة البيانات

SQLite (LibSQL) · Drizzle Kit (generate / push / migrate) · drizzle-zod

### عقود API

OpenAPI 3 → **Orval** → hooks React Query + مخططات Zod

### حزم جانبية (ليست الواجهة الرئيسية)

| المسار | ملاحظة |
|--------|--------|
| `artifacts/factory-app` | **مهمل** — دُمج في `apps/web/src/factory` |
| `artifacts/ebdaa-slides` | عروض React + Vite |
| `Data/off/factory-wood-dashboard` | Next.js 16 (تجريبي/منفصل) |

## لوحة التحكم الموحّدة (`/`)

الصفحة الرئيسية تعرض **الرؤية التنفيذية** فقط (بيانات حية من API):

| القسم | المحتوى |
|--------|---------|
| **الرؤية التنفيذية** | KPIs مباشرة من API، توزيع الحالات، عملاء، ضغط أقسام/ماكينات — تحميل كسول عبر `ExecutiveDashboardSection` |
| **تحليلات التشغيل** (مرجع + رسوم ثابتة جزئياً) | تُعرض في **`/analytics`** (بما فيها الكتل المنقولة من تبويب «تشغيلي» السابق على الصفحة الرئيسية) |

قوائم أوامر المعدن/الخشب: المدخل الموحّد **`/production`** (مع استعلام `factory` / `view`). عناوين `/orders/metal` و`/orders/wood` تعيد التوجيه إلى مركز الإنتاج مع الحفاظ على صلاحيات `orders:*:view`.

**إعداد API للتطوير:** انسخ [`artifacts/api-server/.env.example`](artifacts/api-server/.env.example) إلى **`artifacts/api-server/.env`** (ليس جذر المستودع فقط) قبل `pnpm --filter @workspace/api-server run dev`.

**آخر التحديثات (واجهة):**

- دمج `/dashboard/factory` → `/#executive` على الصفحة الرئيسية
- إزالة تبويب التشغيلي من الصفحة الرئيسية؛ `#operational` يعيد التوجيه إلى `/analytics`
- إرشادات الأقسام عبر أيقونة ⓘ قابلة للطي (`SectionGuidance` / `DashboardSectionHeader`)
- ربط توكن JWT لعميل Orval عند الإقلاع (`setupGeneratedApiClient` في `main.tsx`)
- حالات خطأ وإعادة محاولة للرؤية التنفيذية عند فشل API (`ExecutiveDataStatus`)
- بطاقات KPI مدمجة تستخدم `stat-card` داخل الثيم الصناعي/التنفيذي

## المتطلبات

- **Node.js** 22+ (CI) — 24+ موصى به ([`.replit`](.replit))
- [pnpm](https://pnpm.io/)

## إعداد البيئة

1. انسخ المثال وعدّل القيم:

```bash
cp .env.example .env
```

2. المتغيرات الأساسية (انظر [.env.example](.env.example)):

| المتغير | الغرض |
|---------|--------|
| `LIBSQL_URL` / `SQLITE_FILE` | موقع SQLite (افتراضي `local.db` في الجذر) |
| `PORT` | منفذ API (افتراضي **8788**) |
| `VITE_API_PROXY_TARGET` | هدف بروكسي Vite لـ `/api` في التطوير |
| `JWT_SECRET` | مصادقة API (انظر `artifacts/api-server/.env.example`) |
| `VITE_OFFLINE_UNRESTRICTED` | (تطوير) تعطيل إرفاق Bearer عند الحاجة |

## أوامر التشغيل اليومية

من جذر المستودع:

```bash
pnpm install
```

**تشغيل الـ API** (افتراضي **8788**):

```bash
pnpm --filter @workspace/api-server run dev
```

**تشغيل الواجهة:**

```bash
pnpm --filter web run dev
```

يفتح عادةً **http://localhost:5173**. طلبات `/api` تُوجَّه إلى `VITE_API_PROXY_TARGET` (افتراضي `http://127.0.0.1:8788`) — شغّل الـ API قبل فتح تبويب **الرؤية التنفيذية**.

**توليد عميل API من OpenAPI:**

```bash
pnpm --filter @workspace/api-spec run codegen
```

**مخطط قاعدة البيانات (Drizzle Kit):**

```bash
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run push
```

**الترحيلات SQL:**

```bash
pnpm --filter @workspace/db run migrate
```

**اختبارات الواجهة:**

```bash
pnpm --filter web run test          # Vitest
pnpm --filter web run test:e2e     # Playwright
pnpm --filter web run build
```

**ETL من Postgres → LibSQL:**

```bash
# جاف — أعداد فقط
$env:SOURCE_DATABASE_URL="postgresql://..."   # PowerShell
pnpm --filter @workspace/scripts run etl:pg-to-libsql

# تنفيذ فعلي
$env:ETL_APPLY="1"
pnpm --filter @workspace/scripts run etl:pg-to-libsql
```

## التحقق من الأنواع

```bash
pnpm run typecheck
```

## استقرار العمل والدمج

- مرّر `pnpm run typecheck` و`pnpm --filter web run build` قبل الدمج.
- بعد تغييرات OpenAPI: `pnpm --filter @workspace/api-spec run codegen`.
- قسّم PRs: API · DB · UI.
- قاعدة البيانات المعتمدة: **SQLite/LibSQL** — Postgres عبر [docs/rfc-libsql-migration.md](docs/rfc-libsql-migration.md) وETL عند الحاجة فقط.

## الترخيص

MIT (انظر [package.json](package.json)).
