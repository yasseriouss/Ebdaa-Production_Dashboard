/** Snapshot of `Data/wood_work_orders.json` — replace `src/data/wood_work_orders.json` when the export updates. */
import raw from "@/data/wood_work_orders.json";
import { woodOrdersFileSchema } from "@/lib/wood-orders-schema";

export const PARSED_WOOD_ORDERS = woodOrdersFileSchema.parse(raw);
