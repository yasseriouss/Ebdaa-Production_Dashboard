import type { Request, Response } from "express";
import { MetalService } from "../services/metal.service";
import {
  ListMetalOrdersQueryParams,
  CreateMetalOrderBody,
  UpdateMetalOrderBody,
  ListMetalStagesQueryParams,
  UpdateMetalStageBody,
  CreateMetalStageBody,
} from "@workspace/api-zod";

function errStatus(e: unknown): number | undefined {
  if (e !== null && typeof e === "object" && "status" in e && typeof (e as { status: unknown }).status === "number") {
    return (e as { status: number }).status;
  }
  return undefined;
}

export class MetalController {
  static async listOrders(req: Request, res: Response) {
    try {
      const query = ListMetalOrdersQueryParams.parse(req.query);
      const orders = await MetalService.listOrders(query, req.auth);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal orders" });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const body = CreateMetalOrderBody.parse(req.body);
      const order = await MetalService.createOrder(body, req.auth);
      res.status(201).json(order);
    } catch (error) {
      const st = errStatus(error);
      if (st === 403) {
        res.status(403).json({ error: String((error as Error).message) });
        return;
      }
      res.status(500).json({ error: "Failed to create metal order" });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await MetalService.getOrder(id, req.auth);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal order" });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = UpdateMetalOrderBody.parse(req.body);
      const order = await MetalService.updateOrder(id, body, req.auth);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      const st = errStatus(error);
      if (st === 403) {
        res.status(403).json({ error: String((error as Error).message) });
        return;
      }
      res.status(500).json({ error: "Failed to update metal order" });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await MetalService.deleteOrder(id, req.auth);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete metal order" });
    }
  }

  static async getStagesSummary(req: Request, res: Response) {
    try {
      const summary = await MetalService.getStagesSummary(req.auth);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stage summary" });
    }
  }

  static async listStages(req: Request, res: Response) {
    try {
      const query = ListMetalStagesQueryParams.parse(req.query);
      const stages = await MetalService.listStages(
        {
          moNumber: query.moNumber ? String(query.moNumber) : undefined,
          stageName: query.stageName ? String(query.stageName) : undefined,
        },
        req.auth,
      );
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal stages" });
    }
  }

  static async createStage(req: Request, res: Response) {
    try {
      const body = CreateMetalStageBody.parse(req.body);
      const stage = await MetalService.createStage(body, req.auth);
      res.status(201).json(stage);
    } catch (error) {
      const st = errStatus(error);
      if (st === 403) {
        res.status(403).json({ error: String((error as Error).message) });
        return;
      }
      res.status(500).json({ error: "Failed to create metal stage" });
    }
  }

  static async getStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const stage = await MetalService.getStage(id, req.auth);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal stage" });
    }
  }

  static async updateStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = UpdateMetalStageBody.parse(req.body);
      const stage = await MetalService.updateStage(id, body, req.auth);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update metal stage" });
    }
  }

  static async deleteStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const stage = await MetalService.deleteStage(id, req.auth);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete metal stage" });
    }
  }
}
