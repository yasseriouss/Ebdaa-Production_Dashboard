import type { Request, Response } from "express";
import { listRecentAuditEvents } from "../services/audit.service";

export class AuditController {
  static async list(req: Request, res: Response): Promise<void> {
    try {
      const raw = req.query["limit"];
      const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : 50;
      const limit = Number.isFinite(parsed) ? parsed : 50;
      const rows = await listRecentAuditEvents(limit);
      res.json(rows);
    } catch {
      res.status(500).json({ error: "Failed to list audit events" });
    }
  }
}
