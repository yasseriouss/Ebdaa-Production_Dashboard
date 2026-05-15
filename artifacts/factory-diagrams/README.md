# Factory Data Hub — diagram print pack

Mermaid sources (`.mmd`) for **architecture**, **data model**, **APIs**, **workflows**, **business scenario**, and **roadmap**. Exports use a **neutral** theme, **pdfFit** (tight render from Chrome), a larger viewport, and **print-page.css** (`@page` **A3 landscape**). The merge step places each slide on a real **A3 landscape** PDF page with **uniform scaling** so content fits inside margins.

## Build the merged PDF

From this folder in PowerShell:

```powershell
.\build-print-pack.ps1
```

Output: **`Factory-Data-Hub-Diagrams-Print.pdf`** — **11 pages** (1 cover + 10 diagram slides), each **A3 landscape**, content **fitted**.

Requirements:

- **pnpm** (`pnpm dlx @mermaid-js/mermaid-cli@10.9.1`)
- **Google Chrome** at the path in `puppeteer-config.json` (edit if your install differs)
- **Python 3** with **pypdf** (`pip install pypdf`)

Merge only (when every `NN-*.pdf` slide already exists):

```powershell
python .\merge_pdfs.py
```

## Page order

0. Document cover  
1. System architecture  
2. ERD  
3. API routes  
4. Production lifecycle  
5. Capacity model  
6. UI navigation  
7. API sequence  
8. Business scenario  
9. Roadmap (Gantt)  
10. User cycles — all paths (bilingual: surfaces, auth, RTL floor, API/import, outcomes)

## FigJam

Live board:  
[Factory Data Hub diagrams on FigJam](https://www.figma.com/board/7zZjFBWsCQcg23wb21ly9R?utm_source=cursor&utm_content=edit_in_figjam)

For FigJam print/export, set paper to **A3 landscape** and **fit to page** if needed.

## Printer checklist

- Paper: **A3**, orientation: **landscape** (should match the PDF media box).  
- If a driver still crops, use **fit to printable area**.  
- Duplex and gutter as needed for binding.
