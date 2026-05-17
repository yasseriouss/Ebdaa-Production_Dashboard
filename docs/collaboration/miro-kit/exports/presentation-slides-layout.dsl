# Factory Data Hub — فهرس المرئيات (شرائح Miro layout_create)
# إطارات أولًا، ثم محتويات فرعية. إحداثيات الإطارات مراكز لوحة؛ DOC داخل الإطار = زاوية علوية يسار نسبية للإطار.

slideIntro FRAME x=-5600 y=7800 w=1280 h=720 fill=#E8F4FC "فهرس المرئيات — جلسة واحدة"
slide1 FRAME x=-3920 y=7800 w=1280 h=720 fill=#F7F9FC "١ التخطيط والتسليم"
slide2 FRAME x=-2240 y=7800 w=1280 h=720 fill=#F7F9FC "٢ الواجهة والمنتج"
slide3 FRAME x=-560 y=7800 w=1280 h=720 fill=#F7F9FC "٣ واجهة API"
slide4 FRAME x=1120 y=7800 w=1280 h=720 fill=#F7F9FC "٤ البيانات"
slide5 FRAME x=2800 y=7800 w=1280 h=720 fill=#F7F9FC "٥ الأمان والنطاق"
slide6 FRAME x=4480 y=7800 w=1280 h=720 fill=#F7F9FC "٦ التشغيل والتيار"
slide7 FRAME x=-5600 y=8680 w=1280 h=720 fill=#F7F9FC "٧ التكامل المرجعي"
slide8 FRAME x=-3920 y=8680 w=1280 h=720 fill=#F7F9FC "٨ الجداول CSV"
slide9 FRAME x=-2240 y=8680 w=1280 h=720 fill=#F7F9FC "٩ قوالب الاجتماعات"
slide10 FRAME x=-560 y=8680 w=1280 h=720 fill=#F7F9FC "١٠ متابعة أتمتة Miro"

tIntro TEXT parent=slideIntro x=640 y=56 w=1100 align=center font=plex_sans size=32 color=#13212A "مراجع موحّد قبل Presentation Mode في Miro"

dIntro DOC parent=slideIntro x=40 y=120 <<<
جميع المرئيات المذكورة لها مسار تحت مستودع **Factory Data Hub** داخل مجلد `docs/collaboration/miro-kit/`.

المصدر المركزي النصّي للعناوين: `frames/slides-all-maps-outline.md`

لوحة Miro المعتمدة: [لوحة الفريق](https://miro.com/app/board/uXjVHSw5YHo=/)

الشرائح التالية تجمع الأقسام ١–١٠؛ انسَخ عنوان الإطار كـ عنوان شريحة عند الحاجة.
>>>

d1 DOC parent=slide1 x=40 y=100 <<<
**المجلد:** `diagrams/planning/`

| عنوان مقترح للـ Frame | ملف |
|----------------------|-----|
| خطّة المراحلة مع الموازيات | `execution-roadmap.mermaid` |
| الديون المتفرعة | `parallel-and-debt.mermaid` |
>>>

d2 DOC parent=slide2 x=40 y=100 <<<
**المجلد:** `diagrams/ui/`

- خريطة المسارات الحالية → `routes-ia.mermaid`
- خريطة موقع SPA مجمّعة → `site-map-groups.mermaid`
- Sidebar وصلاحيات المسارات → `route-permissions-flow.mermaid`
- مسار عميل القائمة → `customer-journey-sidebar-gates.mermaid`
- مسار عميل الطلب تحت `/api` → `customer-journey-api-paths.mermaid`
- سياق واجهتين → `dual-frontends-context.mermaid`
>>>

d3 DOC parent=slide3 x=40 y=100 <<<
**المجلد:** `diagrams/api/`

- شجرة التركيب تحت `/api` → `http-mounts.mermaid`
- سلسلة الوسيط قبل المسارات → `middleware-before-routes.mermaid`
>>>

d4 DOC parent=slide4 x=40 y=100 <<<
**المجلد:** `diagrams/data/`

- كتل الدومين → `domain-entities.mermaid`
- مصغّر مصادقة/تدقيق → `auth-audit-mini.mermaid`
- ER أساس Drizzle/SQLite → `database-er-core.mermaid`
>>>

d5 DOC parent=slide5 x=40 y=100 <<<
**المجلد:** `diagrams/security/`

- JWT إلى RBAC → `auth-jwt-rbac-flow.mermaid`
- نطاق الصف مطبّق مقابل معلّق → `row-scope-applied-vs-pending.mermaid`
- تدقيق الطفرات → `mutation-audit-chain.mermaid`
>>>

d6 DOC parent=slide6 x=40 y=100 <<<
**المجلد:** `diagrams/operations/`

- حزم الـ workspace → `workspace-packages.mermaid`
- تيّار المتصفّح → SQLite/LibSQL → `request-value-stream.mermaid`
- تشغيل محلي وseed → `dev-seed-import-export-overview.mermaid`
>>>

d7 DOC parent=slide7 x=40 y=100 <<<
**المجلد:** `diagrams/integration/`

- Hub JSON مقابل جداول معيارية → `reference-vs-canonical-wood-metal.mermaid`
>>>

d8 DOC parent=slide8 x=40 y=100 <<<
**المجلد:** `tables/`

- خطة موحّدة todos → `roadmap-todos.csv`
- مواءمة صلاحيات roadmap → `permissions-alignment.csv`
- مصفوفة mounts سريعة → `api-mounts-matrix.csv`
>>>

d9 DOC parent=slide9 x=40 y=100 <<<
**قوالب اجتماعات (نصوص للإطارات / Stickies)**

- Management Review SAFe → `slide-outline-management-review.md`
- PI Planning Prep → `slide-outline-pi-prep.md`
- تحسينات للـ Stickies → `improvements-for-management-review-stickies.md`
- سيناريوهات عمل ومسارات عميل → `business-scenarios-ar.md`
>>>

d10 DOC parent=slide10 x=40 y=100 <<<
**متابعة MCP**

- راجع `MIRO_MCP_FOLLOWUP.md` في جذر `miro-kit` عند ربط خادم Miro في Cursor.

رابط اللوحة: https://miro.com/app/board/uXjVHSw5YHo=/
>>>
