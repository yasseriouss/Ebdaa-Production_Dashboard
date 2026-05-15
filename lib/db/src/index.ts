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

const client = createClient({ url });

export const db = drizzle(client, { schema });

export { getLibsqlUrl } from "./libsql-url";
export * from "./schema";
