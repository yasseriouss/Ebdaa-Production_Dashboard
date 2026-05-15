# قاعدة البيانات (LibSQL + SQLite + Drizzle)

## 1. المحرك والعميل

- **المحرك:** SQLite عبر **LibSQL** باستخدام الحزمة **`@libsql/client`**.
- **ORM:** **Drizzle** (`drizzle-orm` + `drizzle-kit` + `drizzle-zod` حيث يُستخدم).

لا يُفترض حاليًا تشغيل الإنتاج على PostgreSQL لمسار التطبيق الرئيسي؛ أي ترحيل قادم من Neon/Supabase يكون عبر أدوات منفصلة (راجع [rfc-libsql-migration.md](rfc-libsql-migration.md)).

## 2. ضبط عنوان الاتصال

يُحلّ العنوان في [lib/db/src/libsql-url.ts](../lib/db/src/libsql-url.ts):

| المتغير | المعنى |
|---------|--------|
| **`LIBSQL_URL`** | عنوان كامل لـ `@libsql/client` (مثل `file:...` أو لاحقًا `libsql://...` لـ Turso). |
| **`SQLITE_FILE`** | مسار ملف على القرص (نسبي لمجلد عمل العملية أو مطلق)؛ يُحوَّل تلقائيًا إلى `file:` URL. |
| *(بدون المتغيرين)* | الافتراضي: ملف **`local.db`** في جذر المستودع (بجانب `package.json` الجذري). |

مثال `.env`:

```env
LIBSQL_URL=file:C:/Data/Factory-Data-Hub/local.db
```

أو:

```env
SQLITE_FILE=./local.db
```

## 3. وحدات المخطط (`lib/db/src/schema`)

- أوامر العمل والمراحل: `metalWorkOrders`، `metalProductionStages`، `metalStageLog`، `woodenWorkOrders`، `woodenProductionStages` (مع حقول `deleted_at` للحذف المنطقي حيث يُطبَّق).
- المشاريع المشتركة: `sharedProjects`.
- السعة والهيكل: `factoryCapacity` (مصانع، أقسام، مهام).
- الموظفون: `employees`.

الفهرس الموحّد للتصدير: [lib/db/src/schema/index.ts](../lib/db/src/schema/index.ts).

## 4. أوامر Drizzle الشائعة

من جذر المستودع:

```bash
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run migrate
```

- **`generate`:** يولّد ملفات SQL تحت `lib/db/drizzle/`.
- **`push`:** يدفع المخطط مباشرة إلى قاعدة الملف (مناسب للتطوير السريع).
- **`migrate`:** يطبّق مجلد الهجرات عبر [lib/db/src/migrate.ts](../lib/db/src/migrate.ts).

## 5. البذرة (Seed)

- `src/seed.ts` — بيانات أولية للأوامر والمراحل.
- `src/seedAll.ts` / `src/seedCapacity.ts` — حسب الحاجة للسعة والبيانات الموسّعة.

تشغيل مثال:

```bash
pnpm --filter @workspace/db exec tsx src/seed.ts
```

## 6. وضع WAL والنسخ الاحتياطي

### وضع WAL (`journal_mode`)

SQLite يستخدم افتراضيًا غالبًا وضع **rollback journal**. تفعيل **WAL** (Write-Ahead Logging) يقلّل احتمال أن تُحجب القراءات أثناء كتابة طويلة:

- يمكن تشغيل `PRAGMA journal_mode=WAL;` مرة بعد فتح الاتصال (مثلاً من سكربت صيانة أو عند بدء التطبيق إن رغبت).
- لا يزال هناك **كاتب واحد** فعليًا؛ WAL يحسّن التداخل مع القراءات وليس بديلاً عن عدة كتابات متوازية على نفس الملف من عدة عمليات Node.

### نسخ `local.db` بأمان

- تجنّب نسخ الملف أثناء ذروة الكتابة دون تنسيق؛ قد تحصل على نسخة **ناقصة**.
- خيارات معقولة: إيقاف الخدمة لحظة النسخ، أو استخدام أمر النسخ الاحتياطي المدمج في SQLite (`VACUUM INTO` / `.backup` عبر أداة CLI)، أو نسخ من قراءة متسقة بعد إغلاق اتصالات الكتابة.
- على استضافة مشتركة (مثل DreamHost): ضع الملف خارج جذر الويب العام وتحقق من الصلاحيات.

## 7. تحذيرات أخرى

- **عدة عمليات:** تجنّب كتابتين متزامنتين من عمليتين Node على **نفس الملف** دون تنسيق (رسائل `database is locked`).
- **ETL من Postgres:** سكربت جاهز في [scripts/src/pg-to-libsql-etl.ts](../scripts/src/pg-to-libsql-etl.ts). يقرأ من `SOURCE_DATABASE_URL` ويكتب إلى قاعدة الهدف المعرفة بـ `LIBSQL_URL` / `SQLITE_FILE`. بدون `ETL_APPLY=1` يعمل **جافًا** (أعداد فقط). `ETL_WIPE_SQLITE=1` مع `ETL_APPLY` يفرغ الجداول المدعومة قبل الإدخال — استخدمه بحذر بعد نسخ احتياطي. التشغيل: `pnpm --filter @workspace/scripts run etl:pg-to-libsql`.
