import { Font } from "@react-pdf/renderer";

const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

let registered = false;

/** Registers Noto Sans Arabic (bundled in public/fonts) for RTL PDF text. */
export function ensurePdfFonts(): void {
  if (registered) return;
  const fontUrl = `${base}/fonts/NotoSansArabic-Variable.ttf`;
  Font.register({
    family: "NotoArabic",
    fonts: [{ src: fontUrl, fontWeight: "normal" }],
  });
  registered = true;
}

export const PDF_FONT_FAMILY = "NotoArabic";
