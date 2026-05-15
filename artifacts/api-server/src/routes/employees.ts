import { Router } from "express";
import { EmployeesController } from "../controllers/employees.controller";

const router = Router();

router.get("/", EmployeesController.listEmployees);
router.get("/stats", EmployeesController.getStats);
router.get("/headcount", EmployeesController.getHeadcount);

export default router;
