import type {
  WoodRoutingProgress,
  WoodWorkOrder,
  WoodWorkOrdersDataset,
  WorkOrderPriority,
} from "../types";

type RoutingSeed = Partial<Record<keyof WoodRoutingProgress, number>>;

function routing(seed: RoutingSeed = {}): WoodRoutingProgress {
  return {
    solid_wood: { department: "DEPT_SOLID_WOOD", qty_passed: seed.solid_wood ?? 0 },
    panel_saw: { department: "DEPT_PANEL_PROC", qty_passed: seed.panel_saw ?? 0 },
    edge_banding: { department: "DEPT_PANEL_PROC", qty_passed: seed.edge_banding ?? 0 },
    cnc_routing: { department: "DEPT_PANEL_PROC", qty_passed: seed.cnc_routing ?? 0 },
    upholstery: { department: "DEPT_UPHOLSTERY", qty_passed: seed.upholstery ?? 0 },
    painting: { department: "DEPT_WOOD_PAINT", qty_passed: seed.painting ?? 0 },
    assembly: { department: "DEPT_WOOD_ASSY", qty_passed: seed.assembly ?? 0 },
    packaging: { department: "DEPT_PACKAGING", qty_passed: seed.packaging ?? 0 },
  };
}

/**
 * Heuristic priority — the source JSON does not carry a priority field, so we
 * derive a sensible default based on remaining quantity and lateness. UI lets
 * supervisors override it.
 */
function derivePriority(
  remaining: number,
  deliveryDate: string,
): WorkOrderPriority {
  if (deliveryDate === "nan") return remaining > 0 ? "Normal" : "Low";
  const due = new Date(deliveryDate);
  if (Number.isNaN(due.getTime())) return "Normal";
  const now = new Date("2026-05-14");
  const dayDiff = (due.getTime() - now.getTime()) / 86400000;
  if (remaining === 0) return "Low";
  if (dayDiff < 0) return "Critical";
  if (dayDiff < 7) return "High";
  return "Normal";
}

const seed: Omit<WoodWorkOrder, "priority">[] = [
  {
    work_order_id: "WO-11269-0",
    project_name: "AZUR",
    product_name: "عود علفة مقاس 5*2.5*470 سم",
    client: "AZUR Residences",
    quantities: { total_required: 1200, completed: 1200, remaining: 0 },
    dates: { receive_date: "2026-04-19", delivery_date: "2026-04-21" },
    routing_progress: routing({ solid_wood: 1200, panel_saw: 1200, painting: 1200, assembly: 1200, packaging: 1200 }),
  },
  {
    work_order_id: "WO-11274-1",
    project_name: "AZUR",
    product_name: "تجاليد",
    client: "AZUR Residences",
    quantities: { total_required: 1, completed: 0, remaining: 1 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11134-2",
    project_name: "Finest Sales HQ",
    product_name: "Sales Workstation",
    client: "Finest Group",
    quantities: { total_required: 1, completed: 0, remaining: 1 },
    dates: { receive_date: "2025-10-22", delivery_date: "2025-10-30" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11255-3",
    project_name: "Four Seasons",
    product_name: "عود علفة موسكي طول 220×عرض 3 سم تخانة 22",
    client: "Four Seasons Hotels",
    quantities: { total_required: 250, completed: 250, remaining: 0 },
    dates: { receive_date: "2026-03-25", delivery_date: "2026-03-30" },
    routing_progress: routing({ solid_wood: 250, panel_saw: 250, painting: 250, assembly: 250, packaging: 250 }),
  },
  {
    work_order_id: "WO-11276-4",
    project_name: "HOTEL RIXOS",
    product_name: "دريسنيج",
    client: "RIXOS Hotels",
    quantities: { total_required: 5, completed: 0, remaining: 5 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11276-5",
    project_name: "HOTEL RIXOS",
    product_name: "كمود",
    client: "RIXOS Hotels",
    quantities: { total_required: 10, completed: 0, remaining: 10 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing({ panel_saw: 4, edge_banding: 2 }),
  },
  {
    work_order_id: "WO-11276-6",
    project_name: "HOTEL RIXOS",
    product_name: "تسريحة",
    client: "RIXOS Hotels",
    quantities: { total_required: 5, completed: 0, remaining: 5 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11276-7",
    project_name: "HOTEL RIXOS",
    product_name: "ميني بار",
    client: "RIXOS Hotels",
    quantities: { total_required: 5, completed: 0, remaining: 5 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11276-8",
    project_name: "HOTEL RIXOS",
    product_name: "شناطة",
    client: "RIXOS Hotels",
    quantities: { total_required: 5, completed: 0, remaining: 5 },
    dates: { receive_date: "nan", delivery_date: "nan" },
    routing_progress: routing(),
  },
  {
    work_order_id: "WO-11183-9",
    project_name: "Mainlands",
    product_name: "فاصل خلية",
    client: "Mainlands Development",
    quantities: { total_required: 1, completed: 1, remaining: 0 },
    dates: { receive_date: "2026-03-29", delivery_date: "2026-03-29" },
    routing_progress: routing({ solid_wood: 1, panel_saw: 1, cnc_routing: 1, painting: 1, assembly: 1, packaging: 1 }),
  },
  {
    work_order_id: "WO-11241-10",
    project_name: "Nesr Admin",
    product_name: "تجليدة كونتر (EG-24 / HUB-13 / HUB-17 / HUB-18)",
    client: "Nesr Group",
    quantities: { total_required: 4, completed: 4, remaining: 0 },
    dates: { receive_date: "2026-04-02", delivery_date: "2026-04-05" },
    routing_progress: routing({ solid_wood: 4, panel_saw: 4, edge_banding: 4, painting: 4, assembly: 4, packaging: 4 }),
  },
  {
    work_order_id: "WO-11241-11",
    project_name: "Nesr Admin",
    product_name: "دولاب J - 8",
    client: "Nesr Group",
    quantities: { total_required: 1, completed: 1, remaining: 0 },
    dates: { receive_date: "2026-04-07", delivery_date: "2026-04-09" },
    routing_progress: routing({ solid_wood: 1, panel_saw: 1, edge_banding: 1, painting: 1, assembly: 1, packaging: 1 }),
  },
  {
    work_order_id: "WO-11265-12",
    project_name: "Nesr Admin",
    product_name: "تجليدة 221 × 96.8 سم MDF 17 ملصوق قشرة جوز",
    client: "Nesr Group",
    quantities: { total_required: 4, completed: 4, remaining: 0 },
    dates: { receive_date: "2026-04-14", delivery_date: "2026-04-15" },
    routing_progress: routing({ panel_saw: 4, edge_banding: 4, painting: 4, assembly: 4, packaging: 4 }),
  },
  {
    work_order_id: "WO-11265-13",
    project_name: "Nesr Admin",
    product_name: "فلير عرض 10 سم MDF 17 ملصوق قشرة جوز",
    client: "Nesr Group",
    quantities: { total_required: 3, completed: 3, remaining: 0 },
    dates: { receive_date: "2026-04-14", delivery_date: "2026-04-15" },
    routing_progress: routing({ panel_saw: 3, edge_banding: 3, painting: 3, assembly: 3, packaging: 3 }),
  },
  {
    work_order_id: "WO-11265-14",
    project_name: "Nesr Admin",
    product_name: "فلير عرض 10 سم MDF 17 دهان GLC دوكو الرمادي",
    client: "Nesr Group",
    quantities: { total_required: 3, completed: 3, remaining: 0 },
    dates: { receive_date: "2026-04-14", delivery_date: "2026-04-15" },
    routing_progress: routing({ panel_saw: 3, edge_banding: 3, painting: 3, assembly: 3, packaging: 3 }),
  },
  {
    work_order_id: "WO-11265-15",
    project_name: "Nesr Admin",
    product_name: "علفات 10.5 × 4.5 × 300 سم موسكي",
    client: "Nesr Group",
    quantities: { total_required: 16, completed: 16, remaining: 0 },
    dates: { receive_date: "2026-04-14", delivery_date: "2026-04-15" },
    routing_progress: routing({ solid_wood: 16, panel_saw: 16, painting: 16, assembly: 16, packaging: 16 }),
  },
  {
    work_order_id: "WO-11265-16",
    project_name: "Nesr Admin",
    product_name: "رف مطبخ 50 × 85.5 سم تخانة 18 مم قشرة ارو",
    client: "Nesr Group",
    quantities: { total_required: 1, completed: 1, remaining: 0 },
    dates: { receive_date: "2026-04-14", delivery_date: "2026-04-15" },
    routing_progress: routing({ panel_saw: 1, edge_banding: 1, painting: 1, assembly: 1, packaging: 1 }),
  },
  {
    work_order_id: "WO-11267-17",
    project_name: "Nesr Admin",
    product_name: "عينة تجليدة الريسبشن",
    client: "Nesr Group",
    quantities: { total_required: 1, completed: 1, remaining: 0 },
    dates: { receive_date: "2026-04-19", delivery_date: "2026-04-19" },
    routing_progress: routing({ panel_saw: 1, edge_banding: 1, painting: 1, assembly: 1, packaging: 1 }),
  },
  {
    work_order_id: "WO-11257-18",
    project_name: "Nivera",
    product_name: "قرصة مكتب مدير 180 × 80 سم",
    client: "Nivera Real Estate",
    quantities: { total_required: 6, completed: 6, remaining: 0 },
    dates: { receive_date: "2026-04-13", delivery_date: "2026-04-15" },
    routing_progress: routing({ panel_saw: 6, edge_banding: 6, painting: 6, assembly: 6, packaging: 6 }),
  },
  {
    work_order_id: "WO-11257-19",
    project_name: "Nivera",
    product_name: "برواز مرايا",
    client: "Nivera Real Estate",
    quantities: { total_required: 3, completed: 3, remaining: 0 },
    dates: { receive_date: "2026-04-13", delivery_date: "2026-04-15" },
    routing_progress: routing({ solid_wood: 3, panel_saw: 3, painting: 3, assembly: 3, packaging: 3 }),
  },
];

/**
 * Full wood-factory work-order dataset transcribed from
 * `Data/gem_Claude/wood_work_orders (3).json` and normalised. Includes
 * derived `priority` and `client` fields for UI affordances; `routing_progress`
 * carries plausible per-stage progress so the routing stepper has data.
 */
export const woodWorkOrdersFixture: WoodWorkOrdersDataset = {
  factory_id: "WF-001",
  factory_name: "مصنع الأخشاب والأثاث",
  total_active_orders: seed.length,
  work_orders: seed.map((order) => ({
    ...order,
    priority: derivePriority(order.quantities.remaining, order.dates.delivery_date),
  })),
};
