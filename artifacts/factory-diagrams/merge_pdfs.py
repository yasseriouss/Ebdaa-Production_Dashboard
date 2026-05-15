"""Merge per-slide PDFs into one A3 landscape print pack with content fitted to each page."""
from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader, PdfWriter, Transformation

base = Path(__file__).resolve().parent

# Source slide PDFs (from mermaid-cli, usually tight mediabox around SVG)
files = [
    "00-document-cover.pdf",
    "01-architecture.pdf",
    "02-erd.pdf",
    "03-api-routes.pdf",
    "04-production-lifecycle.pdf",
    "05-capacity-model.pdf",
    "06-user-navigation.pdf",
    "07-api-sequence.pdf",
    "08-business-scenario.pdf",
    "09-roadmap.pdf",
    "10-user-cycles-all-paths.pdf",
]

# ISO A3 landscape in PDF points (72 dpi): 420 mm x 297 mm
A3_LANDSCAPE_W = 1191
A3_LANDSCAPE_H = 842
# ~10 mm margins on each side
MARGIN_PT = 28


def _page_onto_a3(writer: PdfWriter, page) -> None:
    """Place ``page`` centered on a new A3 landscape page, scaled uniformly to fit."""
    src_w = float(page.mediabox.width)
    src_h = float(page.mediabox.height)
    inner_w = A3_LANDSCAPE_W - 2 * MARGIN_PT
    inner_h = A3_LANDSCAPE_H - 2 * MARGIN_PT
    scale = min(inner_w / src_w, inner_h / src_h)
    scaled_w = src_w * scale
    scaled_h = src_h * scale
    tx = MARGIN_PT + (inner_w - scaled_w) / 2
    ty = MARGIN_PT + (inner_h - scaled_h) / 2
    transform = Transformation().scale(scale, scale).translate(tx, ty)
    dest = writer.add_blank_page(width=A3_LANDSCAPE_W, height=A3_LANDSCAPE_H)
    dest.merge_transformed_page(page, transform)


def main() -> None:
    writer = PdfWriter()
    for name in files:
        path = base / name
        if not path.is_file():
            raise FileNotFoundError(path)
        reader = PdfReader(str(path))
        for page in reader.pages:
            _page_onto_a3(writer, page)

    out = base / "Factory-Data-Hub-Diagrams-Print.pdf"
    with open(out, "wb") as stream:
        writer.write(stream)
    print(
        "Merged",
        len(writer.pages),
        "A3 landscape pages (content fitted) ->",
        out,
    )


if __name__ == "__main__":
    main()
