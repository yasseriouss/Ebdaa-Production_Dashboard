import { Router } from "express";
import { CapacityController } from "../controllers/capacity.controller";

const router = Router();

router.get("/machines", CapacityController.listMachines);

export default router;
