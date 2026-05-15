import type { RequestAuth } from "../lib/requestAuth";

declare global {
  namespace Express {
    interface Request {
      auth: RequestAuth;
    }
  }
}

export {};
