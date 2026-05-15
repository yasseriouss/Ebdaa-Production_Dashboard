import type { FactoryId } from "./types";

export type NewProjectStep = 0 | 1 | 2 | 3;

export interface PartRouting {
  id: string;
  department_id: string;
  task_id: string;
  cycle_time_seconds: number;
}

export interface PartDraft {
  id: string;
  name: string;
  factory: FactoryId;
  routing: PartRouting[];
  /** دقائق تقديرية اختيارية لكل قطعة (للمتابعة لاحقاً) */
  optionalPlannedMinutes?: number | null;
}

export interface ProductDraft {
  id: string;
  name: string;
  description: string;
  parts: PartDraft[];
}

export interface ProjectDraft {
  name: string;
  client: string;
  delivery_date: string;
  priority: "Low" | "Normal" | "High" | "Critical";
  products: ProductDraft[];
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 11);
}

export const initialProjectDraft: ProjectDraft = {
  name: "",
  client: "",
  delivery_date: "",
  priority: "Normal",
  products: [],
};
