import { Router } from "express";
import { EmployeesController } from "../controllers/employees.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/", requirePermission("employees:view"), EmployeesController.listEmployees);
router.get("/stats", requirePermission("employees:view"), EmployeesController.getStats);
router.get("/headcount", requirePermission("employees:view"), EmployeesController.getHeadcount);

export default router;
