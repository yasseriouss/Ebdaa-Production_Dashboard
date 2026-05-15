import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken, hasJwtSecret } from "../lib/authToken";
import { loadAuthenticatedUser } from "../services/authIdentity.service";
import { DEFAULT_ANONYMOUS_AUTH, restrictedAnonymousAuth } from "../lib/requestAuth";
import { logger } from "../lib/logger";

function resolveAnonymous() {
  const strict = process.env["AUTH_ANONYMOUS_UNRESTRICTED"] === "false";
  if (strict) return restrictedAnonymousAuth();
  return DEFAULT_ANONYMOUS_AUTH;
}

/**
 * يضبط `req.auth` من `Authorization: Bearer` عند توفر `JWT_SECRET`؛ وإلا يبقى ضيفاً.
 */
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (hasJwtSecret()) {
      const header = req.headers.authorization;
      if (typeof header === "string" && header.startsWith("Bearer ")) {
        const token = header.slice("Bearer ".length).trim();
        if (token.length > 0) {
          try {
            const { sub } = await verifyAccessToken(token);
            const user = await loadAuthenticatedUser(sub);
            if (user) {
              req.auth = user;
              next();
              return;
            }
          } catch (e) {
            logger.warn({ err: e }, "JWT verification or user load failed");
          }
        }
      }
    }
    req.auth = resolveAnonymous();
    next();
  } catch (e) {
    logger.error({ err: e }, "optionalAuthMiddleware");
    req.auth = resolveAnonymous();
    next();
  }
}
