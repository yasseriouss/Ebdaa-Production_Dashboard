# بنية النظام (Architecture)

هذا المستند يصف **تدفق الطلبات** و**تقسيم الحزم** في المستودع الحالي.

## 1. تدفق طلبات المستخدم

1. المتصفح يحمّل **تطبيق React** (`apps/web`).
2. استدعاءات REST تذهب إلى المسار **`/api`** (في التطوير عبر بروكسي Vite إلى خادم Express).
3. **Express** ([artifacts/api-server/src/app.ts](../artifacts/api-server/src/app.ts)) يثبّت الموجّه الرئيسي على `app.use("/api", router)`.
4. **الموجّهات** ([artifacts/api-server/src/routes](../artifacts/api-server/src/routes)) توزّع المسارات:
   - `/metal`، `/wooden`، `/dashboard`، `/shared-projects`، `/import`، `/export`، بالإضافة إلى فحص الصحة.
5. لمسارات **المعدن / الخشب / لوحة التحكم**: الملفات الرقيقة في `routes` تستدعي **controllers** ثم **services** التي تنفّذ استعلامات **Drizzle** على `@workspace/db`.
6. مسار **الاستيراد والتصدير** يُسجَّل في [artifacts/api-server/src/services/importExport.service.ts](../artifacts/api-server/src/services/importExport.service.ts) ويُحمَّل من [artifacts/api-server/src/routes/importExport.ts](../artifacts/api-server/src/routes/importExport.ts) (ملف رفيع).

## 2. الحزم الأساسية (`lib/`)

| الحزمة | الغرض |
|--------|--------|
| `@workspace/db` | تعريف الجداول (Drizzle `sqliteTable`)، عميل LibSQL، التصدير الموحّد للمخطط |
| `@workspace/api-spec` | مواصفة OpenAPI المصدر لتوليد العميل |
| `@workspace/api-zod` | مخططات Zod المولَّدة / المستخدمة في التحقق من المدخلات |
| `@workspace/api-client-react` | خطافات React Query المولَّدة (Orval) |

## 3. الواجهة (`apps/web`)

- **التوجيه:** Wouter في [apps/web/src/App.tsx](../apps/web/src/App.tsx).
- **التخطيط:** [Layout + Sidebar](../apps/web/src/components/layout/) مع i18n/RTL (`I18nContext`, `DirectionContext`).
- **شاشات المصنع:** [apps/web/src/factory](../apps/web/src/factory) — shadcn/ui + Tailwind v4 داخل `FactorySurface`.
- **الصفحات ENCID:** [apps/web/src/pages](../apps/web/src/pages) — أوامر، تخطيط، تحليلات، إدارة، إلخ.
- **لوحة التحكم الموحّدة (`/`):** [Dashboard.tsx](../apps/web/src/pages/Dashboard.tsx) — تبويبان:
  - **الرؤية التنفيذية** (`#executive`): [ExecutiveDashboardSection](../apps/web/src/components/dashboard/ExecutiveDashboardSection.tsx) يحمّل كسولًا [factory/pages/dashboard.tsx](../apps/web/src/factory/pages/dashboard.tsx) (`embedded`) — بيانات حية عبر `api-client-react`.
  - **تحليلات التشغيل** (`#operational`): رسوم ENCID + fixtures.
- **عميل API:** عند الإقلاع يُستدعى [setupGeneratedApiClient](../apps/web/src/lib/api/setupGeneratedClient.ts) لربط `customFetch` (Orval) بتوكن JWT نفس `apiJson`.
- **إرشادات الأقسام:** [SectionGuidance](../apps/web/src/components/dashboard/SectionGuidance.tsx) + [DashboardSectionHeader](../apps/web/src/components/dashboard/DashboardSectionHeader.tsx).
- **Legacy:** `/dashboard/factory` → `/#executive` ([LegacyFactoryRedirects](../apps/web/src/components/routing/LegacyFactoryRedirects.tsx)).

## 4. حزم إضافية

- **`artifacts/api-server`:** خادم REST للإنتاج.
- **`artifacts/ebdaa-slides`، `artifacts/mockup-sandbox`:** عروض/نماذج مساعدة (ليست الواجهة الإنتاجية).
- **`Data/off/*`:** حزم أرشيف/تجارب مدرجة في `pnpm-workspace.yaml` حسب الحاجة.

## 5. الأمان والتشغيل

- لا تُخزَّن أسرار الاتصال بقواعد بيانات بعيدة في المستودع؛ استخدم `.env` (انظر [.env.example](../.env.example)).
- ملف SQLite المحلي يجب أن يكون على **تخزين دائم** في أي استضافة تقليدية.

لتفاصيل قاعدة البيانات والمتغيرات، راجع [DATABASE.md](DATABASE.md).
