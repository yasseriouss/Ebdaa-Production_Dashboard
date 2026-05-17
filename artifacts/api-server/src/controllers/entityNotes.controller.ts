import type { Request, Response } from "express";
import { z } from "zod";
import {
  EntityNotesService,
  ENTITY_NOTE_TYPES,
  type EntityNoteType,
} from "../services/entityNotes.service";

function paramId(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

const entityTypeZ = z.enum(ENTITY_NOTE_TYPES as unknown as [EntityNoteType, ...EntityNoteType[]]);

const listQuery = z.object({
  entityType: entityTypeZ,
  entityId: z.string().min(1),
});

const createBody = z.object({
  entityType: entityTypeZ,
  entityId: z.string().min(1),
  body: z.string().min(1).max(12_000),
});

const updateBody = z.object({
  body: z.string().min(1).max(12_000),
});

function handleError(res: Response, error: unknown) {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "validation_error", details: error.flatten() });
    return;
  }
  const st = (error as Error & { status?: number }).status;
  if (st === 403 || st === 404) {
    res.status(st).json({ error: (error as Error).message });
    return;
  }
  console.error(error);
  res.status(500).json({ error: "entity_notes_failed" });
}

export class EntityNotesController {
  static async list(req: Request, res: Response) {
    try {
      const q = listQuery.parse(req.query);
      const notes = await EntityNotesService.listNotes(
        q.entityType,
        q.entityId,
        req.auth,
      );
      res.json({ notes });
    } catch (e) {
      handleError(res, e);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const body = createBody.parse(req.body);
      const note = await EntityNotesService.createNote(
        body.entityType,
        body.entityId,
        body.body,
        req.auth,
      );
      res.status(201).json({ note });
    } catch (e) {
      handleError(res, e);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = paramId(req.params.id);
      if (!id) {
        res.status(400).json({ error: "missing_id" });
        return;
      }
      const body = updateBody.parse(req.body);
      const note = await EntityNotesService.updateNote(id, body.body, req.auth);
      res.json({ note });
    } catch (e) {
      handleError(res, e);
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const id = paramId(req.params.id);
      if (!id) {
        res.status(400).json({ error: "missing_id" });
        return;
      }
      await EntityNotesService.deleteNote(id, req.auth);
      res.status(204).send();
    } catch (e) {
      handleError(res, e);
    }
  }
}
