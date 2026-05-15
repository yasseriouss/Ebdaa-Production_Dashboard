# بنية النظام (Architecture)

هذا المستند يصف **تدفق الطلبات** و**تقسيم الحزم** في المستودع الحالي (وليس وصف Replit التاريخي فقط).

## 1. تدفق طلبات المستخدم

1. المتصفح يحمّل **تطبيق React** (`@workspace/factory-app`).
2. استدعاءات REST تذهب إلى المسار **`/api`** (في التطوير غالبًا عبر بروكسي Vite إلى خادم Express).
3. **Express** ([artifacts/api-server/src/app.ts](artifacts/api-server/src/app.ts)) يثبّت الموجّه الرئيسي على `app.use("/api", router)`.
4. **الموجّهات** ([artifacts/api-server/src/routes](artifacts/api-server/src/routes)) توزّع المسارات:
   - `/metal`، `/wooden`، `/dashboard`، `/shared-projects`، `/import`، `/export`، بالإضافة إلى فحص الصحة.
5. لمسارات **المعدن / الخشب / لوحة التحكم**: الملفات الرقيقة في `routes` تستدعي **controllers** ثم **services** التي تنفّذ استعلامات **Drizzle** على `@workspace/db`.
6. مسار **الاستيراد والتصدير** يُسجَّل في [artifacts/api-server/src/services/importExport.service.ts](artifacts/api-server/src/services/importExport.service.ts) ويُحمَّل من [artifacts/api-server/src/routes/importExport.ts](artifacts/api-server/src/routes/importExport.ts) (ملف رفيع).

## 2. الحزم الأساسية (`lib/`)

| الحزمة | الغرض |
|--------|--------|
| `@workspace/db` | تعريف الجداول (Drizzle `sqliteTable`)، عميل LibSQL، التصدير الموحّد للمخطط |
| `@workspace/api-spec` | مواصفة OpenAPI المصدر لتوليد العميل |
| `@workspace/api-zod` | مخططات Zod المولَّدة / المستخدمة في التحقق من المدخلات |
| `@workspace/api-client-react` | خطافات React Query المولَّدة (Orval) |

## 3. الواجهة (`artifacts/factory-app`)

- **التوجيه:** Wouter.
- **المكوّنات:** shadcn/ui + Tailwind v4.
- **الصفحات** تحت `src/pages/` تشمل: لوحة التحكم، أوامر/تفاصيل/إنتاج معدني وخشبي، مشاريع مشتركة، تخطيط، تحليلات، استيراد/تصدير، وصفحة غير موجود.

## 4. حزم إضافية

- **`apps/web`:** تطبيق Vite منفصل في الـ workspace؛ ليس هو التطبيق الإنتاجي الرئيسي ما لم يُربَط صراحةً بنفس الـ API.
- **`Data/off/*`:** حزم أرشيف/تجارب مدرجة في `pnpm-workspace.yaml` حسب الحاجة.

## 5. الأمان والتشغيل

- لا تُخزَّن أسرار الاتصال بقواعد بيانات بعيدة في المستودع؛ استخدم `.env` (انظر [.env.example](../.env.example)).
- ملف SQLite المحلي يجب أن يكون على **تخزين دائم** في أي استضافة تقليدية.

لتفاصيل قاعدة البيانات والمتغيرات، راجع [DATABASE.md](DATABASE.md).
