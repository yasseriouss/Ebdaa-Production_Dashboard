# دليل إعداد AppSheet — نظام إبداع للأثاث
# AppSheet Setup Guide — Ebdaa Furniture System

> **الهدف**: ربط ملف Google Sheets بـ AppSheet لإنشاء تطبيق موبايل/ويب
> يتيح لفريق المصنع تحديث بيانات الإنتاج لحظياً من الهاتف أو المتصفح.
>
> **Goal**: Connect Google Sheets to AppSheet to create a mobile/web app
> allowing factory staff to update production data in real time.

---

## المتطلبات / Prerequisites

| المتطلب | التفاصيل |
|---------|----------|
| حساب Google | مع صلاحية الوصول إلى Google Drive |
| ملف Sheets | مرفوع على Google Drive ومفتوح كـ Google Sheets |
| حساب AppSheet | مجاني حتى 10 مستخدمين على نفس النطاق (@شركتك.com) |

---

## الخطوة 1: تحضير ملف Google Sheets
## Step 1: Prepare the Google Sheet

1. افتح [drive.google.com](https://drive.google.com)
2. ارفع `Ebdaa-Sheets-Template.xlsx` ← **Upload file**
3. انقر بزر اليمين → **Open with → Google Sheets** (يحوّله لصيغة Sheets)
4. الصق كود Apps Script:
   - **Extensions → Apps Script**
   - احذف المحتوى الافتراضي
   - الصق محتوى `Ebdaa-Apps-Script.gs` بالكامل
   - احفظ (Ctrl+S) → أعطِ المشروع اسم: **إبداع Automation**
   - نفّذ دالة `onOpen` مرة واحدة لمنح الصلاحيات
5. أعد تحميل الشيت — ستظهر قائمة **🏭 إبداع Tools**

---

## الخطوة 2: إنشاء التطبيق على AppSheet
## Step 2: Create the AppSheet App

1. من داخل Google Sheets: **Extensions → AppSheet → Create an app**
2. سيفتح AppSheet تلقائياً ويكشف الشيتات الخمس
3. أدخل اسم التطبيق: **نظام إبداع للأثاث**
4. الوصف: **Ebdaa Furniture Factory Management**

---

## الخطوة 3: إعداد جداول البيانات (Tables)
## Step 3: Configure Data Tables

في **AppSheet Editor → Data → Tables**:

### جدول: أوامر معدني (Metal Orders)

| الإعداد | القيمة |
|---------|--------|
| Table name | `MetalOrders` |
| Sheet name | `أوامر معدني` |
| Header Row | `1` (Arabic labels) |
| Data Starts | Row `3` |
| Key column | `رقم MOM` (mo_number) |
| Label column | `المنتج` (product) |

**أعمدة خاصة / Special Columns:**

| العمود | النوع | ملاحظة |
|--------|-------|--------|
| `الكمية / qty` | `Decimal` | Required |
| `الحالة / status` | `EnumList` | قيم: تحت التصنيع، في المخزن، تم التسليم، متوقف |
| `نسبة الإنجاز %` | `Decimal` | Read-only (auto-calculated) |
| `المتأخرات` | `Decimal` | Read-only |
| أعمدة المراحل G→W | `Number` | 17 عمود — Editable للعمال |

### جدول: أوامر خشبي (Wooden Orders)

| الإعداد | القيمة |
|---------|--------|
| Table name | `WoodenOrders` |
| Sheet name | `أوامر خشبي` |
| Data Starts | Row `3` |
| Key column | `رقم الأمر` (order_no) |

**أعمدة خاصة / Special Columns:**

| العمود | النوع | ملاحظة |
|--------|-------|--------|
| `الكمية / qty` | `Decimal` | Required |
| `المنجز / done` | `Decimal` | Editable |
| `المتبقي / rem` | `Decimal` | Read-only (auto) |
| `نسبة الإنجاز %` | `Decimal` | Show as Progress Bar |
| `الحالة / status` | `Enum` | تحت التصنيع، تم التسليم، متوقف، Delivered، Hold |
| `تاريخ بدء الإنتاج` | `Date` | |
| `تاريخ انتهاء الإنتاج` | `Date` | |

### جدول: لوحة التحكم (Dashboard)

- اجعله **Read-only** بالكامل (Data → Table → Read-only)
- لا يظهر في نماذج الإدخال

### جدول: مشاريع مشتركة (Shared Projects)

- Read-only
- يُعرض كـ **Gallery** أو **Table** view فقط

### جدول: متابعة المراحل (Stage Tracker)

| الإعداد | القيمة |
|---------|--------|
| Key column | Auto-generated row ID |
| Ref column | `رقم MOM` ← Ref to `MetalOrders` |
| `التاريخ / date` | `Date` — default: TODAY() |

---

## الخطوة 4: إنشاء Views (الصفحات)
## Step 4: Create Views

في **AppSheet Editor → UX → Views**:

### View 1: الرئيسية (Home Dashboard)
```
Type:    Dashboard
Content: KPI tiles from لوحة التحكم sheet
         - إجمالي أوامر معدني   (B5)
         - إجمالي أوامر خشبي    (C5)
         - الأوامر المتوقفة     (D8)
         - متوسط الإنجاز %      (B10/C10)
```

### View 2: أوامر معدني — Metal Orders List
```
Type:       Table
Table:      MetalOrders
Sort by:    الحالة (Status)
Group by:   العميل (Client)
Quick filter: الحالة (Status)
```

### View 3: تحديث مرحلة معدني — Metal Stage Update *(mobile form)*
```
Type:   Form
Table:  MetalOrders
Show columns:
  - رقم MOM (read-only)
  - أعمدة المراحل 17 (G..W) — editable
  - الحالة (status) — dropdown
  - ملاحظات (notes)
Hide: نسبة الإنجاز %, المتأخرات (auto-calculated)
```

### View 4: أوامر خشبي — Wooden Orders List
```
Type:      Table
Table:     WoodenOrders
Sort by:   تاريخ انتهاء الإنتاج
```
- اجعل `نسبة الإنجاز %` يظهر كـ Progress Bar:
  **Data → Column → نسبة الإنجاز % → Show As → Progress**

### View 5: متابعة المراحل — Stage Tracker
```
Type:  Table + Form
Table: StageTracker
```

---

## الخطوة 5: الصلاحيات والمستخدمون
## Step 5: Users & Permissions

في **AppSheet Editor → Security → Users & Roles**:

### الأدوار / Roles

| الدور | Role Name | الصلاحيات |
|-------|-----------|-----------|
| مدير المصنع | `Manager` | قراءة + كتابة + حذف على جميع الجداول |
| عامل إنتاج | `Worker` | كتابة على أعمدة المراحل + done فقط — لا حذف |
| مشاهد | `Viewer` | قراءة فقط — لوحة التحكم والتقارير |

### إعداد Column-Level Permissions للعمال:

1. **Data → Table → MetalOrders → Columns**
2. للأعمدة التالية: `mo_number, product, client, project, status, completion_pct, backlog_qty`:
   - اضبط **EDITABLE_IF**: `USERROLE() = "Manager"`
3. للأعمدة `G..W` (17 مرحلة):
   - **EDITABLE_IF**: `USERROLE() = "Manager" OR USERROLE() = "Worker"`

---

## الخطوة 6: إعداد التنبيهات التلقائية
## Step 6: Configure Automation Alerts

في **AppSheet Editor → Automation → Bots**:

### Bot 1: تنبيه أمر متوقف
```
Trigger:  Data change
Table:    MetalOrders or WoodenOrders
Condition: [status] = "متوقف" OR [status] = "Hold"
Action:   Send email
  To:       manager@yourcompany.com
  Subject:  ⚠️ أمر متوقف: [mo_number] — [product]
  Body:     تم تعليق الأمر [mo_number] للعميل [client].
            يرجى المراجعة الفورية.
```

### Bot 2: تنبيه اكتمال أمر
```
Trigger:  Data change
Table:    MetalOrders
Condition: [completion_pct] >= 100
Action:   Send email
  Subject:  ✅ اكتمل الأمر: [mo_number]
  Body:     تم اكتمال أمر [mo_number] — [product] للعميل [client].
```

---

## الخطوة 7: نشر التطبيق
## Step 7: Deploy

1. **AppSheet → Manage → Deploy → Move to Deployed State**
2. Access level: **Specific users** (أضف الأعضاء بإيميلاتهم)
3. شارك رابط التطبيق:
   `https://www.appsheet.com/start/YOUR-APP-ID`
4. يمكن تثبيته على الموبايل كـ **PWA**:
   - افتح الرابط في Chrome
   - اضغط **⋮ → Add to Home Screen / تثبيت التطبيق**

---

## نقل البيانات لاحقاً إلى السيرفر الكامل
## Future Migration to Full Web Server

عند الانتهاء من السيرفر الكامل، يمكن نقل البيانات بثلاث خطوات:

### الخطوة أ: تصدير من Google Sheets
```
File → Download → Microsoft Excel (.xlsx)
احفظ الملف باسم: Ebdaa-Export-YYYY-MM-DD.xlsx
```

### الخطوة ب: استيراد إلى النظام الكامل
```
النظام الكامل → استيراد Excel (Import Excel)
ارفع الملف → سيتعرف النظام على الأعمدة تلقائياً
```

### الخطوة ج: تطابق الأعمدة (DB ↔ Sheets)

| عمود الشيت | مفتاح DB | الجدول |
|------------|----------|--------|
| `رقم MOM / mo_number` | `mo_number` | `metal_work_orders` |
| `العميل / client` | `client` | `metal_work_orders` |
| `الكمية / qty` | `qty` | `metal_work_orders` |
| `الحالة / status` | `status` | `metal_work_orders` |
| `نسبة الإنجاز % / completion_pct` | `completion_pct` | `metal_work_orders` |
| أعمدة المراحل (laser..delivery) | stage rows | `metal_production_stages` |
| `رقم الأمر / order_no` | `order_no` | `wooden_work_orders` |
| `المنجز / done` | `done` | `wooden_work_orders` |
| `المتبقي / rem` | `rem` | `wooden_work_orders` |

> **تنبيه**: الأرقام المكررة (MOM# / Order No) ستُرفض تلقائياً لتفادي التكرار.

---

## ملاحظات مهمة / Important Notes

| | العربية | English |
|--|---------|---------|
| ✅ | AppSheet مجاني حتى 10 مستخدمين على نفس النطاق | Free for up to 10 users on same domain |
| ✅ | يعمل على iOS وAndroid بدون تثبيت من المتجر | Works on iOS/Android without App Store |
| ✅ | يعمل **Offline** ويزامن البيانات عند الاتصال | Offline mode with sync on reconnect |
| ✅ | صيغ FILTER/QUERY تعمل في Google Sheets فقط | FILTER/QUERY formulas need Google Sheets |
| ⚠️ | فتح الملف في Excel يعطّل صيغ FILTER | Opening in Excel disables FILTER formulas |
| ⚠️ | التقرير التلقائي يحتاج صلاحية Gmail أول مرة | Auto report needs Gmail permission once |

---

*نظام إدارة مصنعي إبداع للأثاث — 2025*
*Ebdaa Furniture Factory Management System*
