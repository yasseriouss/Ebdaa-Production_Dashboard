/**
 * Embeds public/ebdaa-logo.png as raster inside SVG files (PNG-as-SVG).
 * Writes public/favicon.svg and public/icons.svg
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");

const candidates = ["ebdaa-logo.png", "company-logo.png"];
let pngPath;
let sourceName;
for (const name of candidates) {
  const p = path.join(publicDir, name);
  if (fs.existsSync(p)) {
    pngPath = p;
    sourceName = name;
    break;
  }
}
if (!pngPath) {
  throw new Error(
    `No logo PNG in ${publicDir}. Add one of: ${candidates.join(", ")}`,
  );
}

const png = fs.readFileSync(pngPath);
if (png[0] !== 0x89 || png[1] !== 0x50 || png[2] !== 0x4e || png[3] !== 0x47) {
  throw new Error(`Not a PNG file: ${pngPath}`);
}
const w = png.readUInt32BE(16);
const h = png.readUInt32BE(20);
const b64 = png.toString("base64");
const dataUri = `data:image/png;base64,${b64}`;

const raster = `<image width="${w}" height="${h}" href="${dataUri}" preserveAspectRatio="xMidYMid meet"/>`;

const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" role="img" aria-label="Ebdaa logo">
  ${raster}
</svg>
`;

const iconsSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <symbol id="ebdaa-logo" viewBox="0 0 ${w} ${h}">
    ${raster}
  </symbol>
</svg>
`;

fs.writeFileSync(path.join(publicDir, "favicon.svg"), faviconSvg, "utf8");
fs.writeFileSync(path.join(publicDir, "icons.svg"), iconsSvg, "utf8");

console.log(`Wrote favicon.svg and icons.svg (${w}×${h}) from ${sourceName}`);
