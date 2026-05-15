import type { Request, Response } from "express";
import { PerformanceService } from "../services/performance.service";

export class PerformanceController {
  static async departments(req: Request, res: Response): Promise<void> {
    try {
      const rows = await PerformanceService.departmentsFromCapacity(req.auth);
      const throughput = await PerformanceService.throughputTotals();
      res.json({ departments: rows, throughput });
    } catch {
      res.status(500).json({ error: "Failed to load department performance" });
    }
  }

  static async people(req: Request, res: Response): Promise<void> {
    try {
      const raw = req.query["limit"];
      const parsed = typeof raw === "string" ? Number.parseInt(raw, 10) : 80;
      const limit = Number.isFinite(parsed) ? parsed : 80;
      const rows = await PerformanceService.peopleActivity(req.auth, Math.min(Math.max(limit, 1), 200));
      res.json({ people: rows });
    } catch {
      res.status(500).json({ error: "Failed to load people performance" });
    }
  }
}
