# RFC تقني: انتقال Postgres (Supabase / Neon) → LibSQL + SQLite

## ملخص تنفيذي

**LibSQL** يوفّر نموذج SQLite محليًا (زمن استجابة منخفض دون شبكة إلزامية) مع مسار واضح لاحقًا إلى **Turso** (`libsql://`) دون إعادة كتابة منطق Drizzle بالكامل. في هذا المستودع، مسار التطبيق الرئيسي يستخدم **Drizzle + `@libsql/client`** بالفعل؛ هذا المستند يصف أيضًا **هجرة بيانات** إن كان المصدر لا يزال PostgreSQL.

## اختيار ORM

**Drizzle** مفضّل على Prisma لهذا المشروع: تكامل مباشر مع LibSQL، حزمة أخف، والمشروع مبني أصلًا على Drizzle و`drizzle-kit`.

## تحويل المخطط (Postgres → SQLite)

1. تصدير مخطط Postgres (`pg_dump --schema-only` أو من لوحة المزوّد).
2. إعادة تعريف الجداول بـ `sqliteTable` مع مراعاة:
   - **ENUM** → `text` + تحقق في التطبيق أو `CHECK`.
   - **JSONB** → `text` (JSON) + تحقق؛ أو JSON1 عند توفر الامتداد.
   - **TIMESTAMPTZ** → نص ISO أو Unix integer.
   - **NUMERIC** الدقيق → `text` أو `real` حسب سياسة الفريق.
3. الحفاظ على **ترتيب FK** عند إنشاء الجداول والبيانات.

## نقل البيانات (ETL)

- اقرأ من `SOURCE_DATABASE_URL` (Postgres) باستخدام عميل `pg`.
- اكتب إلى LibSQL عبر Drizzle بنفس ترتيب الجداول (الآباء قبل الأبناء)، أو استخدم معاملة مع `PRAGMA foreign_keys=OFF` بحذر شديد.
- هيكل أولي قابل للتوسعة: [scripts/src/pg-to-libsql-etl.ts](../scripts/src/pg-to-libsql-etl.ts) (`pnpm --filter @workspace/scripts run etl:pg-to-libsql`).

## التوسع (Turso / Edge)

استبدال `file:` بـ عنوان **Turso** في `LIBSQL_URL` مع الحفاظ على استعلامات Drizzle؛ يمكن لاحقًا استخدام **embedded replicas** للمزامنة مع الحافة دون إعادة بناء طبقة الخدمات.

## تحذيرات

- **WAL** لتقليل الاختناقات بين القراءة والكتابة.
- **نسخ احتياطي آمن** للملف أثناء عدم الكتابة أو عبر API النسخ الرسمي.
- **DreamHost / VPS:** مسار ملف دائم وليس مجلدًا مؤقتًا.

للإعدادات العملية في هذا المشروع، راجع [DATABASE.md](DATABASE.md).
