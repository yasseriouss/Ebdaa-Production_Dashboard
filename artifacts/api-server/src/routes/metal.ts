import { Router } from "express";
import { MetalController } from "../controllers/metal.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/orders", requirePermission("orders:metal:view"), MetalController.listOrders);
router.post("/orders", requirePermission("orders:metal:write"), MetalController.createOrder);
router.get("/orders/:id", requirePermission("orders:metal:view"), MetalController.getOrder);
router.put("/orders/:id", requirePermission("orders:metal:write"), MetalController.updateOrder);
router.delete("/orders/:id", requirePermission("orders:metal:write"), MetalController.deleteOrder);

router.get("/stages/summary", requirePermission("orders:metal:view"), MetalController.getStagesSummary);
router.get("/stages", requirePermission("orders:metal:view"), MetalController.listStages);
router.post("/stages", requirePermission("orders:metal:write"), MetalController.createStage);
router.get("/stages/:id", requirePermission("orders:metal:view"), MetalController.getStage);
router.put("/stages/:id", requirePermission("orders:metal:write"), MetalController.updateStage);
router.delete("/stages/:id", requirePermission("orders:metal:write"), MetalController.deleteStage);

router.get("/logs", requirePermission("orders:metal:view"), MetalController.listLogs);
router.post("/logs", requirePermission("orders:metal:write"), MetalController.createLog);
router.delete("/logs/:id", requirePermission("orders:metal:write"), MetalController.deleteLog);

export default router;
