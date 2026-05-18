import type { Request, Response } from "express";
import { z } from "zod";
import {
  GetFhWoodWorkOrderParams,
  UpdateFhWoodWorkOrderParams,
  DeleteFhWoodWorkOrderParams,
  GetFhReferenceSnapshotParams,
  PutFhReferenceSnapshotParams,
  GetFhAnalysisSessionParams,
  UpdateFhAnalysisSessionParams,
  DeleteFhAnalysisSessionParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";
import { FactoryHubService } from "../services/factoryHub.service";

function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

export class FactoryHubController {
  static async listWoodWorkOrders(req: Request, res: Response) {
    try {
      const rows = await FactoryHubService.listWoodWorkOrders(req.auth);
      res.json(rows);
    } catch (error) {
      logger.error({ err: error }, "listWoodWorkOrders failed");
      res.status(500).json({ error: "Failed to list wood work orders" });
    }
  }

  static async createWoodWorkOrder(req: Request, res: Response) {
    try {
      const row = await FactoryHubService.upsertWoodWorkOrder(undefined, req.body, req.auth);
      res.status(201).json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      const status = (error as Error & { status?: number }).status ?? 500;
      if (status === 403) {
        sendError(res, 403, String((error as Error).message));
        return;
      }
      const msg = status === 400 ? String((error as Error).message) : "Failed to create wood work order";
      res.status(status).json({ error: msg });
    }
  }

  static async getWoodWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId } = GetFhWoodWorkOrderParams.parse(req.params);
      const row = await FactoryHubService.getWoodWorkOrder(workOrderId, req.auth);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to get wood work order" });
    }
  }

  static async updateWoodWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId } = UpdateFhWoodWorkOrderParams.parse(req.params);
      const row = await FactoryHubService.upsertWoodWorkOrder(workOrderId, req.body, req.auth);
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      const status = (error as Error & { status?: number }).status ?? 500;
      if (status === 403) {
        sendError(res, 403, String((error as Error).message));
        return;
      }
      if (status === 404) {
        sendError(res, 404, "not_found");
        return;
      }
      const msg = status === 400 ? String((error as Error).message) : "Failed to update wood work order";
      res.status(status).json({ error: msg });
    }
  }

  static async deleteWoodWorkOrder(req: Request, res: Response) {
    try {
      const { workOrderId } = DeleteFhWoodWorkOrderParams.parse(req.params);
      const row = await FactoryHubService.deleteWoodWorkOrder(workOrderId, req.auth);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to delete wood work order" });
    }
  }

  static async getReference(req: Request, res: Response) {
    try {
      const { key } = GetFhReferenceSnapshotParams.parse(req.params);
      const row = await FactoryHubService.getReference(key);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to get reference snapshot" });
    }
  }

  static async putReference(req: Request, res: Response) {
    try {
      const { key } = PutFhReferenceSnapshotParams.parse(req.params);
      const row = await FactoryHubService.putReference(key, req.body);
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to save reference snapshot" });
    }
  }

  static async listAnalysisSessions(_req: Request, res: Response) {
    try {
      res.json(await FactoryHubService.listAnalysisSessions());
    } catch (error) {
      res.status(500).json({ error: "Failed to list analysis sessions" });
    }
  }

  static async createAnalysisSession(req: Request, res: Response) {
    try {
      const row = await FactoryHubService.createAnalysisSession(req.body);
      res.status(201).json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      const status = (error as Error & { status?: number }).status ?? 500;
      if (status === 409) {
        sendError(res, 409, "session_exists");
        return;
      }
      if (status === 400) {
        sendError(res, 400, String((error as Error).message));
        return;
      }
      res.status(500).json({ error: "Failed to create analysis session" });
    }
  }

  static async getAnalysisSession(req: Request, res: Response) {
    try {
      const { id } = GetFhAnalysisSessionParams.parse(req.params);
      const row = await FactoryHubService.getAnalysisSession(id);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to get analysis session" });
    }
  }

  static async updateAnalysisSession(req: Request, res: Response) {
    try {
      const { id } = UpdateFhAnalysisSessionParams.parse(req.params);
      const row = await FactoryHubService.updateAnalysisSession(id, req.body);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to update analysis session" });
    }
  }

  static async deleteAnalysisSession(req: Request, res: Response) {
    try {
      const { id } = DeleteFhAnalysisSessionParams.parse(req.params);
      const row = await FactoryHubService.deleteAnalysisSession(id);
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to delete analysis session" });
    }
  }

  static async getNewProjectAutosave(_req: Request, res: Response) {
    try {
      const row = await FactoryHubService.getNewProjectAutosave();
      if (!row) {
        sendError(res, 404, "not_found");
        return;
      }
      res.json(row);
    } catch (error) {
      res.status(500).json({ error: "Failed to load autosave" });
    }
  }

  static async putNewProjectAutosave(req: Request, res: Response) {
    try {
      const row = await FactoryHubService.putNewProjectAutosave(req.body);
      res.json(row);
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendError(res, 400, error.message);
        return;
      }
      res.status(500).json({ error: "Failed to save autosave" });
    }
  }

  static async seed(_req: Request, res: Response) {
    try {
      const result = await FactoryHubService.seedFromFixtures();
      res.json(result);
    } catch (error) {
      const status = (error as Error & { status?: number }).status ?? 500;
      if (status === 403) {
        sendError(res, 403, "seed_disabled");
        return;
      }
      res.status(500).json({ error: "Seed failed" });
    }
  }
}
