import { Router } from "express";
import multer from "multer";
import { registerImportExportRoutes } from "../services/importExport.service";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

registerImportExportRoutes(router, upload);

export default router;
