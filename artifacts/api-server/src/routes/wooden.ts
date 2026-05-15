import { Router } from "express";
import { WoodenController } from "../controllers/wooden.controller";

const router = Router();

// List wooden work orders
router.get("/orders", WoodenController.listOrders);

// Create wooden work order
router.post("/orders", WoodenController.createOrder);

// Get single wooden order with stages
router.get("/orders/:id", WoodenController.getOrder);

// Update wooden work order
router.put("/orders/:id", WoodenController.updateOrder);

// Delete wooden work order
router.delete("/orders/:id", WoodenController.deleteOrder);

// Create wooden stage (manual)
router.post("/stages", WoodenController.createStage);

// List wooden stages
router.get("/stages", WoodenController.listStages);

// Stage bottleneck summary (before /stages/:id)
router.get("/stages/summary", WoodenController.getStagesSummary);

// Get single wooden stage
router.get("/stages/:id", WoodenController.getStage);

// Update wooden stage
router.put("/stages/:id", WoodenController.updateStage);

// Delete wooden stage
router.delete("/stages/:id", WoodenController.deleteStage);

export default router;
