import { Router, type IRouter } from "express";
import healthRouter from "./health";
import metalRouter from "./metal";
import woodenRouter from "./wooden";
import dashboardRouter from "./dashboard";
import sharedProjectsRouter from "./sharedProjects";
import importExportRouter from "./importExport";
import employeesRouter from "./employees";
import capacityRouter from "./capacity";
import factoryHubRouter from "./factoryHub";
import { EmployeesController } from "../controllers/employees.controller";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/metal", metalRouter);
router.use("/wooden", woodenRouter);
router.use("/dashboard", dashboardRouter);
router.use("/shared-projects", sharedProjectsRouter);
router.use("/employees", employeesRouter);
router.use("/import", importExportRouter);
router.use("/export", importExportRouter);
router.use("/capacity", capacityRouter);
router.use("/factory-hub", factoryHubRouter);
router.get("/export/employees", EmployeesController.exportCsv);

export default router;
