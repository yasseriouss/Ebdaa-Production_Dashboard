import type { NextFunction, Request, Response } from "express";
import { recordMutationAudit } from "../services/audit.service";

const SKIP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function extractIp(req: Request): string | null {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0]?.trim() ?? null;
  return req.socket.remoteAddress ?? null;
}

function summarizeBody(body: unknown): string | null {
  if (body === undefined || body === null) return null;
  if (typeof body !== "object") return String(body).slice(0, 500);
  const keys = Object.keys(body as object);
  return JSON.stringify({
    keys: keys.slice(0, 40),
    keyCount: keys.length,
  }).slice(0, 900);
}

function inferResourceType(urlPath: string): string | null {
  const parts = urlPath.split("/").filter(Boolean);
  const i = parts.indexOf("api");
  const segs = i >= 0 ? parts.slice(i + 1) : parts;
  if (segs.length === 0) return null;
  return segs.slice(0, 3).join("/") || segs[0] || null;
}

function inferResourceId(urlPath: string): string | null {
  const parts = urlPath.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  if (!last || last === "api") return null;
  if (/^[a-zA-Z0-9_-]{6,120}$/.test(last)) return last;
  return null;
}

/**
 * يسجّل طلبات التعديل فقط (POST/PUT/PATCH/DELETE) بعد اكتمال الاستجابة.
 * لا يوقف الطلب عند فشل الإدراج في السجل.
 */
export function mutationAuditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env["AUDIT_HTTP_DISABLED"] === "true") {
    next();
    return;
  }
  if (SKIP_METHODS.has(req.method)) {
    next();
    return;
  }
  const pathOnly = (req.originalUrl ?? req.url ?? "").split("?")[0] ?? "";
  if (pathOnly.includes("healthz")) {
    next();
    return;
  }

  res.on("finish", () => {
    void recordMutationAudit({
      occurredAt: new Date().toISOString(),
      actorUserId: req.auth.kind === "user" ? req.auth.userId : null,
      actorLabel: req.auth.kind === "user" ? req.auth.email : "guest",
      actorEmployeeId: req.auth.kind === "user" ? req.auth.employeeId : null,
      departmentId: null,
      action: `${req.method} ${res.statusCode}`,
      resourceType: inferResourceType(pathOnly),
      resourceId: inferResourceId(pathOnly),
      route: pathOnly,
      method: req.method,
      statusCode: res.statusCode,
      ip: extractIp(req),
      userAgent: typeof req.headers["user-agent"] === "string" ? req.headers["user-agent"] : null,
      payloadSummary: summarizeBody(req.body),
    });
  });

  next();
}
