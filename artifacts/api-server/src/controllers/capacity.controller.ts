import type { Request, Response } from "express";
import { CapacityService } from "../services/capacity.service";

export class CapacityController {
  static async listMachines(req: Request, res: Response) {
    try {
      const rows = await CapacityService.listMachinesWithDepartments(req.auth);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch capacity machines" });
    }
  }
}
