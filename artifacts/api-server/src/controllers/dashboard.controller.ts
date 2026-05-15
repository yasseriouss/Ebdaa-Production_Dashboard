import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import { GetDashboardGanttQueryParams } from "@workspace/api-zod";

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  }

  static async getGanttData(req: Request, res: Response) {
    try {
      const query = GetDashboardGanttQueryParams.parse(req.query);
      const data = await DashboardService.getGanttData(query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gantt data" });
    }
  }

  static async getClients(req: Request, res: Response) {
    try {
      const clients = await DashboardService.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client stats" });
    }
  }

  static async getCompletionTrend(req: Request, res: Response) {
    try {
      const trend = await DashboardService.getCompletionTrend();
      res.json(trend);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch completion trend" });
    }
  }

  static async getSharedProjects(req: Request, res: Response) {
    try {
      const shared = await DashboardService.getSharedProjects();
      res.json(shared);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shared projects" });
    }
  }
}
