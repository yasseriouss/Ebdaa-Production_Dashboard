# دليل تشغيل قاعدة البيانات على Vercel و Turso

## Database Deployment Guide for Vercel & Turso

> [!NOTE]
> قواعد البيانات من نوع **SQLite** هي عبارة عن ملفات محلية (`.db`). لا يمكن تشغيلها أو الحفاظ عليها داخل البيئات اللامركزية (Serverless) مثل **Vercel** لأنها تحذف الملفات بشكل دوري ومؤقت مع كل استدعاء.
> **الحل القياسي والاحترافي هو استخدام منصة Turso** — وهي منصة سحابية مبنية بالكامل على **LibSQL** المتوافقة تمامًا بنسبة 100% مع SQLite ومصممة خصيصًا لتكامل خارق مع Vercel.

---

## 🛠️ الخطوة 1: إنشاء قاعدة بيانات على Turso

1. قم بتثبيت أداة التحكم الخاصة بـ Turso على جهازك أو سجل عبر موقعهم الإلكتروني [turso.tech](https://turso.tech/):

   ```bash
   # تثبيت أداة Turso CLI على Windows (عبر PowerShell)
   irm https://get.turso.tech/install.ps1 | iex
   ```

2. قم بتسجيل الدخول:

   ```bash
   turso auth login
   ```

3. قم بإنشاء قاعدة بيانات جديدة باسم `factory-hub`:

   ```bash
   turso db create factory-hub
   ```

4. احصل على **عنوان الاتصال (URL)** الخاص بقاعدة البيانات:

   ```bash
   turso db show factory-hub --show-urls
   # ستحصل على عنوان يبدأ بـ: libsql://factory-hub-username.turso.io
   ```

5. قم بإنشاء **توكن المصادقة (Auth Token)** لحماية الاتصال:

   ```bash
   turso db tokens create factory-hub
   # انسخ التوكن الطويل الذي سيظهر لك
   ```

---

## 🚀 الخطوة 2: إنشاء الجداول وتغذية البيانات (Migration & Seeding)

لقد قمنا بتحديث محرك قاعدة البيانات بالكامل ليدعم متغيرات Turso السحابية تلقائيًا. لرفع الجداول والبيانات من جهازك المحلي مباشرة إلى السحاب:

1. افتح الملف `.env` في جهازك (أو قم بإنشائه في جذر المشروع) واضبط القيم كالتالي:

   ```env
   LIBSQL_URL=libsql://factory-hub-yourusername.turso.io
   LIBSQL_AUTH_TOKEN=your_copied_auth_token_here
   ```

2. قم بتشغيل الترحيلات لإنشاء الجداول في السحاب:

   ```bash
   pnpm --filter @workspace/db run migrate
   ```

3. قم بتغذية قاعدة البيانات السحابية بالبيانات الأولية (Seed):

   ```bash
   pnpm --filter @workspace/db exec tsx src/seed.ts
   ```

بمجرد اكتمال الأمرين، ستكون قاعدة البيانات السحابية جاهزة تمامًا وممتلئة بالبيانات!

---

## 🌐 الخطوة 3: ربط قاعدة البيانات مع Vercel

الآن، يجب عليك ضبط متغيرات البيئة في لوحة تحكم Vercel الخاصة بمشروعك:

1. اذهب إلى **Vercel Dashboard** -> اختر مشروعك -> **Settings** -> **Environment Variables**.
2. قم بإضافة المتغيرات التالية:

| Key | Value | Description |
| :--- | :--- | :--- |
| `LIBSQL_URL` | `libsql://factory-hub-yourusername.turso.io` | رابط قاعدة بيانات Turso السحابية |
| `LIBSQL_AUTH_TOKEN` | `your-turso-auth-token` | رمز المصادقة الخاص بقاعدة البيانات |
| `FDH_API_UPSTREAM` | `https://your-backend-api.railway.app` | رابط الخادم الخلفي (Express API) في حال استخدامه |

---

## ⚡ الخطوة 4: حل مشكلة الشاشة البيضاء (Blank Screen Fix)

لقد قمنا أيضًا بحل وتحديث مسارات التوجيه (Routing & Rewrites) في ملف `vercel.json` لضمان عدم حدوث أي مشكلة شاشة بيضاء بعد الرفع، من خلال استبعاد روابط الـ API والـ Assets بشكل صحيح ودقيق.

تأكد من تحديث الكود الخاص بك ودفعه (git push) إلى Vercel ليقوم بالبناء التلقائي الجديد بنجاح مئة بالمئة!

---

## 💎 ميزات هذا الهيكل السحابي

- **سرعة فائقة (Edge-ready):** قاعدة بيانات Turso موزعة عالميًا وقريبة جدًا من سيرفرات Vercel.
- **تزامن كامل:** جميع المستخدمين يشاهدون تحديثات لوحة التحكم في نفس اللحظة.
- **أمان عالٍ:** الاتصالات محمية تمامًا عبر توكن مصادقة مشفر ومحدد الصلاحية.
