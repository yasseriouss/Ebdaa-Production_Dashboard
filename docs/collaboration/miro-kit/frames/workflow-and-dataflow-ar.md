# تسلسل سير العمل وتدفّق البيانات — Factory Data Hub

مرجع نصّي يكمّل مخطّط **ERD** وجدول [مدلولات العلاقات](../tables/erd-relationship-legend-ar.md). للرسم الشامل انظر [`diagrams/system/system-end-to-end-flowchart.mermaid`](../diagrams/system/system-end-to-end-flowchart.mermaid).

---

## 1. طبقات النظام (من الأعلى للأسفل)

| الطبقة | المكوّن | المسار / الحزمة |
|--------|---------|------------------|
| عرض | SPA React + Wouter | `apps/web` (موحّد مع صفحات `factory/pages`) |
| بروكسي تطوير | Vite → `/api` | `apps/web/vite.config.ts` |
| API | Express + موجّهات | `artifacts/api-server` |
| منطق | controllers → services | `artifacts/api-server/src/{controllers,services}` |
| بيانات | Drizzle + LibSQL/SQLite | `@workspace/db` → `lib/db` |

---

## 2. تسلسل سير عمل تشغيلي (يوم المصنع)

الترتيب أدناه يصف **مسار القيمة** من إدخال البيانات إلى التقارير؛ ليس بالضرورة ترتيب نقر المستخدم في الواجهة.

### أ — إعداد المرجع والهيكل

1. **بذرة أو استيراد** — `POST /api/factory-hub/seed` (تطوير، `FH_ALLOW_SEED`) أو استيراد Excel عبر `/api/import`.
2. **سعة وموظفون** — جداول `factories`, `departments`, `tasks`, `employees` (+ لقطات `fh_reference_snapshots` للوحة).
3. **صلاحيات** — `auth_users`, `auth_roles`, `auth_permissions`, `auth_user_roles` (نطاق `factory_id` / `department_id` على العضوية).

### ب — أوامر الإنتاج

4. **أوامر خشب (معياري)** — CRUD على `wooden_work_orders` عبر `/api/wooden/*`؛ مراحل على `wooden_production_stages`.
5. **أوامر معدن (معياري)** — CRUD على `metal_work_orders` عبر `/api/metal/*`؛ مراحل `metal_production_stages` + يوميات `metal_stage_log`.
6. **لوحة Hub (JSON)** — قراءة/كتابة `fh_wood_work_orders.payload` عبر `/api/factory-hub/*`؛ مصدر الحقيقة للوحة الحالية غالبًا هنا.
7. **جسر اختياري** — عند `FH_SYNC_WOODEN=true`: بعد `PUT` على Hub يُنسَخ جزء من الحقول إلى `wooden_work_orders` (بدون ترجمة كاملة لثماني مراحل Hub ↔ أربع مراحل legacy — انظر `docs/legacy-adapter-factory-hub.md`).

### ج — تشغيل يومي ومتابعة

8. **إنتاج يومي** — واجهات `/daily/wood` و `/daily/metal` تستهلك نفس الـ API (تحديث كميات/مراحل).
9. **مركز الإنتاج** — `/production` يجمع أوامر/مراحل حسب المنتج.
10. **ملاحظات كيانات** — `entity_notes` عبر مسارات الملاحظات (نوع كيان + معرّف).

### د — حوكمة وتقارير

11. **كل طلب تعديل HTTP** — يمر `optionalAuthMiddleware` ثم `mutationAuditMiddleware` → صف في `audit_events`.
12. **قراءات محمية** — `requirePermission` على الكتابات؛ `dataScopeFilter` على دليل السعة/الموظفين/أداء (حيث مُفعّل).
13. **تحليلات وتخطيط** — `/analytics`, `/planning`, `/performance/*` تقرأ من الخدمات المجمّعة وليس مباشرة من المتصفح.

---

## 3. تدفّق بيانات طلب واحد (قراءة)

```
المتصفح (React Query / fetch)
  → GET /api/...  (+ Bearer اختياري)
  → optionalAuthMiddleware (تعريف هوية ضيف أو مستخدم)
  → router → controller → service
  → Drizzle SELECT (+ dataScopeFilter إن وُجد)
  → SQLite (LibSQL file:)
  → JSON response → عرض في الصفحة
```

## 4. تدفّق بيانات طلب واحد (كتابة)

```
المتصفح
  → POST|PUT|PATCH|DELETE /api/...
  → optionalAuth → mutationAudit (يُسجّل لاحقًا في audit_events)
  → requirePermission (على المسارات المحمية)
  → service (تحقق Zod / قواعد دومين)
  → Drizzle INSERT|UPDATE (+ soft delete حيث deleted_at)
  → إن FH_SYNC_WOODEN: mirror اختياري إلى wooden_work_orders
  → استجابة + إبطال cache في الواجهة
```

## 5. مساران للبيانات (خشب) — مهم للتكامل

| المسار | التخزين | متى يُستخدم |
|--------|---------|-------------|
| **Hub أولًا** | `fh_wood_work_orders.payload` | لوحة التحكم، تعديلات JSON كاملة، تقدّم 8 مراحل في الواجهة |
| **معياري** | `wooden_work_orders` + `wooden_production_stages` | API legacy، استيراد Excel، تقارير مبنية على جداول |
| **جسر** | Hub → معياري | تلقائي عند `FH_SYNC_WOODEN` (حقول كمية/عميل/تاريخ؛ ليس كل المراحل) |

المعدن اليوم: المعياري (`metal_*`) هو المسار الرئيسي؛ Hub JSON للمعدن غير مكافئ بعد.

## 6. تسلسل واجهة المستخدم (جلسة نموذجية)

1. فتح التطبيق → `GET /api/auth/effective-permissions` → بناء Sidebar.
2. لوحة `/` — بيانات Hub + إحصائيات من `/api/dashboard` ومراجع `fh_reference_snapshots`.
3. انتقال إلى `/orders/wood` أو `/orders/metal` — قوائم من `/api/wooden` أو `/api/metal`.
4. تفاصيل أمر — تحديث مراحل → كتابة API → تدقيق → تحديث شريط التقدّم في الواجهة.
5. `/audit-log` — قراءة `audit_events` بصلاحية `audit:view`.

## 7. روابط مرئية في المستودع

| الموضوع | ملف |
|---------|-----|
| بنية عامة | `docs/ARCHITECTURE.md` |
| قاعدة البيانات | `docs/DATABASE.md` |
| محوّل Hub | `docs/legacy-adapter-factory-hub.md` |
| ERD كامل | `diagrams/data/database-er-drizzle-full.mermaid` + Miro **full ERD** |
| مسار API | `diagrams/api/http-mounts.mermaid` |
| وسيط أمان | `diagrams/api/middleware-before-routes.mermaid` |
| سيناريوهات عميل | `frames/business-scenarios-ar.md` |
