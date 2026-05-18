import { eq } from "drizzle-orm";
import * as fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./index";
import { departmentsTable } from "./schema/factoryCapacity";
import { fhReferenceSnapshotsTable } from "./schema/factoryHub";
import { seedCapacity } from "./seedCapacity";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../../..");

/** Canonical display names keyed by department id. */
export const DEPARTMENT_NAME_SYNC: Record<string, string> = {
  DEPT_PANEL_PROC: "قسم المسطحات",
};

const LEGACY_DEPARTMENT_NAME = "قسم المسطحات والتشغيل الآلي";
const CANONICAL_DEPARTMENT_NAME = "قسم المسطحات";

export async function syncDepartmentDisplayNames() {
  let departmentsUpdated = 0;

  for (const [id, name] of Object.entries(DEPARTMENT_NAME_SYNC)) {
    const result = await db
      .update(departmentsTable)
      .set({ name })
      .where(eq(departmentsTable.id, id))
      .returning({ id: departmentsTable.id });
    departmentsUpdated += result.length;
  }

  const legacyRows = await db
    .update(departmentsTable)
    .set({ name: CANONICAL_DEPARTMENT_NAME })
    .where(eq(departmentsTable.name, LEGACY_DEPARTMENT_NAME))
    .returning({ id: departmentsTable.id });
  departmentsUpdated += legacyRows.length;

  let referenceSnapshotsUpdated = 0;
  const snapshots = await db.select().from(fhReferenceSnapshotsTable);
  for (const row of snapshots) {
    if (!row.payload.includes(LEGACY_DEPARTMENT_NAME)) continue;
    const payload = row.payload.split(LEGACY_DEPARTMENT_NAME).join(CANONICAL_DEPARTMENT_NAME);
    await db
      .update(fhReferenceSnapshotsTable)
      .set({ payload, updatedAt: new Date().toISOString() })
      .where(eq(fhReferenceSnapshotsTable.key, row.key));
    referenceSnapshotsUpdated += 1;
  }

  let referenceKeysWritten = 0;
  const bundlePath = path.join(
    repoRoot,
    "artifacts/api-server/src/data/referenceBundleSeed.json",
  );
  if (fs.existsSync(bundlePath)) {
    const refs = JSON.parse(fs.readFileSync(bundlePath, "utf8")) as Record<string, unknown>;
    const ts = new Date().toISOString();
    for (const [key, val] of Object.entries(refs)) {
      const json = JSON.stringify(val);
      await db
        .insert(fhReferenceSnapshotsTable)
        .values({ key, payload: json, updatedAt: ts })
        .onConflictDoUpdate({
          target: fhReferenceSnapshotsTable.key,
          set: { payload: json, updatedAt: ts },
        });
      referenceKeysWritten += 1;
    }
  }

  return { departmentsUpdated, referenceSnapshotsUpdated, referenceKeysWritten };
}

async function main() {
  console.log("Re-seeding capacity schema into departments/tasks...");
  await seedCapacity();

  const stats = await syncDepartmentDisplayNames();
  console.log(
    `Sync complete: ${stats.departmentsUpdated} department row(s), ` +
      `${stats.referenceSnapshotsUpdated} reference snapshot(s) patched, ` +
      `${stats.referenceKeysWritten} reference key(s) upserted from bundle.`,
  );
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
