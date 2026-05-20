import { Router } from "express";
import { WoodenController } from "../controllers/wooden.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/orders", requirePermission("orders:wood:view"), WoodenController.listOrders);
router.post("/orders", requirePermission("orders:wood:write"), WoodenController.createOrder);
router.get("/orders/:id", requirePermission("orders:wood:view"), WoodenController.getOrder);
router.put("/orders/:id", requirePermission("orders:wood:write"), WoodenController.updateOrder);
router.delete("/orders/:id", requirePermission("orders:wood:write"), WoodenController.deleteOrder);

router.post("/stages", requirePermission("orders:wood:write"), WoodenController.createStage);
router.get("/stages", requirePermission("orders:wood:view"), WoodenController.listStages);
router.get("/stages/summary", requirePermission("orders:wood:view"), WoodenController.getStagesSummary);
router.get("/stages/:id", requirePermission("orders:wood:view"), WoodenController.getStage);
router.put("/stages/:id", requirePermission("orders:wood:write"), WoodenController.updateStage);
router.delete("/stages/:id", requirePermission("orders:wood:write"), WoodenController.deleteStage);

router.get("/logs", requirePermission("orders:wood:view"), WoodenController.listLogs);
router.post("/logs", requirePermission("orders:wood:write"), WoodenController.createLog);
router.delete("/logs/:id", requirePermission("orders:wood:write"), WoodenController.deleteLog);

export default router;
