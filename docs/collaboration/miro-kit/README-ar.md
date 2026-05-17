# دليل مجلّد `miro-kit`

يهدف هذا المجلّد إلى **تجميع المرئيات والجداول** المستخلصة من كود ومخططات **Factory Data Hub** بحيث يمكن إما تشغيلها في [Mermaid Live](https://mermaid.live) لتصدير SVG/PNG ولصقها في Miro، أو نسْبها لوصف لميزة **diagram_create** عند توفر MCP.

## البنية

| المسار | الغرض |
|--------|-------|
| `diagrams/planning/` | تخطيط المراحلة أ→هـ والمسارات المتوازية |
| `diagrams/ui/` | شجرة المسارات، الصلاحيات، سياق واجهتين |
| `diagrams/api/` | أشجار المسارات تحت `/api` وسلسلة الوسيط |
| `diagrams/data/` | دليل مخطّط Drizzle الأساسية |
| `diagrams/security/` | JWT، RBAC، نطاق الصفوف، سلسلة تدقيق الطفرات |
| `diagrams/operations/` | تيّار الطلب، تشغيل pnpm وseed واستيراد/تصدير |
| `diagrams/integration/` | Hub JSON مقابل جداول خشب/معدن وlegacy |
| `frames/` | مخطّط شرائح/اجتماعات |
| `tables/` | CSV لاستيراد Miro أو Sticky جماعية |
| `exports/` | مكان تنبيه لمخرجات الصور خارج Git |

## لوحة المستخدم في Miro

**رابط اللوحة المعتمد (مناسب لـ MCP كـ `board_url`):**

[https://miro.com/app/board/uXjVHSw5YHo=/](https://miro.com/app/board/uXjVHSw5YHo=/)

تفاصيل المتابعة مع MCP أو رابط الدعوة القديم: **`MIRO_MCP_FOLLOWUP.md`**.

## قوالب Miro المقترَحة

استخدم ما يلائم المحتوى: **Management Review SAFe** (ملخص، مخاطر، قرار)، **PI Planning Preparation** (البند المعلق `perm-scope-queries-production-hub`، تبعيات، مالك)، **4×4 Table** لتتبّع todos، و**Value Stream** لمسار المتصفّح إلى قاعدة البيانات.

## التحسينات المقترَحة

تلخّص في `frames/improvements-for-management-review-stickies.md` لنسخها كـ Stickies تحت إطار المراجعة.
