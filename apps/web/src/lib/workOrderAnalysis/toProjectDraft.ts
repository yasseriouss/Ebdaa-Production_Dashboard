import type { ProjectDraft, PartDraft, PartRouting, ProductDraft } from "../../data/projectDraft";
import { uid } from "../../data/projectDraft";
import { factoryCapacityFixture } from "../../data/fixtures/factoryCapacity";
import type { FactoryId } from "../../data/types";
import type { WorkOrderAnalysisSession } from "./types";

function factoryModel(factory: FactoryId) {
  return factory === "WF-001"
    ? factoryCapacityFixture.woodworking_factory
    : factoryCapacityFixture.metal_factory;
}

function taskCycleSeconds(factoryId: FactoryId, departmentId: string, taskId: string): number {
  const model = factoryModel(factoryId);
  const dept = model.departments.find((d) => d.id === departmentId) ?? model.departments[0];
  const task = dept.tasks.find((t) => t.id === taskId) ?? dept.tasks[0];
  return task.capacity_metrics?.cycle_time_seconds ?? 60;
}

/** يحوّل جلسة التحليل إلى مسودة «مشروع جديد» — منتج واحد يضم القطع المختارة. */
export function sessionToProjectDraft(session: WorkOrderAnalysisSession): ProjectDraft {
  const inc = session.parts.filter((p) => p.includeInWorkOrder && p.name.trim());
  const parts: PartDraft[] = inc.map((p) => {
    const cycleBase = taskCycleSeconds(p.factory, p.department_id, p.task_id);
    const minutes = p.optionalPlannedMinutes;
    const plannedOk = minutes != null && Number.isFinite(minutes) && minutes > 0;
    const cycle = plannedOk ? Math.round(minutes * 60) : cycleBase;
    const routing: PartRouting[] = [
      {
        id: uid(),
        department_id: p.department_id,
        task_id: p.task_id,
        cycle_time_seconds: cycle,
      },
    ];
    return {
      id: p.id,
      name: p.name.trim(),
      factory: p.factory,
      routing,
      optionalPlannedMinutes: plannedOk ? minutes : null,
    };
  });

  const product: ProductDraft = {
    id: uid(),
    name:
      session.projectName.trim() ||
      session.fileName.replace(/\.[^.]+$/, "") ||
      "من تحليل أمر الشغل",
    description: [
      session.orderRef.trim() ? `مرجع: ${session.orderRef}` : "",
      session.notes.trim() ? session.notes : "",
      summarizeLines("خامات", session.materials),
      summarizeLines("اكسسوارات", session.accessories),
    ]
      .filter(Boolean)
      .join("\n"),
    parts,
  };

  return {
    name: session.projectName.trim() || product.name,
    client: session.client.trim(),
    delivery_date: "",
    priority: "Normal",
    products: parts.length ? [product] : [],
  };
}

function summarizeLines(
  label: string,
  rows: Array<{ name: string; qty: string; unit: string; spec: string }>,
): string {
  if (!rows.length) return "";
  const lines = rows
    .filter((r) => r.name.trim())
    .map((r) =>
      [r.name, r.qty, r.unit].filter(Boolean).join(" ").trim(),
    )
    .slice(0, 40);
  if (!lines.length) return "";
  return `${label}:\n` + lines.map((x) => `· ${x}`).join("\n");
}

/** دمج مسودة حالية مع مسودة قادمة من التحليل (إلحاق قطع إلى أول منتج أو إنشاء منتج جديد). */
export function mergeProjectDrafts(existing: ProjectDraft, incoming: ProjectDraft): ProjectDraft {
  const next: ProjectDraft = JSON.parse(JSON.stringify(existing));
  if (!incoming.products.length) return next;
  const incProd = incoming.products[0];
  if (!next.products.length) {
    next.products = incoming.products.map((p) => ({ ...p, id: uid(), parts: p.parts.map(copyPart) }));
    return syncTopLevel(next);
  }
  const target = next.products[0];
  target.description = [target.description, incProd.description].filter(Boolean).join("\n\n");
  target.parts.push(...incProd.parts.map(copyPart));
  return syncTopLevel(next);
}

function copyPart(p: PartDraft): PartDraft {
  return {
    ...p,
    id: uid(),
    routing: p.routing.map((r) => ({ ...r, id: uid() })),
  };
}

function syncTopLevel(d: ProjectDraft): ProjectDraft {
  if (!d.name.trim() && d.products[0]?.name) d.name = d.products[0].name;
  return d;
}
