import { Router } from "express";
import { FactoryHubController } from "../controllers/factoryHub.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get(
  "/wood-work-orders",
  requirePermission("factory_hub:wood:read"),
  FactoryHubController.listWoodWorkOrders,
);
router.post(
  "/wood-work-orders",
  requirePermission("factory_hub:wood:write"),
  FactoryHubController.createWoodWorkOrder,
);
router.get(
  "/wood-work-orders/:workOrderId",
  requirePermission("factory_hub:wood:read"),
  FactoryHubController.getWoodWorkOrder,
);
router.put(
  "/wood-work-orders/:workOrderId",
  requirePermission("factory_hub:wood:write"),
  FactoryHubController.updateWoodWorkOrder,
);
router.delete(
  "/wood-work-orders/:workOrderId",
  requirePermission("factory_hub:wood:write"),
  FactoryHubController.deleteWoodWorkOrder,
);

router.get(
  "/reference/:key",
  requirePermission("factory_hub:reference:read"),
  FactoryHubController.getReference,
);
router.put(
  "/reference/:key",
  requirePermission("factory_hub:reference:write"),
  FactoryHubController.putReference,
);

router.get(
  "/work-order-analysis-sessions",
  requirePermission("factory_hub:analysis:read"),
  FactoryHubController.listAnalysisSessions,
);
router.post(
  "/work-order-analysis-sessions",
  requirePermission("factory_hub:analysis:write"),
  FactoryHubController.createAnalysisSession,
);
router.get(
  "/work-order-analysis-sessions/:id",
  requirePermission("factory_hub:analysis:read"),
  FactoryHubController.getAnalysisSession,
);
router.put(
  "/work-order-analysis-sessions/:id",
  requirePermission("factory_hub:analysis:write"),
  FactoryHubController.updateAnalysisSession,
);
router.delete(
  "/work-order-analysis-sessions/:id",
  requirePermission("factory_hub:analysis:write"),
  FactoryHubController.deleteAnalysisSession,
);

router.get(
  "/new-project-autosave",
  requirePermission("factory_hub:project_autosave:read"),
  FactoryHubController.getNewProjectAutosave,
);
router.put(
  "/new-project-autosave",
  requirePermission("factory_hub:project_autosave:write"),
  FactoryHubController.putNewProjectAutosave,
);

router.post("/seed", FactoryHubController.seed);

export default router;
