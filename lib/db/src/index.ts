import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { getLibsqlUrl } from "./libsql-url";

const url = getLibsqlUrl();

if (process.env.NODE_ENV !== "production") {
  console.log("[DB] LibSQL url:", url);
} else {
  console.log("[DB] LibSQL initialized");
}

const authToken = process.env.LIBSQL_AUTH_TOKEN?.trim() || undefined;
const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });

export { getLibsqlUrl } from "./libsql-url";
export * from "./schema";
export * from "./permissionCatalog";
export { eq, and, or, inArray, sql, desc, gte, isNull, like, ilike } from "drizzle-orm";
export type { SQL } from "drizzle-orm";
