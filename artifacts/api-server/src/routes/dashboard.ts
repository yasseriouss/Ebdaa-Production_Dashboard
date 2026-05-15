import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();

// Dashboard statistics
router.get("/stats", DashboardController.getStats);

// Gantt chart data
router.get("/gantt", DashboardController.getGanttData);

// Top clients
router.get("/clients", DashboardController.getClients);

// Completion trend (monthly)
router.get("/completion-trend", DashboardController.getCompletionTrend);

// Shared projects
router.get("/shared-projects", DashboardController.getSharedProjects);

export default router;
