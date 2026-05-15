/**
 * Domain types mirroring `Data/gem_Claude/*.json`. Centralised so the UI,
 * analytics, fixtures, and any future ETL into `lib/db` share the same
 * vocabulary.
 */

export type WoodFactoryId = "WF-001";
export type MetalFactoryId = "MF-001";
export type FactoryId = WoodFactoryId | MetalFactoryId;

export type WoodDepartmentId =
  | "DEPT_SOLID_WOOD"
  | "DEPT_PANEL_PROC"
  | "DEPT_VENEER"
  | "DEPT_JOINERY"
  | "DEPT_SANDING"
  | "DEPT_WOOD_PAINT"
  | "DEPT_UPHOLSTERY"
  | "DEPT_WOOD_ASSY"
  | "DEPT_PACKAGING";

export type MetalDepartmentId =
  | "DEPT_PREP"
  | "DEPT_FORMING"
  | "DEPT_WELDING"
  | "DEPT_FINISHING"
  | "DEPT_COATING_ASSY";

export type DepartmentId = WoodDepartmentId | MetalDepartmentId;

export type WoodRoutingStageKey =
  | "solid_wood"
  | "panel_saw"
  | "edge_banding"
  | "cnc_routing"
  | "upholstery"
  | "painting"
  | "assembly"
  | "packaging";

export interface WoodRoutingStage {
  department: WoodDepartmentId;
  qty_passed: number;
}

export type WoodRoutingProgress = Record<WoodRoutingStageKey, WoodRoutingStage>;

export interface WorkOrderQuantities {
  total_required: number;
  completed: number;
  remaining: number;
}

export interface WorkOrderDates {
  /** ISO date or `"nan"` when missing in the upstream export. */
  receive_date: string;
  delivery_date: string;
}

export type WorkOrderPriority = "Low" | "Normal" | "High" | "Critical";

export interface WoodWorkOrder {
  work_order_id: string;
  project_name: string;
  product_name: string;
  quantities: WorkOrderQuantities;
  dates: WorkOrderDates;
  routing_progress: WoodRoutingProgress;
  /** Derived/editable in the UI; not always present in source JSON. */
  priority?: WorkOrderPriority;
  client?: string;
}

export interface WoodWorkOrdersDataset {
  factory_id: WoodFactoryId;
  factory_name: string;
  total_active_orders: number;
  work_orders: WoodWorkOrder[];
}

/**
 * Completion percentage derived from `quantities`; returns 0 when the order
 * has no required quantity (defensive against the `"nan"` cases in source).
 */
export function completionPercent(qty: WorkOrderQuantities): number {
  if (!qty.total_required) return 0;
  return Math.round((qty.completed / qty.total_required) * 100);
}

export type WorkOrderStatus = "Pending" | "In Progress" | "Done";

/** Computed status from completion percent. */
export function statusFromCompletion(percent: number): WorkOrderStatus {
  if (percent >= 100) return "Done";
  if (percent > 0) return "In Progress";
  return "Pending";
}

/**
 * Capacity and cost-centre metadata for a single machine/task. Mirrors
 * `factory_capacity_schema.json`. Optional fields tolerate the operations-only
 * variant of the schema (`factory_operations_schema.json`).
 */
export interface CapacityMetrics {
  unit_of_measure: string;
  cycle_time_seconds: number;
  setup_time_minutes: number;
  batch_size: number;
  efficiency_factor: number;
  max_capacity_per_hour: number;
}

export interface CostCenterInfo {
  hourly_operating_cost: number;
  labor_required: number;
}

export interface FactoryTask {
  id: string;
  name: string;
  type: string;
  capacity_metrics?: CapacityMetrics;
  cost_center_info?: CostCenterInfo;
}

export interface FactoryDepartment {
  id: DepartmentId;
  name: string;
  /** Sequential 1-based step in the factory routing. */
  process_step: number;
  description?: string;
  tasks: FactoryTask[];
}

export interface Factory {
  factory_id: FactoryId;
  name: string;
  departments: FactoryDepartment[];
}

export interface FactoryCapacitySchema {
  metal_factory: Factory;
  woodworking_factory: Factory;
}

/** Roster record matching `employee_assignments.json`. */
export interface Employee {
  employee_id: string;
  name: string;
  job_title: string;
  standardized_role: string;
  /** ISO date, `null`, or rare slash-format leftover from the source file. */
  hire_date: string | null;
}

export interface EmployeeAssignments {
  factory_id: WoodFactoryId;
  factory_name: string;
  management_layer: Employee[];
  /** Keyed by `WoodDepartmentId` plus `SUPPORT_POOL` and `UNASSIGNED`. */
  departments: Record<string, Employee[]>;
}

/** Headcount target per role (planning baseline). */
export interface WorkforceRole {
  role_title: string;
  count: number;
  type: string;
}

export interface WorkforceDepartmentAllocation {
  department_id: string;
  staff: WorkforceRole[];
}

export interface WorkforceAllocation {
  factory_id: WoodFactoryId;
  management_engineering_layer: WorkforceRole[];
  departments_workforce: WorkforceDepartmentAllocation[];
}
