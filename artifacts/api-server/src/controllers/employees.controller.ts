import type { Request, Response } from "express";
import { EmployeesService } from "../services/employees.service";

export class EmployeesController {
  static async listEmployees(req: Request, res: Response) {
    try {
      const { department_id, role, factory_id, search, redact } = req.query;
      const employees = await EmployeesService.listEmployees({
        departmentId: department_id as string | undefined,
        role: role as string | undefined,
        factoryId: factory_id as string | undefined,
        search: search as string | undefined,
        redact: redact === "true",
      });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  }

  static async getStats(req: Request, res: Response) {
    try {
      const stats = await EmployeesService.getRosterStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee stats" });
    }
  }

  static async getHeadcount(req: Request, res: Response) {
    try {
      const headcount = await EmployeesService.getHeadcount();
      res.json(headcount);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch headcount" });
    }
  }

  static async exportCsv(req: Request, res: Response) {
    try {
      const { department_id, role, factory_id, search, redact } = req.query;
      const csv = await EmployeesService.exportCsv({
        departmentId: department_id as string | undefined,
        role: role as string | undefined,
        factoryId: factory_id as string | undefined,
        search: search as string | undefined,
        redact: redact === "true",
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=employees.csv");
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export employees" });
    }
  }
}
