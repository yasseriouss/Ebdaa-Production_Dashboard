import { Router } from "express";
import { CapacityController } from "../controllers/capacity.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/machines", requirePermission("capacity:view"), CapacityController.listMachines);

export default router;
