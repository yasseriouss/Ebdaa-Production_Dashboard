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

export class MetalController {
  static async listOrders(req: Request, res: Response) {
    try {
      const query = ListMetalOrdersQueryParams.parse(req.query);
      const orders = await MetalService.listOrders(query);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal orders" });
    }
  }

  static async createOrder(req: Request, res: Response) {
    try {
      const body = CreateMetalOrderBody.parse(req.body);
      const order = await MetalService.createOrder(body);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to create metal order" });
    }
  }

  static async getOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await MetalService.getOrder(id);
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
      const order = await MetalService.updateOrder(id, body);
      if (!order) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update metal order" });
    }
  }

  static async deleteOrder(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const order = await MetalService.deleteOrder(id);
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
      const summary = await MetalService.getStagesSummary();
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stage summary" });
    }
  }

  static async listStages(req: Request, res: Response) {
    try {
      const query = ListMetalStagesQueryParams.parse(req.query);
      const stages = await MetalService.listStages(query);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch metal stages" });
    }
  }

  static async createStage(req: Request, res: Response) {
    try {
      const body = CreateMetalStageBody.parse(req.body);
      const stage = await MetalService.createStage(body);
      res.status(201).json(stage);
    } catch (error) {
      res.status(500).json({ error: "Failed to create metal stage" });
    }
  }

  static async getStage(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const stage = await MetalService.getStage(id);
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
      const stage = await MetalService.updateStage(id, body);
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
      const stage = await MetalService.deleteStage(id);
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
