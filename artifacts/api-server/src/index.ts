import app from "./app";
import { logger } from "./lib/logger";
import { bootstrapAdminFromEnv } from "./bootstrap/authBootstrap";

void bootstrapAdminFromEnv().catch((e) => {
  logger.error({ err: e }, "bootstrapAdminFromEnv failed");
});

/** Default matches `apps/web`, DevTools docs, and `artifacts/api-server/.env.example`. */
const rawPort = process.env["PORT"] ?? "8787";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
