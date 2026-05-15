import type { Request, Response } from "express";
import { WoodenService } from "../services/wooden.service";
import {
  ListWoodenOrdersQueryParams,
  CreateWoodenOrderBody,
  UpdateWoodenOrderBody,
  ListWoodenStagesQueryParams,
  UpdateWoodenStageBody,
  CreateWoodenStageBody,
} from "@workspace/api-zod";

export class WoodenController {
  static async listOrders(req: Request, res: Response) {
    try {
      const query = ListWoodenOrdersQueryParams.parse(req.query);
      const orders = await WoodenService.listOrders(query);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wooden orders" });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const body = CreateWoodenOrderBody.parse(req.body);
      const order = await WoodenService.createOrder(body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wooden order" });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await WoodenService.getOrder(id);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wooden order" });
    }
  }

  static async updateOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = UpdateWoodenOrderBody.parse(req.body);
      const order = await WoodenService.updateOrder(id, body);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wooden order" });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await WoodenService.deleteOrder(id);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wooden order" });
    }
  }

  static async listStages(req: Request, res: Response) {
    try {
      const query = ListWoodenStagesQueryParams.parse(req.query);
      const stages = await WoodenService.listStages({
        orderId: query.orderId ? String(query.orderId) : undefined,
      });
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wooden stages" });
    }
  }

  static async getStagesSummary(req: Request, res: Response) {
    try {
      const summary = await WoodenService.getStagesSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wooden stage summary" });
    }
  }

  static async createStage(req: Request, res: Response) {
    try {
      const body = CreateWoodenStageBody.parse(req.body);
      const stage = await WoodenService.createStage(body);
      res.status(201).json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to create wooden stage" });
    }
  }

  static async getStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const stage = await WoodenService.getStage(id);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wooden stage" });
    }
  }

  static async updateStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const body = UpdateWoodenStageBody.parse(req.body);
      const stage = await WoodenService.updateStage(id, body);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update wooden stage" });
    }
  }

  static async deleteStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const stage = await WoodenService.deleteStage(id);
      if (!stage) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete wooden stage" });
    }
  }
}
