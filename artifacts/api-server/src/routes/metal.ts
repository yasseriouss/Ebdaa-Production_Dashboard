import { Router } from "express";
import { MetalController } from "../controllers/metal.controller";

const router = Router();

// List metal work orders
router.get("/orders", MetalController.listOrders);

// Create metal work order
router.post("/orders", MetalController.createOrder);

// Get single metal order with stages
router.get("/orders/:id", MetalController.getOrder);

// Update metal work order
router.put("/orders/:id", MetalController.updateOrder);

// Delete metal work order
router.delete("/orders/:id", MetalController.deleteOrder);

// Stage bottleneck summary
router.get("/stages/summary", MetalController.getStagesSummary);

// List metal stages
router.get("/stages", MetalController.listStages);

// Create metal stage (manual)
router.post("/stages", MetalController.createStage);

// Get single metal stage
router.get("/stages/:id", MetalController.getStage);

// Update metal stage
router.put("/stages/:id", MetalController.updateStage);

// Delete metal stage
router.delete("/stages/:id", MetalController.deleteStage);

export default router;
