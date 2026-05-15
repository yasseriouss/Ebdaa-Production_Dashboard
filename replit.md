# Replit — إعدادات التشغيل السريعة

التوثيق الكامل للمشروع (عربي): [README.md](README.md) — البنية: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — قاعدة البيانات: [docs/DATABASE.md](docs/DATABASE.md).

## ما يخص Replit فقط

- **الوحدات والمنافذ:** راجع [.replit](.replit) (مثلاً Node 24، تعيينات المنافذ 3000 / 8080 / 8081).
- **وكيل الذكاء:** `stack = "PNPM_WORKSPACE"` في `.replit`.
- **متغيرات البيئة:** استخدم نفس أسماء [.env.example](.env.example) في أسرار Replit (`LIBSQL_URL` أو `SQLITE_FILE`، و`PORT`، و`BASE_PATH` لواجهة Vite).

## ملاحظة عن PostgreSQL في `.replit`

قد يظل وحدة `postgresql-16` مفعّلة للتوافق أو لأدوات جانبية؛ **مسار التطبيق الحالي** لقاعدة البيانات هو **SQLite عبر LibSQL** في [lib/db](lib/db). أزل الوحدة من `.replit` فقط إذا تأكدت أن لا شيء يعتمد عليها.

## تصميم الواجهة (مرجعي)

- اتجاه RTL، ثيم داكن، خط Tajawal، shadcn/ui.
