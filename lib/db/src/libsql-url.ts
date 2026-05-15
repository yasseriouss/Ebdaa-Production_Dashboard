import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const thisFile = fileURLToPath(import.meta.url);
const libDbPackageDir = path.resolve(path.dirname(thisFile), "..");
/** Default: repository root `local.db` (two levels up from `lib/db`). */
const defaultDatabaseFile = path.resolve(libDbPackageDir, "..", "..", "local.db");

/**
 * Resolves the LibSQL client URL.
 *
 * - `LIBSQL_URL` — use as-is (`file:...`, `libsql://...` for Turso, etc.).
 * - `SQLITE_FILE` — filesystem path (absolute or relative to `process.cwd()`); converted to a `file:` URL.
 * - Otherwise — `<monorepo-root>/local.db`.
 */
export function getLibsqlUrl(): string {
  const envUrl = process.env.LIBSQL_URL?.trim();
  if (envUrl) return envUrl;

  const sqliteFile = process.env.SQLITE_FILE?.trim();
  const fsPath = sqliteFile
    ? path.resolve(process.cwd(), sqliteFile)
    : defaultDatabaseFile;

  return pathToFileURL(fsPath).href;
}
