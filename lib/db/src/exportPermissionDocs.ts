import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PERMISSION_CATALOG,
  ROLE_PRESETS,
  PERMISSION_MODULES_ORDER,
} from "./permissionCatalog";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");

function mdEscape(s: string): string {
  return s.replace(/\|/g, "\\|");
}

function buildMarkdown(): string {
  const lines: string[] = [];
  lines.push("# مرجع الصلاحيات والأدوار (Factory Data Hub)");
  lines.push("");
  lines.push("يُحدَّث هذا الملف من كود المصدر عبر `npm run export-permission-docs` داخل `lib/db`.");
  lines.push("");
  lines.push("## جدول كل الصلاحيات");
  lines.push("");
  lines.push("| المفتاح | الوحدة | الاسم بالعربية | الوصف |");
  lines.push("|--------|--------|-----------------|-------|");
  const moduleOrder = [...PERMISSION_MODULES_ORDER];
  const modIdx = (m: string) => {
    const i = moduleOrder.indexOf(m as (typeof PERMISSION_MODULES_ORDER)[number]);
    return i === -1 ? 999 : i;
  };
  const sorted = [...PERMISSION_CATALOG].sort(
    (a, b) => modIdx(a.module) - modIdx(b.module) || a.key.localeCompare(b.key),
  );
  for (const p of sorted) {
    lines.push(
      `| \`${mdEscape(p.key)}\` | ${mdEscape(p.moduleLabelAr)} | ${mdEscape(p.labelAr)} | ${mdEscape(p.descriptionAr)} |`,
    );
  }
  lines.push("");
  lines.push("## الأدوار الافتراضية وصلاحيات كل دور");
  lines.push("");
  for (const role of ROLE_PRESETS) {
    lines.push(`### ${role.labelAr} (\`${role.slug}\`)`);
    lines.push("");
    lines.push(`- **الاسم الإنجليزي:** ${role.labelEn}`);
    lines.push(`- **عدد الصلاحيات:** ${role.permissionKeys.length}`);
    lines.push("");
    lines.push("المفاتيح:");
    lines.push("");
    for (const k of role.permissionKeys) {
      lines.push(`- \`${k}\``);
    }
    lines.push("");
  }
  lines.push("## المستخدمون وتعيين الأدوار");
  lines.push("");
  lines.push(
    "بعد تشغيل `npm run seed-permissions` يُنشأ مستخدم تجريبي **demo@factory.local** بدور **مدير النظام الأعلى** لعرض النموذج في لوحة «توزيع الصلاحيات». عند إضافة مستخدمين حقيقيين يظهرون في جدول المستخدمين مع الأدوار المعيَّنة لكل منهم.",
  );
  lines.push("");
  return lines.join("\n");
}

function main(): void {
  const md = buildMarkdown();
  const mdPath = path.join(repoRoot, "docs", "PERMISSIONS_REFERENCE_AR.md");
  mkdirSync(path.dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, md, "utf8");

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    catalog: PERMISSION_CATALOG,
    roles: ROLE_PRESETS.map((r) => ({
      slug: r.slug,
      labelAr: r.labelAr,
      labelEn: r.labelEn,
      permissionKeys: [...r.permissionKeys],
    })),
  };
  const jsonPath = path.join(repoRoot, "apps", "web", "public", "permissions-reference.json");
  mkdirSync(path.dirname(jsonPath), { recursive: true });
  writeFileSync(jsonPath, `${JSON.stringify(jsonPayload, null, 2)}\n`, "utf8");

  console.log("Wrote:", mdPath);
  console.log("Wrote:", jsonPath);
}

main();
