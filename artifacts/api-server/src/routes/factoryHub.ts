import { Router } from "express";
import { FactoryHubController } from "../controllers/factoryHub.controller";

const router = Router();

router.get("/wood-work-orders", FactoryHubController.listWoodWorkOrders);
router.post("/wood-work-orders", FactoryHubController.createWoodWorkOrder);
router.get("/wood-work-orders/:workOrderId", FactoryHubController.getWoodWorkOrder);
router.put("/wood-work-orders/:workOrderId", FactoryHubController.updateWoodWorkOrder);
router.delete("/wood-work-orders/:workOrderId", FactoryHubController.deleteWoodWorkOrder);

router.get("/reference/:key", FactoryHubController.getReference);
router.put("/reference/:key", FactoryHubController.putReference);

router.get("/work-order-analysis-sessions", FactoryHubController.listAnalysisSessions);
router.post("/work-order-analysis-sessions", FactoryHubController.createAnalysisSession);
router.get("/work-order-analysis-sessions/:id", FactoryHubController.getAnalysisSession);
router.put("/work-order-analysis-sessions/:id", FactoryHubController.updateAnalysisSession);
router.delete("/work-order-analysis-sessions/:id", FactoryHubController.deleteAnalysisSession);

router.get("/new-project-autosave", FactoryHubController.getNewProjectAutosave);
router.put("/new-project-autosave", FactoryHubController.putNewProjectAutosave);

router.post("/seed", FactoryHubController.seed);

export default router;
