import { Router } from "express";
import { PerformanceController } from "../controllers/performance.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get(
  "/departments",
  requirePermission("performance:departments:view"),
  PerformanceController.departments,
);
router.get(
  "/people",
  requirePermission("performance:people:view"),
  PerformanceController.people,
);

export default router;
