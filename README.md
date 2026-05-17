# مصنع البيانات — نظام إبداع (ENCID Factory Data Hub)

مستودع **pnpm workspaces** لإدارة مصنعين (معدني وخشبي): أوامر عمل، مراحل إنتاج، مشاريع مشتركة، تخطيط، تحليلات، واستيراد/تصدير. الواجهة **RTL** بالعربية مع دعم مصطلحات إنجليزية حيث يلزم في الكود.

## البنية السريعة

| المكوّن | المسار | الوصف |
|--------|--------|--------|
| **واجهة الإنتاج الموحّدة** | `apps/web` | React 19 + Vite + Wouter + i18n/RTL (يشمل شاشات `factory-app` المدمجة تحت `src/factory`) |
| واجهة legacy (مهملة) | `artifacts/factory-app` | نُقلت ميزاتها إلى `apps/web` — لا تُستخدم للإنتاج |
| الـ API | `artifacts/api-server` | Express 5، طبقة controllers ← services، اتصال عبر `@workspace/db` |
| قاعدة البيانات | `lib/db` | **Drizzle ORM** + **SQLite عبر LibSQL** (`@libsql/client`) |
| العقد API | `lib/api-spec`، `lib/api-zod`، `lib/api-client-react` | OpenAPI + Zod + React Query (Orval) |

تفاصيل أعمق: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) و [docs/DATABASE.md](docs/DATABASE.md).

## المتطلبات

- Node.js 24+ (متوافق مع إعداد Replit في [.replit](.replit))
- [pnpm](https://pnpm.io/)

## إعداد البيئة

1. انسخ المثال وعدّل القيم:

```bash
cp .env.example .env
```

2. المتغيرات الأساسية (انظر [.env.example](.env.example)):

- **`LIBSQL_URL`** أو **`SQLITE_FILE`** — موقع قاعدة SQLite (افتراضيًا ملف `local.db` في جذر المستودع إن لم تُضبط).
- **`PORT`** — مطلوب لتشغيل **كلٍ من** الـ API وواجهة Vite.
- **`VITE_API_PROXY_TARGET`** — (اختياري) بروكسي Vite لـ `/api` أثناء التطوير؛ الافتراضي `http://127.0.0.1:8787`.

## أوامر التشغيل اليومية

من جذر المستودع:

```bash
pnpm install
```

**تشغيل الـ API** (يستمع على `PORT`؛ الافتراضي **8787** إن لم تُضبط `PORT`):

```bash
pnpm --filter @workspace/api-server run dev
```

**تشغيل الواجهة الموحّدة:**

```bash
pnpm --filter web run dev
```

يفتح عادةً على **http://localhost:5173**. يوجّه [apps/web/vite.config.ts](apps/web/vite.config.ts) طلبات `/api` إلى **`VITE_API_PROXY_TARGET`** (افتراضيًا **http://127.0.0.1:8787**). شغّل الـ API على نفس المنفذ أو غيّر المتغير.

مصفوفة دمج المسارات: [docs/FACTORY_WEB_MERGE_PARITY.md](docs/FACTORY_WEB_MERGE_PARITY.md).

**توليد أنواع العميل من OpenAPI:**

```bash
pnpm --filter @workspace/api-spec run codegen
```

**مخطط قاعدة البيانات (Drizzle Kit):**

```bash
pnpm --filter @workspace/db run generate
pnpm --filter @workspace/db run push
```

**الترحيلات SQL (عند وجود مجلد `lib/db/drizzle`):**

```bash
pnpm --filter @workspace/db run migrate
```

**سكربت ETL من Postgres إلى SQLite/LibSQL:**

```bash
# جاف: يعرض أعداد الصفوف فقط (لا يكتب)
$env:SOURCE_DATABASE_URL="postgresql://..."   # PowerShell
pnpm --filter @workspace/scripts run etl:pg-to-libsql

# تنفيذ فعلي بعد التأكد من المخطط والنسخ الاحتياطي
$env:ETL_APPLY="1"
# اختياري — يفرغ جداول الهدف المدعومة قبل الإدخال (خطير)
# $env:ETL_WIPE_SQLITE="1"
pnpm --filter @workspace/scripts run etl:pg-to-libsql
```

المتغيرات: `SOURCE_DATABASE_URL` (مصدر Postgres)، `ETL_APPLY`، `ETL_WIPE_SQLITE`، وهدف الكتابة عبر `LIBSQL_URL` / `SQLITE_FILE` (انظر [.env.example](.env.example) و [docs/DATABASE.md](docs/DATABASE.md)).

## التحقق من الأنواع (الجذر)

```bash
pnpm run typecheck
```

## استقرار العمل والدمج (قرار موصى به)

- **الاستقرار أولاً:** اجعل الفرع الحالي يمرّ بـ `pnpm run typecheck` ثم قسّم التغييرات إلى طلبات سحب صغيرة (API، قاعدة بيانات، واجهة) بدل دفعة واحدة ضخمة.
- **استراتيجية قاعدة البيانات:** المصدر المعتمد للتطبيق هو **SQLite/LibSQL** محليًا؛ أي Postgres سابق يُعالَج عبر [docs/rfc-libsql-migration.md](docs/rfc-libsql-migration.md) وسكربت [ETL](#مسار-التوسع-قاعدة-البيانات) عند الحاجة فقط.
- **توليد العقود:** بعد تغييرات الـ API، شغّل `pnpm --filter @workspace/api-spec run codegen` قبل الدمج إذا تأثرت واجهات العميل.

## نشر Replit

إعدادات المنفذ والوحدات: [.replit](.replit). ملخص قديم موجّه للمطورين: [replit.md](replit.md).

## مسار التوسع (قاعدة بيانات)

للانتقال من Postgres/SaaS إلى ملف محلي ثم Turso لاحقًا، راجع [docs/rfc-libsql-migration.md](docs/rfc-libsql-migration.md).

## الترخيص

MIT (انظر [package.json](package.json)).
