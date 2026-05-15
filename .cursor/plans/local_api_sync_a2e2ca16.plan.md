---
name: Local API sync
overview: تشغيل `artifacts/api-server` على LibSQL محلي (`local.db`) مع مسار `/api/factory-hub/*` لمصنع الويب، وتوسعة الخطة لتشمل **دمج وتنسيقاً تدريجياً مع المسارات المعيارية القائمة** `/api/wooden/*` و`/api/metal/*` (جدول Drizzle ومتحكم الخدمات) عبر محولات ومراحل توحيد، دون قطع المتصلين الحاليين.
todos:
  - id: schema-fh-core
    content: Drizzle؛ جداول factory-hub؛ fh_wood_work_orders (payload JSON)، fh_reference_snapshots؛ جلسات تحليل + مسودة مشروع
    status: completed
  - id: api-routes-hub
    content: REST تحت factory-hub؛ CRUD أوامر خشب؛ مراجع؛ تحليل؛ مسودة مشروع؛ POST seed؛ Zod في api-zod
    status: completed
  - id: legacy-adapter-doc
    content: مستند حقول فقط يصف اختلاف WoodWorkOrder (لوحة الويب) ↔ woodenWorkOrdersTable + المراحل الأربعة؛ ومعدّن ↔ metal_work_orders؛ يحدّد نقاط المحوّل
    status: completed
  - id: bridge-layer-optional
    content: مرحلة B اختيارية؛ وحدة تحويل دوال أو routes شفافة (مزدوج الكتابة أو قراءة من جدول وتجميع لو dashboard) وفق المحوّل
    status: completed
  - id: openapi-backcompat
    content: openapi.yaml؛ إضافة factory-hub + تعليق إهلاك وتوجيه عميل واحد؛ عدم إزالة wooden/metal دوال موجودة من اللوحة حتى الاندماج ينضج
    status: completed
  - id: seed-all-fixtures
    content: تهيئة مراجع وأوامر خشب من fixtures؛ نقطة مهاجرة لمعدّن إن أمكن من مصدر seed الحالي أو صف فارغ
    status: completed
  - id: vite-proxy-scripts
    content: vite proxy `/api`; .env؛ تشغيل موازٍ
    status: completed
  - id: web-shared-api-layer
    content: QueryClientProvider؛ apps/web/src/lib/api؛ hooks لجميع الموارد
    status: completed
  - id: wire-pages
    content: توصيل جميع الشاشات + placeholder المعدّن مستقبلاً إلى استراتيجية واضحة؛ خشب عبر hub أولاً ثم وحدة واحدة للمراجع
    status: completed
  - id: sidebar-departments-hub
    content: إدراج عنصر قائمة جانبية «الأقسام» بحسب المصنع؛ عرض قائمة الموظفيين المعيّنيين بالقسم وأعداد ماكينات/مهام السعة؛ صفحة أو لوحة جانبية للقوائم الطويلة مع ربط لاحق بـ hub reference أو /employees
    status: completed
isProject: false
---

# خطة: API محلي + كل واجهات الويب + **توسعة الدمج مع `/wooden` و`/metal`**

## نطاق المنتج حسب الشاشات (من [App.tsx](apps/web/src/App.tsx))

| المسار | المكوّن | مصدر البيانات اليوم | المطلوب بعد الخطة |
|--------|---------|---------------------|-------------------|
| `/` | [Dashboard.tsx](apps/web/src/pages/Dashboard.tsx) | fixtures | API (hub + مراجع؛ يمكن لاحقاً تغذية من `/metal` summary إن وُجد) |
| `/orders/wood` | [WoodOrders.tsx](apps/web/src/pages/WoodOrders.tsx) | fixture + حالة | **factory-hub** أولاً؛ لاحقاً مزامنة مع **`/wooden`** إن رُغب في جدول واحد للأعمال |
| `/orders/metal` | Placeholder | — | عند البناء؛ استهلاك **`/metal/orders`** الموجود أو عبر hub موحّد بعد المحوّل |
| `/daily/wood` ، `/daily/metal` | [DailyProduction.tsx](apps/web/src/pages/DailyProduction.tsx) | fixtures | خشب من hub؛ معدّن من **`/metal`** أو لقطة مرجعية |
| `/analytics*` | [Analytics.tsx](apps/web/src/pages/Analytics.tsx) | fixtures | مراجع + أوامر من المصدرين حسب الاستراتيجية |
| `/project-analytics` | [ProjectAnalytics.tsx](apps/web/src/pages/ProjectAnalytics.tsx) | fixtures | عبر hub + مراجع |
| `/projects/new` | [NewProject.tsx](apps/web/src/pages/NewProject.tsx) | localStorage | hub |
| `/projects/work-order-analysis` | [WorkOrderAnalysis.tsx](apps/web/src/pages/WorkOrderAnalysis.tsx) | localStorage | hub |

## الجزء أ — `factory-hub` (ما سبق توثيقه)

- مسار منفصل تحت `/api/factory-hub/*` لشكل JSON الذي تتوقعه لوحة **Grand Line** (`WoodWorkOrder`، جلسات التحليل، مراجع، مسودة مشروع).
- تخزين JSON صفّي للكيانات الديناميكية + `fh_reference_bundle(key, payload)` للمراجع.
- يبقى الهدف: **سرعة تطوير محلية** وواجهة واحدة للويب دون إجبار إعادة كتابة كل شاشة على نموذج ERP القديم فوراً.

## الجزء ب — **توسعة الخطة: الربط مع `/api/wooden` و`/api/metal`**

المسارات القائمة في [routes/index.ts](artifacts/api-server/src/routes/index.ts):

- **`/wooden`** — [WoodenService](artifacts/api-server/src/services/wooden.service.ts) على [`wooden_work_orders`](lib/db/src/schema/woodenWorkOrders.ts) + `wooden_production_stages` (4 مراحل عربية، حقول نصية مثل `orderNo`، `qty`، `done`، `rem`).
- **`/metal`** — [MetalController](artifacts/api-server/src/controllers/metal.controller.ts) على `metal_work_orders` + `metal_production_stages` ([routes/metal.ts](artifacts/api-server/src/routes/metal.ts)).

هذان المساران **هما عقد HTTP الحالي** لأي تكامل خارجي أو شاشات أخرى؛ لا يُزالان في المرحلة الأولى.

### لماذا لا نستبدل أحدهما فوراً؟

- نموذج لوحة الويب (`routing_progress` بثماني مراحل، `work_order_id`، كميات رقمية مجمّعة) **لا يطابق صفّاً واحداً** من `wooden_work_orders` دون **محوّل ثنائي الاتجاه**.
- إجبار الواجهة على `orderNo`/`subProject` فقط يعيد كتابة كامل **WoodOrders** و**DailyProduction** و**Analytics** دفعة واحدة.

### استراتيجية مراحل الدمج (مُوصى بها)

| المرحلة | الاسم | ماذا يحدث |
|---------|--------|-----------|
| **1** | **Parallel** | الويب يقرأ/يكتب **`factory-hub`** فقط؛ `/wooden` و`/metal` يستمران كما هما لعملاء آخرين. |
| **2** | **Bridge (اختياري)** | طبقة داخل الخادم: عند `PUT factory-hub/wood-work-orders/:id` يُستدعى أيضاً تحديث منطقي لـ `wooden` (أو العكس) عبر **دوال تحويل** موثّقة في `legacy-adapter-doc`. يُفعّل بعلم بيئة مثل `FH_SYNC_WOODEN=true` لتجنّب مفاجآت الإنتاج. |
| **3** | **Converge** | إما (أ) جدول مصدر واحد مع أعمدة موسّعة + views، أو (ب) الإبقاء على hub كـ **BCF للويب** والـ legacy كـ **Projection** مُحدَّثة بالجسر فقط. |
| **4** | **Contract** | تدريجياً تقارب **`lib/api-spec/openapi.yaml`** بحيث تصف «الشكل المعياري للتصدير» و«شكل الويب» مع روابط، ويُشار إلى إهلاك تدريجي لمسارات مكررة إن اندمجت كلياً. |

```mermaid
flowchart TB
  subgraph web [apps_web]
    P[صفحات]
  end
  subgraph hub_routes [/api_factory_hub]
    FH[خدمات_hub_JSON]
  end
  subgraph legacy_routes [/api_wooden_و_metal]
    W[WoodenService]
    M[MetalService]
  end
  subgraph storage [LibSQL_local_db]
    T1[fh_*_جداول]
    T2[wooden_*_metal_*]
  end
  P --> FH
  FH --> T1
  W --> T2
  M --> T2
  FH -.->|"جسر اختياري المرحلة2"| W
  FH -.->|"مستقبلاً معدّن"| M
```

### محتوى يجب إعداده قبل الجسر (`legacy-adapter-doc`)

1. خريطة حقل بحقل؛ مثلاً من `WoodWorkOrder` → `InsertWooden*` (أين يُخزَّن المرجع `routing_progress`: عمود JSON جديد على `wooden_work_orders` مقابل جدول منفصل `fh_*` فقط).
2. قواعد عدم الاتساق: ماذا لو `rem` في الجدول لا يساوي المشتق من المراحل الثماني؟ (سياسة: «مصدر الحقيقة للويب هو hub» أو «الجدول هو المصدر»).
3. **المعدّن:** عند إنشاء واجهة أوامر معدّن في الويب، قرار واضح — استهلاك مباشر لـ `GET /api/metal/orders` أو تخزين نسخة JSON في `fh_metal_work_orders` مع الجسر من `metal_work_orders`.

### صفحات Placeholder المعدّن

- عند التنفيذ: إمّا ربط مباشر بـ **`/metal`** كما هو في OpenAPI الحالي، أو طبقة hub ترجع نفس الشكل الذي تريده لوحة Grand Line ثم تُترجم للجدول المعدّن عند الحفظ.

## تفصيل موارد `factory-hub` (بلا تغيير جوهري)

1. `wood-work-orders` — CRUD على `WoodWorkOrder` JSON.
2. `reference/:key` — مراجع من fixtures.
3. `work-order-analysis-sessions` — CRUD.
4. `new-project-autosave` — PUT/GET.
5. `POST .../seed` — تهيئة من fixtures (مع حماية dev).

## الخطوات التنفيذية (موسّعة)

1. **المخطط والهجرة** — جداول `fh_*` كما خُطّط.
2. **خادم** — تسجيل راوتر `factory-hub` بجانب الموجود.
3. **المستند `legacy-adapter-doc`** — ملف في `docs/` أو داخل الخطة فقط ثم نقله إلى المستودع (يُحدَّد عند التنفيذ).
4. **الجسر** — بعد استقرار المحوّل؛ خلف علم بيئة.
5. **الواجهة** — proxy + React Query + توصيل الصفحات.
6. **OpenAPI** — paths لـ hub + إبقاء wooden/metal موثّقة؛ قسم «Integration» يربط المسارين.

## مخاطر

- **كتابة مزدوجة خاطئة** تفسد `wooden` إن فشل المحوّل؛ لذلك الجسر خلف علم واختبارات على `local.db`.
- **انحراف النماذج** بين الفرقاء؛ الاعتماد على Zod لكل مسار يقلّل الأخطاء.

## تعريف «تسليم موسّع ناجح»

- لوحة الويب تعمل على hub مع بقاء البيانات بعد التحديث.
- **`GET /api/wooden/orders`** و**`GET /api/metal/orders`** لا يزالان يستجيبان كما اليوم لأي عميل قديم.
- يوجد **مستند محوّل** واضح؛ وإن فُعّل الجسر، تبقى جداول `wooden`/`metal` متسقة مع سياسة المصدر المختارة.
- OpenAPI يعكس المسارات الثلاثة (hub + legacy) وعلاقتها المقصودة.

## الجزء ج — قائمة جانبية «الأقسام» (قوّة العمل والماكينات)

### المتطلب (يضاف لتنفيذ الواجهة)

- عنصر تنقّل جديد في [Sidebar.tsx](apps/web/src/components/layout/Sidebar.tsx) بعنوان عربي **«الأقسام»** (و`/أو عنوان إنجليزي مختصر Departments`)؛ يمكن أن يكون **قابلاً للتوسيع** أو يوجّه إلى مسار مستقل **`/departments`** إذا كانت قوائم الأسماء طويلة جداً.
- **التجميع بحسب المصنع:** فرع أو تبويبان داخل المحتوى — **مصنع الأخشاب (WF-001)** و**مصنع المعادن (MF-001)**؛ يطابق تقسيم [factoryCapacityFixture](apps/web/src/data/fixtures/factoryCapacity.ts) (`woodworking_factory` · `metal_factory`).

لكل قسم صناعي `department.id` المعروض:

1. **الأشخاص على قوته:**  
   - **الأخشاب:** الأساس هو قاموس [`employeeAssignmentsFixture.departments`](apps/web/src/data/fixtures/employeeAssignments.ts) (مفتاح `DEPT_*` يطابق `department.id`). عرض **الأسماء** (والدور الوظيفي اختصاراً)، مع **عداد إجمالي** في عنوان القسم (مثل `٢٨ عامل`). تجاهل بطاقتي `management_layer` أو اعرضهما ضمن بطاقة «الإشراف» منفصلة حسب قرار تجربة الاستخدام.  
   - **المعادن:** نوع البيانات الحالي [`EmployeeAssignments`](apps/web/src/data/types.ts) مُقيّد بـ `WoodFactoryId`؛ لا ترشيح اسمي للمعدّن في الثابت المحلي. ضع **عبارة احتياط أو أعداد مخطَّطة** مستقبلاً من `workforceAllocation` إذا وُسّعت، أو مسار مستقبلي **`GET /api/employees`**؛ إلى أن يتوفر ذلك، اعرض تحت كل قسم معدني **عداد ماكينات فقط** وملاحقة «قوة عمل» لاحقاً.

2. **الماكينات بأعدادها:** لكل قسم، عدد **المهام/الماكينات** = **`department.tasks.length`** من نفس الـ fixture (كل `task` يمثل محطة تشغيل في مخطط السعة). إن رُغب أيضاً بتجميع جزئي (مثل «قص وليزر» كنص واحد)، فهو تحسين بصري ثانوي.

### اعتبارات واجهة

- الشريط الجانبي **ضيق؛** لتفادي آلاف الاسطر ضمن الـ `<nav>`: إمّا **أكورديوناً** مقتضباً بعدد الأشخاص + الرابط «عرض التفاصيل»، أو **صفحة مركزية** `/departments` بنفس المنطق وعنصر القائمة يوجّه إليها.
- **التوجيه RTL** وخطوط [ArabicText](apps/web/src/components/brand/ArabicText.tsx) حيث يلزم.
- بعد ربط **factory-hub `reference`**، تصبح نقطة واحدة لتغذية نفس المنطقة من API بدلاً من الـ fixtures فقط؛ يبقى نفس تعريف واجهة العرض.

### مخرجة التحقق لتسليم جزء الأقسام

- ظهور **كل أقسام الخشب** من مخطط السعة مع عدد الموظفيين الاسمي + عدد المهام؛ و**أقسام المعدّن** مع عدد المهام، ومعالجة أوضحة لقوة عمل المعدّن حتى وصول مصدر اسمي مكافئ.
