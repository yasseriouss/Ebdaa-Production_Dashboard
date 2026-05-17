const fs = require("fs");
const path = require("path");

const dslPath = path.join(__dirname, "presentation-slides-layout.dsl");
let dslText = fs.readFileSync(dslPath, "utf8");
dslText = dslText
  .split(/\r?\n/)
  .filter((ln) => !ln.trimStart().startsWith("#"))
  .join("\n")
  .replace(/^\s+/, "\n");

const payload = {
  miro_url: "https://miro.com/app/board/uXjVHSF8IhA=/",
  dsl: dslText,
};

const outPath = path.join(__dirname, "invoke-layout-for-mcp.json");
fs.writeFileSync(outPath, JSON.stringify(payload), "utf8");
process.stdout.write(outPath + "\nbytes " + Buffer.byteLength(JSON.stringify(payload)));
