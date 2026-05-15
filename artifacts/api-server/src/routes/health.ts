import { Router, type IRouter } from "express";
import { HealthController } from "../controllers/health.controller";

const router: IRouter = Router();

router.get("/healthz", HealthController.check);

export default router;
