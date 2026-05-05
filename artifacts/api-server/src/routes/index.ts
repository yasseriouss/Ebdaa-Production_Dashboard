import { Router, type IRouter } from "express";
import healthRouter from "./health";
import metalRouter from "./metal";
import woodenRouter from "./wooden";
import dashboardRouter from "./dashboard";
import sharedProjectsRouter from "./sharedProjects";
import importExportRouter from "./importExport";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/metal", metalRouter);
router.use("/wooden", woodenRouter);
router.use("/dashboard", dashboardRouter);
router.use("/shared-projects", sharedProjectsRouter);
router.use("/import", importExportRouter);
router.use("/export", importExportRouter);

export default router;
