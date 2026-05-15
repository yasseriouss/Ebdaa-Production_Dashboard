# مرجع الصلاحيات والأدوار (Factory Data Hub)

يُحدَّث هذا الملف من كود المصدر عبر `npm run export-permission-docs` داخل `lib/db`.

## جدول كل الصلاحيات

| المفتاح | الوحدة | الاسم بالعربية | الوصف |
|--------|--------|-----------------|-------|
| `dashboard:view` | لوحة التحكم | عرض لوحة التحكم | الوصول للصفحة الرئيسية والملخصات. |
| `dashboard:widgets` | لوحة التحكم | تخصيص عناصر اللوحة | إظهار/إخفاء بطاقات وروابط سريعة على لوحة التحكم. |
| `orders:metal:view` | أوامر الإنتاج | عرض أوامر المعدن | صفحة أوامر مصنع المعادن. |
| `orders:metal:write` | أوامر الإنتاج | تعديل أوامر المعدن | إنشاء وتعديل وحذف أوامر المعدن. |
| `orders:wood:view` | أوامر الإنتاج | عرض أوامر الخشب | صفحة Kanban/جدول أوامر الخشب. |
| `orders:wood:write` | أوامر الإنتاج | تعديل أوامر الخشب | تحديث المراحل والكميات وأوامر الخشب. |
| `daily:metal:view` | الإنتاج اليومي | عرض اليومية — معدن | سجل الإنتاج اليومي لمصنع المعادن. |
| `daily:metal:write` | الإنتاج اليومي | إدخال اليومية — معدن | حفظ وتعديل سجلات اليومية للمعدن. |
| `daily:wood:view` | الإنتاج اليومي | عرض اليومية — خشب | سجل الإنتاج اليومي لمصنع الأخشاب. |
| `daily:wood:write` | الإنتاج اليومي | إدخال اليومية — خشب | حفظ وتعديل سجلات اليومية للخشب. |
| `projects:joint:view` | المشاريع | عرض المشاريع المشتركة | قائمة المشاريع المشتركة. |
| `projects:joint:write` | المشاريع | تعديل المشاريع المشتركة | إنشاء وتعديل المشاريع المشتركة. |
| `projects:new:view` | المشاريع | عرض معالج مشروع جديد | الوصول لصفحة مشروع جديد. |
| `projects:new:write` | المشاريع | إنشاء وحفظ مشروع جديد | ملء وحفظ بيانات مشروع جديد. |
| `projects:wo_analysis:view` | المشاريع | عرض تحليل أوامر الشغل | صفحة تحليل أوامر الشغل. |
| `projects:wo_analysis:write` | المشاريع | تعديل جلسات التحليل | حفظ جلسات ونتائج التحليل. |
| `planning:view` | التخطيط والجدولة | عرض التخطيط وKPI | صفحة التخطيط والمؤشرات الدورية. |
| `planning:write` | التخطيط والجدولة | تعديل أهداف التخطيط | تحديث القيم والأهداف في لوحة التخطيط. |
| `analytics:export` | التحليلات | تصدير تقارير التحليلات | تصدير CSV/Excel من شاشات التحليلات. |
| `analytics:metal:view` | التحليلات | عرض تحليلات المعادن | رسوم وبيانات مصنع المعادن. |
| `analytics:multi:view` | التحليلات | عرض تحليلات متعددة المصانع | لوحة التحليلات الموحدة. |
| `analytics:wood:view` | التحليلات | عرض تحليلات الخشب | رسوم وبيانات مصنع الأخشاب. |
| `project_analytics:view` | التحليلات | عرض تحليلات المشاريع | صفحة تحليلات المشاريع. |
| `equipment:view` | المعدات | عرض سجل المعدات | قراءة سجل المعدات والماكينات. |
| `equipment:write` | المعدات | تعديل سجل المعدات | إضافة وتعديل بيانات المعدات عند توفر واجهات الكتابة. |
| `about:view` | حول النظام والمرجع | عرض حول النظام والتدريب | صفحة التعريف والوثائق المرجعية. |
| `about:write` | حول النظام والمرجع | تعديل محتوى مرجعي | تحرير محتوى مرجعي مستقبلًا. |
| `factory_hub:analysis:read` | مصنع البيانات (Hub) | قراءة تحليل أوامر الشغل (Hub) | قراءة جلسات التحليل المخزنة. |
| `factory_hub:analysis:write` | مصنع البيانات (Hub) | كتابة تحليل أوامر الشغل (Hub) | حفظ جلسات التحليل في Hub. |
| `factory_hub:project_autosave:read` | مصنع البيانات (Hub) | قراءة مسودة مشروع جديد | قراءة مسودة معالج المشروع. |
| `factory_hub:project_autosave:write` | مصنع البيانات (Hub) | كتابة مسودة مشروع جديد | حفظ مسودة معالج المشروع. |
| `factory_hub:reference:read` | مصنع البيانات (Hub) | قراءة اللقطات المرجعية | قراءة لقطات السعة والموظفين وغيرها. |
| `factory_hub:reference:write` | مصنع البيانات (Hub) | كتابة اللقطات المرجعية | تحديث بيانات مرجعية في Hub. |
| `factory_hub:wood:read` | مصنع البيانات (Hub) | قراءة أوامر الخشب في Hub | قراءة حزم أوامر الخشب من الطبقة الموحدة. |
| `factory_hub:wood:write` | مصنع البيانات (Hub) | كتابة أوامر الخشب في Hub | مزامنة وتعديل أوامر الخشب في Hub. |
| `capacity:view` | الدليل التنظيمي | عرض السعة والمهام | قراءة جداول السعة والمصانع والأقسام. |
| `capacity:write` | الدليل التنظيمي | تعديل السعة والمهام | تعديل تعريفات السعة والمهام. |
| `employees:export` | الدليل التنظيمي | تصدير بيانات الموظفين | تصدير CSV للموظفين. |
| `employees:view` | الدليل التنظيمي | عرض الموظفين | استعراض قائمة الموظفين والأقسام. |
| `import_export:export` | التكامل | تصدير ملفات | تصدير البيانات من النظام. |
| `import_export:import` | التكامل | استيراد ملفات | استيراد Excel وملفات البيانات. |
| `audit:export` | التدقيق | تصدير سجل التدقيق | تصدير السجل للمراجعة الخارجية. |
| `audit:view` | التدقيق | عرض سجل التحركات | قراءة أحداث التدقيق والمسارات. |
| `admin:permissions:manage` | إدارة النظام | توزيع الصلاحيات على الأدوار والمستخدمين | تعديل ربط الأدوار بالصلاحيات وتعيين الأدوار للمستخدمين. |
| `admin:permissions:view` | إدارة النظام | عرض لوحة توزيع الصلاحيات | الوصول لشاشة مصفوفة الصلاحيات. |
| `admin:users:manage` | إدارة النظام | إدارة حسابات المستخدمين | إنشاء وتعطيل حسابات المستخدمين عند تفعيل المصادقة. |

## الأدوار الافتراضية وصلاحيات كل دور

### مدير النظام الأعلى (`super_admin`)

- **الاسم الإنجليزي:** Super administrator
- **عدد الصلاحيات:** 46

المفاتيح:

- `dashboard:view`
- `dashboard:widgets`
- `orders:metal:view`
- `orders:metal:write`
- `orders:wood:view`
- `orders:wood:write`
- `daily:metal:view`
- `daily:metal:write`
- `daily:wood:view`
- `daily:wood:write`
- `projects:joint:view`
- `projects:joint:write`
- `projects:new:view`
- `projects:new:write`
- `projects:wo_analysis:view`
- `projects:wo_analysis:write`
- `planning:view`
- `planning:write`
- `analytics:multi:view`
- `analytics:wood:view`
- `analytics:metal:view`
- `analytics:export`
- `project_analytics:view`
- `equipment:view`
- `equipment:write`
- `about:view`
- `about:write`
- `factory_hub:wood:read`
- `factory_hub:wood:write`
- `factory_hub:reference:read`
- `factory_hub:reference:write`
- `factory_hub:analysis:read`
- `factory_hub:analysis:write`
- `factory_hub:project_autosave:read`
- `factory_hub:project_autosave:write`
- `employees:view`
- `employees:export`
- `capacity:view`
- `capacity:write`
- `import_export:import`
- `import_export:export`
- `audit:view`
- `audit:export`
- `admin:permissions:view`
- `admin:permissions:manage`
- `admin:users:manage`

### مدير مصنع (`factory_admin`)

- **الاسم الإنجليزي:** Factory administrator
- **عدد الصلاحيات:** 44

المفاتيح:

- `dashboard:view`
- `dashboard:widgets`
- `orders:metal:view`
- `orders:metal:write`
- `orders:wood:view`
- `orders:wood:write`
- `daily:metal:view`
- `daily:metal:write`
- `daily:wood:view`
- `daily:wood:write`
- `projects:joint:view`
- `projects:joint:write`
- `projects:new:view`
- `projects:new:write`
- `projects:wo_analysis:view`
- `projects:wo_analysis:write`
- `planning:view`
- `planning:write`
- `analytics:multi:view`
- `analytics:wood:view`
- `analytics:metal:view`
- `analytics:export`
- `project_analytics:view`
- `equipment:view`
- `equipment:write`
- `about:view`
- `about:write`
- `factory_hub:wood:read`
- `factory_hub:wood:write`
- `factory_hub:reference:read`
- `factory_hub:reference:write`
- `factory_hub:analysis:read`
- `factory_hub:analysis:write`
- `factory_hub:project_autosave:read`
- `factory_hub:project_autosave:write`
- `employees:view`
- `employees:export`
- `capacity:view`
- `capacity:write`
- `import_export:import`
- `import_export:export`
- `audit:view`
- `audit:export`
- `admin:permissions:view`

### رئيس قسم (`department_lead`)

- **الاسم الإنجليزي:** Department lead
- **عدد الصلاحيات:** 32

المفاتيح:

- `dashboard:view`
- `dashboard:widgets`
- `orders:wood:view`
- `orders:wood:write`
- `orders:metal:view`
- `daily:wood:view`
- `daily:wood:write`
- `daily:metal:view`
- `daily:metal:write`
- `projects:new:view`
- `projects:new:write`
- `projects:wo_analysis:view`
- `projects:wo_analysis:write`
- `planning:view`
- `planning:write`
- `analytics:multi:view`
- `analytics:wood:view`
- `analytics:metal:view`
- `project_analytics:view`
- `equipment:view`
- `about:view`
- `factory_hub:wood:read`
- `factory_hub:wood:write`
- `factory_hub:reference:read`
- `factory_hub:analysis:read`
- `factory_hub:analysis:write`
- `factory_hub:project_autosave:read`
- `factory_hub:project_autosave:write`
- `employees:view`
- `capacity:view`
- `import_export:export`
- `audit:view`

### مشغّل / فني إنتاج (`operator`)

- **الاسم الإنجليزي:** Operator
- **عدد الصلاحيات:** 14

المفاتيح:

- `dashboard:view`
- `orders:wood:view`
- `orders:wood:write`
- `orders:metal:view`
- `daily:wood:view`
- `daily:wood:write`
- `daily:metal:view`
- `daily:metal:write`
- `equipment:view`
- `about:view`
- `factory_hub:wood:read`
- `factory_hub:wood:write`
- `factory_hub:project_autosave:read`
- `factory_hub:project_autosave:write`

### مطلع فقط (`viewer`)

- **الاسم الإنجليزي:** Viewer
- **عدد الصلاحيات:** 22

المفاتيح:

- `dashboard:view`
- `orders:metal:view`
- `orders:wood:view`
- `daily:metal:view`
- `daily:wood:view`
- `projects:joint:view`
- `projects:new:view`
- `projects:wo_analysis:view`
- `planning:view`
- `analytics:multi:view`
- `analytics:wood:view`
- `analytics:metal:view`
- `project_analytics:view`
- `equipment:view`
- `about:view`
- `factory_hub:wood:read`
- `factory_hub:reference:read`
- `factory_hub:analysis:read`
- `factory_hub:project_autosave:read`
- `employees:view`
- `capacity:view`
- `audit:view`

## المستخدمون وتعيين الأدوار

بعد تشغيل `npm run seed-permissions` يُنشأ مستخدم تجريبي **demo@factory.local** بدور **مدير النظام الأعلى** لعرض النموذج في لوحة «توزيع الصلاحيات». عند إضافة مستخدمين حقيقيين يظهرون في جدول المستخدمين مع الأدوار المعيَّنة لكل منهم.
