import type { Request, Response } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

export class HealthController {
  static check(req: Request, res: Response) {
    const data = HealthCheckResponse.parse({ status: "ok" });
    res.json(data);
  }
}
