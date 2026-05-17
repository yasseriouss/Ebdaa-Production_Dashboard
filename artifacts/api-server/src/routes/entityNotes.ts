import { Router } from "express";
import { EntityNotesController } from "../controllers/entityNotes.controller";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

router.get("/entity-notes", requirePermission("entity_notes:read"), EntityNotesController.list);
router.post("/entity-notes", requirePermission("entity_notes:write"), EntityNotesController.create);
router.patch("/entity-notes/:id", requirePermission("entity_notes:write"), EntityNotesController.update);
router.delete("/entity-notes/:id", requirePermission("entity_notes:write"), EntityNotesController.remove);

export default router;
