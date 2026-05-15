import type { NextFunction, Request, Response } from "express";
import type { RequestAuth } from "../lib/requestAuth";

function hasPermission(auth: RequestAuth, key: string): boolean {
  if (auth.kind === "anonymous") {
    return auth.unrestricted;
  }
  return auth.permissionKeys.includes(key);
}

/** يتطلب مفتاح صلاحية. الضيف بلا قيود (`unrestricted`) يمرّ للتوافق مع التطوير. */
export function requirePermission(...keys: [string, ...string[]]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ok = keys.some((k) => hasPermission(req.auth, k));
    if (!ok) {
      res.status(403).json({ error: "forbidden", required: keys });
      return;
    }
    next();
  };
}

/** 401 إن لم يكن مستخدماً JWT (ليس ضيفاً). */
export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (req.auth.kind !== "user") {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
