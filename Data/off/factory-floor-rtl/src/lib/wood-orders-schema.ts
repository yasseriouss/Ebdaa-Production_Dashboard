import { z } from "zod";

export const routingStageSchema = z.object({
  department: z.string(),
  qty_passed: z.number(),
  qty_required: z.number().optional(),
});

const dateField = z
  .string()
  .transform((s) => {
    const t = s?.trim();
    if (!t || t.toLowerCase() === "nan") return null;
    const d = new Date(t);
    return Number.isNaN(d.getTime()) ? null : d;
  });

export const workOrderSchema = z.object({
  work_order_id: z.string(),
  project_name: z.string(),
  product_name: z.string(),
  quantities: z.object({
    total_required: z.number(),
    completed: z.number(),
    remaining: z.number(),
  }),
  dates: z.object({
    receive_date: dateField,
    delivery_date: dateField,
  }),
  routing_progress: z.record(z.string(), routingStageSchema),
});

export const woodOrdersFileSchema = z.object({
  factory_id: z.string(),
  factory_name: z.string(),
  total_active_orders: z.number(),
  work_orders: z.array(workOrderSchema),
});

export type WoodOrdersFile = z.infer<typeof woodOrdersFileSchema>;
export type WorkOrderRaw = z.infer<typeof workOrderSchema>;
export type RoutingStageRaw = z.infer<typeof routingStageSchema>;
