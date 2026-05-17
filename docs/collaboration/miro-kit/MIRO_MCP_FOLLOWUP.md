---
title: Miro MCP follow-up
---

### لوحة العمل المعتمدة (Blueprint + ثلاث تصورات)

[https://miro.com/app/board/uXjVHSF8IhA=/?share_link_id=313891809814](https://miro.com/app/board/uXjVHSF8IhA=/?share_link_id=313891809814)

استخدم **`miro_url`** = `https://miro.com/app/board/uXjVHSF8IhA=/` في كل أدوات MCP.

**تخطيط المناطق:** [`frames/board-layout-three-views-ar.md`](frames/board-layout-three-views-ar.md)

### لوحة أرشيف (جلسات سابقة)

[https://miro.com/app/board/uXjVHSw5YHo=/?share_link_id=38612289187](https://miro.com/app/board/uXjVHSw5YHo=/?share_link_id=38612289187)

استخدم **`miro_url`** = `https://miro.com/app/board/uXjVHSw5YHo=/` عند الرفع على هذه اللوحة.

| عنصر على اللوحة | المصدر في المستودع | moveToWidget |
|-----------------|-------------------|--------------|
| ERD كامل (21 جدول) | `exports/miro-er-full-diagram-create.json` | [3458764672094047155](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672094047155) |
| **١٠ النظام الشامل** (إطار) | `slides-all-maps-outline.md` §10 | [3458764672099867014](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672099867014) |
| مدلولات علاقات ERD | `tables/erd-relationship-legend-ar.md` | [3458764672099867120](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672099867120) |
| سير عمل وتدفق بيانات | `frames/workflow-and-dataflow-ar.md` | [3458764672099867219](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672099867219) |
| فلوشارت نظام شامل | `diagrams/system/system-end-to-end-flowchart.mermaid` | [3458764672099867408](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672099867408) |
| سيناريوهات عمل | `frames/business-scenarios-ar.md` | [3458764672014440821](https://miro.com/app/board/uXjVHSw5YHo=/?moveToWidget=3458764672014440821) |

#### رفع §10 (علاقات + workflow + flowchart) عبر MCP

1. `layout_create` — إطار `١٠ النظام الشامل` عند `x=-6200 y=4800`.
2. `doc_create` — محتوى Markdown من `erd-relationship-legend-ar.md` و `workflow-and-dataflow-ar.md` (ملخص الجداول والتدفقات؛ الملف الكامل في Git).
3. `diagram_create` — `flowchart` من `system-end-to-end-flowchart.mermaid` (طبقات Users → SPA → API → Services → DB؛ داخل الإطار عبر `moveToWidget` على الإطار).

المصدر المعياري للتوليد دائمًا `miro-kit` في المستودع، وليس نسخًا يدويًا من اللوحة.

### ER كامل Drizzle SQLite

```bash
node docs/collaboration/miro-kit/scripts/build-miro-er-full-payload.js
```

مرّر `exports/miro-er-full-diagram-create.json` إلى `diagram_create` على اللوحة `uXjVHSF8IhA`.

### Crosswalk Blueprint ↔ miro-kit

جدول CSV: [`tables/crosswalk-blueprint-miro-kit.csv`](tables/crosswalk-blueprint-miro-kit.csv) — يُرفع عبر `table_create` + `table_sync_rows`.

### محاولة الاتصال من الوكيل

فعّل خادم **Miro** (`plugin-miro-miro`) في Cursor. المعامل: **`miro_url`** وليس `board_url`.

### ماذا تفعل يدوياً

1. افتح اللوحة من الرابط المعتمد أعلاه.
2. ابدأ من **Zone C — فهرس ثلاثي** ثم Zone A أو Zone B حسب الجمهور.
3. لإعادة رفع مخطّط: عدّل الملف `.mermaid` أو JSON ثم `diagram_create` بإحداثيات `x/y` جديدة.
