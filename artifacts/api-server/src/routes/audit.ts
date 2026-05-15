import { Router } from "express";
import { AuditController } from "../controllers/audit.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get(
  "/audit-events",
  requirePermission("audit:view"),
  AuditController.list,
);

export default router;
