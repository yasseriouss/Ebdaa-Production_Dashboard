import { defineConfig } from "drizzle-kit";
import { getLibsqlUrl } from "./src/libsql-url";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: getLibsqlUrl(),
  },
});
