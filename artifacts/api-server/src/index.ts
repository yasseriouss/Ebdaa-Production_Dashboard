import app from "./app";
import { logger } from "./lib/logger";
import { bootstrapAdminFromEnv } from "./bootstrap/authBootstrap";

void bootstrapAdminFromEnv().catch((e) => {
  logger.error({ err: e }, "bootstrapAdminFromEnv failed");
});

/** Default matches `apps/web` Vite proxy, DevTools docs, and `artifacts/api-server/.env.example`. */
const rawPort = process.env["PORT"] ?? "8788";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EADDRINUSE") {
      logger.error(
        { err, port },
        `Port ${port} is already in use — stop the other process or set PORT to a free port`,
      );
    } else {
      logger.error({ err, port }, "Error listening on port");
    }
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
