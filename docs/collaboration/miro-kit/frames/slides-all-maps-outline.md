# فهرس المرئيات لكل الخرائط — مرجع جلسة واحدة

استخدم هذا الملف كنقطة نقطة واحدة في حوار الزملاء أو قبل تحضير Presentation Mode في Miro: كل صف أو Frame يمتلك عنوانًا ومكان المصدر تحت المستودع.

## 1. التخطيط والتسليم (`diagrams/planning/`)

| عنوان مقترَح للـ Frame | ملف المصدر |
|-------------------------|-------------|
| خطّة المراحلة أ→هـ مع الموازيات | `execution-roadmap.mermaid` |
| ديون وتفرعات لا تعطل الأساسى | `parallel-and-debt.mermaid` |

## 2. الواجهة والمنتج (`diagrams/ui/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| خريطة مسارات التطبيق الحالية | `routes-ia.mermaid` |
| خريطة موقع مجمّعة حسب مجموعات القائمة | `site-map-groups.mermaid` |
| ربط Sidebar بالصلاحيات المطلوبة لكل مسار | `route-permissions-flow.mermaid` |
| مسار العميل: بوابات القائمة والصلاحيات | `customer-journey-sidebar-gates.mermaid` |
| مسار العميل: طلبات API والتدقيق والنطاق | `customer-journey-api-paths.mermaid` |
| لماذا كلمتا apps/web وfactory-app معًا في الشرح | `dual-frontends-context.mermaid` |

## 3. واجهة الـ API (`diagrams/api/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| شجرة ما تحت `/api` بعد الجذر | `http-mounts.mermaid` |
| سلسلة الوسيط قبل المسارات | `middleware-before-routes.mermaid` |

## 4. البيانات (`diagrams/data/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| كتل الدومين الأساسية | `domain-entities.mermaid` |
| مصغّر المصادقة والتدقيق والربط الوظيفي | `auth-audit-mini.mermaid` |
| علاقات جداول أساسية (ER يتوافق مع Drizzle) | `database-er-core.mermaid` |
| ER شامل لكل الجداول والأعمدة (تلخّص علاقات؛ التفاصيل في الميرو أو الـschema) | `database-er-drizzle-full.mermaid` |

## 5. الأمان والنطاق (`diagrams/security/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| من JWT إلى RBAC على الطلبات | `auth-jwt-rbac-flow.mermaid` |
| أين يُطبَّق نطاق الصف اليوم وأين لا يُطبَّق بعد | `row-scope-applied-vs-pending.mermaid` |
| تسجيل الطفرات HTTP إلى جدول التدقيق | `mutation-audit-chain.mermaid` |

## 6. التشغيل والتيّار (`diagrams/operations/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| حزم العمل الأساسية في المستودع | `workspace-packages.mermaid` |
| التيّار من المتصفّح إلى SQLite/LibSQL | `request-value-stream.mermaid` |
| تشغيل التطوير وseed والاستيراد/التصدير باختصار | `dev-seed-import-export-overview.mermaid` |

## 7. التكامل المرجعي (`diagrams/integration/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| Hub JSON مقابل جداول معيارية ومتابعة المحوّل | `reference-vs-canonical-wood-metal.mermaid` |

## 8. الجداول القابلة للاستيراد (`tables/`)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| كل todos الخطة الموحّدة مع المرجع التقني | `roadmap-todos.csv` |
| مواءمة بنود roadmap الصلاحيات | `permissions-alignment.csv` |
| مصفوفة مسارات `/api` السريعة | `api-mounts-matrix.csv` |

## 9. اجتماعات محددة القالب

| القالب في Miro | ملف المحتوى النصّي هنا |
|----------------|-------------------------|
| Management Review SAFe | `slide-outline-management-review.md` |
| PI Planning Preparation SAFe | `slide-outline-pi-prep.md` |
| تحسينات نظامية وتشغيلية للـ Stickies | `improvements-for-management-review-stickies.md` |
| سيناريوهات عمل ومسارات عميل (عربي) | `business-scenarios-ar.md` |

## 10. النظام الشامل (علاقات + سير عمل + تدفّق)

| عنوان مقترَح | ملف المصدر |
|----------------|-------------|
| جدول مدلولات علاقات ERD | `tables/erd-relationship-legend-ar.md` |
| تسلسل سير العمل وتدفّق البيانات (نص) | `frames/workflow-and-dataflow-ar.md` |
| فلوشارت شامل للنظام (طبقات + DB) | `diagrams/system/system-end-to-end-flowchart.mermaid` |

## 11. متابعة أتمتة Miro

راجع **`MIRO_MCP_FOLLOWUP.md`** في جذر `miro-kit` للخطوات عندما يكون MCP متاحًا.
