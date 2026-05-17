---
name: Plans completion roadmap
overview: "استكمال ما تبقّى من خطط المستودع بترتيب تنفيذ يقلّل الازدواجية: أولاً إغلاق فجوات **Local API sync** (واجهة الأقسام، المعدّن، اتساق المرجع، seed)، ثم **مصادقة وRBAC** على الخادم والويب، ثم **نطاق مصنع/قسم**، ثم **تدقيق كامل + واجهة**، وأخيراً **مقاييس أداء**. مرتبطة بـ [`local_api_sync_a2e2ca16.plan.md`](local_api_sync_a2e2ca16.plan.md) و[`permissions-audit-performance_77343595.plan.md`](permissions-audit-performance_77343595.plan.md)."
todos:
  - id: meta-reconcile-local-plan
    content: مراجعة [`local_api_sync_a2e2ca16.plan.md`](local_api_sync_a2e2ca16.plan.md) وتحديث حالة todos لتطابق الكود (schema hub، routes، bridge، openapi، vite، hooks)؛ الإبقاء على ما تبقّى حقيقياً معلّقاً فقط
    status: completed
  - id: local-departments-ui
    content: مسار `/departments` + ربط [Sidebar.tsx](apps/web/src/components/layout/Sidebar.tsx)؛ عرض أقسام الخشب/المعدن من fixtures/Snapshot المرجع مع أعداد المهام والموظفين كما في خطة الأقسام
    status: completed
  - id: local-dashboard-reference
    content: توحيد مصدر المرجع في [Dashboard.tsx](apps/web/src/pages/Dashboard.tsx) والشاشات ذات الصلة (hub reference أولاً، fixtures عند الفشل) بحيث لا تبقى بيانات سعة/تعيينات «ثابتة فقط» دون مسار واضح
    status: completed
  - id: local-metal-web
    content: قرار صريح لواجهة المعدّن؛ تنفيذ minimal لـ placeholder تحت مسار أوامر المعدّن — إما `GET /api/metal/orders` مباشرة أو تمهيد `fh_metal_*` لاحقاً مع توثيق في [docs/legacy-adapter-factory-hub.md](docs/legacy-adapter-factory-hub.md)
    status: completed
  - id: local-seed-env
    content: التحقق من `POST /api/factory-hub/seed` والـ fixtures؛ إكمال [artifacts/api-server/.env.example](artifacts/api-server/.env.example) وتوثيق `FH_SYNC_WOODEN` و`FH_ALLOW_SEED`
    status: completed
  - id: local-routing-translator-followup
    content: (مستقبلي/فرعي) محوّل routing_progress ثماني المراحل ↔ مراحل wooden الأربع — إما issue منفصل أو قسم في legacy-adapter؛ لا يعطل التسليم الرئيسي
    status: completed
  - id: perm-db-auth-seed
    content: ترحيل جداول [authAudit.ts](lib/db/src/schema/authAudit.ts) على بيئات التطوير + seed أدوار/صلاحيات + مستخدم bootstrap من ENV (يتوافق مع todo schema-auth-rbac في خطة الصلاحيات)
    status: completed
  - id: perm-api-jwt-middleware
    content: POST login + GET me + JWT؛ وسيط requireAuth/requirePermission على مسارات الكتابة الحرجة في [artifacts/api-server](artifacts/api-server) (api-auth-middleware)
    status: completed
  - id: perm-web-guard-client
    content: صفحة تسجيل دخول وسياق مستخدم؛ تمرير Bearer في [apps/web/src/lib/api](apps/web/src/lib/api)؛ إخفاء/تعطيل إجراءات الكتابة حسب /api/auth/me (web-guard-routes)
    status: completed
  - id: perm-scope-queries-directory
    content: نطاق صفّي — السعة والموظفين ولوحات الأداء المشتقة (scope-queries-directory في خطة الصلاحيات؛ dataScopeFilter + req.auth)
    status: completed
  - id: perm-scope-queries-production-hub
    content: نطاق صفّي — أوامر خشب/معدن ومصنع البيانات JSON (حقول factory/department + خدمات wooden/metal/factoryHub)
    status: completed
  - id: perm-audit-coverage-ui
    content: توسيع التسجيل عبر [audit.service.ts](artifacts/api-server/src/services/audit.service.ts)؛ GET /api/audit-events؛ صفحة `/audit-log` بصلاحية مراجعة (audit-table-hook)
    status: completed
  - id: perm-performance-metrics
    content: تعريف مقاييس من مراحل الإنتاج؛ GET performance؛ صفحات `/performance/departments` و`/performance/people` مع عزل النطاق (performance-metrics)
    status: completed
  - id: meta-ebdaa-doc-nit
    content: (اختياري) مزامنة نص [ebdaa_data_integration_plan_30980b69.plan.md](ebdaa_data_integration_plan_30980b69.plan.md) مع الواقع إن تغيّر وضع `/planning` بعد اكتمال todos
    status: completed
  - id: ops-drizzle-migrate-scope-columns
    content: (تم) ترحيل [0006](lib/db/drizzle/0006_production_row_scope.sql) و[0007](lib/db/drizzle/0007_metal_stage_log_sheet_shape.sql) + إصلاح تلقائي لـ `__drizzle_migrations` الفارغ عبر [migrationRepair.ts](lib/db/src/migrationRepair.ts)
    status: completed
isProject: false
---

# خطة استكمال الخطط — تدفّق تنفيذ منطقي

تجمع هذه الخطة البنود المتبقية من:

- [Local API sync](local_api_sync_a2e2ca16.plan.md) (الـ YAML في ذلك الملف يعكس الآن تنفيذ المسارات والواجهة والـ todos المكتملة).
- [permissions-audit-performance](permissions-audit-performance_77343595.plan.md) — نطاق الصفوف على أوامر الإنتاج وصفوف hub منفَّذ عبر `factory_id` / `department_id`.

خطة [Ebdaa](ebdaa_data_integration_plan_30980b69.plan.md) مكتملة بحسب الـ todos؛ يبقى فقط ضبط توثيقي اختياري.

## التدفّق المنطقي (ترتيب التنفيذ)

```mermaid
flowchart TB
  subgraph phaseA [المرحلة أ — إغلاق Local API sync]
    R[meta-reconcile-local-plan]
    D[local-departments-ui]
    REF[local-dashboard-reference]
    M[local-metal-web]
    S[local-seed-env]
    R --> D
    D --> REF
    REF --> M
    M --> S
  end
  subgraph phaseB [المرحلة ب — مصادقة وRBAC]
    DB[perm-db-auth-seed]
    API[perm-api-jwt-middleware]
    WEB[perm-web-guard-client]
    DB --> API
    API --> WEB
  end
  subgraph phaseC [المرحلة ج — نطاق البيانات]
    SCdir[perm-scope-queries-directory]
    SCph[perm-scope-queries-production-hub]
    SCdir -.-> SCph
  end
  subgraph phaseD [المرحلة د — تدقيق]
    AU[perm-audit-coverage-ui]
  end
  subgraph phaseE [المرحلة هـ — أداء]
    PF[perm-performance-metrics]
  end
  S --> DB
  WEB --> SCdir
  SCdir --> AU
  AU --> PF
  subgraph parallel [متوازٍ / مستقبلي]
    RT[local-routing-translator-followup]
    EB[meta-ebdaa-doc-nit]
  end
```



**لماذا هذا الترتيب؟**

1. **مرحلة أ** لا تعتمد على المستخدمين؛ تكمل تجربة الويب والـ hub للجميع (بما فيها زوار التطوير).
2. **مرحلة ب** تضيف هوية حقيقية؛ بدونها لا معنى لعزل النطاق أو لتقارير «من فعل ماذا» بشكل موثوق.
3. **مرحلة ج** تبني على `req.auth`: الجزء الدليلي منجز؛ عزل أوامر الإنتاج وصفوف hub يفرض أعمدة مصنع/قسم وتصفية في الخدمات.
4. **مرحلة د** تستفيد من وجود مستخدم ومسمى فاعل في السجلات؛ يمكن بدء تسجيل جزئي أبكر لكن الواجهة والفلترة تكتمل بعد تثبيت الصلاحيات.
5. **مرحلة هـ** تحتاج تعريفات مقاييس وربما حقول إسناد؛ تُؤجَّل حتى لا تُعاد كتابة الاستعلامات بعد تغيير نطاق العرض.

## مرحلة أ — تفاصيل سريعة


| Todo                        | مرجع تقني                                                                                                                                                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `local-departments-ui`      | [Sidebar.tsx](apps/web/src/components/layout/Sidebar.tsx)، [App.tsx](apps/web/src/App.tsx)، [factoryCapacity.ts](apps/web/src/data/fixtures/factoryCapacity.ts)، [employeeAssignments.ts](apps/web/src/data/fixtures/employeeAssignments.ts) |
| `local-dashboard-reference` | [Dashboard.tsx](apps/web/src/pages/Dashboard.tsx)، hooks [useFactoryHub.ts](apps/web/src/lib/api/hooks/useFactoryHub.ts)                                                                                                                     |
| `local-metal-web`           | [routes/metal.ts](artifacts/api-server/src/routes/metal.ts)، placeholder الويب تحت أوامر المعدّن                                                                                                                                             |
| `local-seed-env`            | [factoryHub routes](artifacts/api-server/src/routes/factoryHub.ts)، `.env.example`                                                                                                                                                           |


## مرحلة ب–هـ — مواءمة مع خطة الصلاحيات


| هذه الخطة                            | يقابله في [permissions-audit-performance](permissions-audit-performance_77343595.plan.md) |
| ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `perm-db-auth-seed`                   | `schema-auth-rbac`                                                                        |
| `perm-api-jwt-middleware`             | `api-auth-middleware`                                                                     |
| `perm-web-guard-client`               | `web-guard-routes`                                                                        |
| `perm-scope-queries-directory`       | `scope-queries-directory`                                                                 |
| `perm-scope-queries-production-hub` | `scope-queries-production-hub`                                                            |
| `perm-audit-coverage-ui`              | `audit-table-hook`                                                                        |
| `perm-performance-metrics`            | `performance-metrics`                                                                     |


## مهام مستقبلية لا تعوق التسليم

- `**local-routing-translator-followup`:** محوّل كامل بين `routing_progress` ومراحل `wooden_production_stages` — مذكور في [legacy-adapter-factory-hub.md](docs/legacy-adapter-factory-hub.md) كعمل لاحق.
- `**meta-ebdaa-doc-nit`:** تحديث فقرات قديمة داخل ملف Ebdaa إن لزم.

## تعريف الجاهزية

- **Local sync «مكتمل عملياً»:** أقسام في القائمة ومسار واضح، معدّن له مسار ويب محدد، مرجع اللوحة متسق، seed و env موثّقة، وملف local_api_sync محدّث الانعكاس.
- **صلاحيات «مكتملة عملياً» (بحدود التعريف أعلاه):** دخول اختياري عبر JWT، حماية المسارات بالمفاتيح، نطاق صفّي على دليل السعة والموظفين ولأنشطة مقاييس الأفراد وسجل تدقيق ولوحات أداء وأوامر خشب/معدن وصفوف hub عند تعبئة مصنع/قسم.

بعد إنجاز كل todo، حدّث `status` هنا إلى `completed` (أو استخدم أداة المشروع في Cursor إن كانت تدير الحالة تلقائياً).