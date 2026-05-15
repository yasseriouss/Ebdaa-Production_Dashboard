"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEPARTMENT_FILTER_OPTIONS } from "@/lib/stage-config";
import { PARSED_WOOD_ORDERS } from "@/lib/wood-orders-data";
import {
  deriveWoStatus,
  getBottleneckStage,
  mergeRouting,
  type WoDerivedStatus,
} from "@/lib/wood-orders-logic";
import { useWorkOrderStore } from "@/store/work-order-store";

import { KanbanBoard } from "./kanban-board";
import { WorkOrdersTable } from "./work-orders-table";

const STATUS_OPTIONS: { value: "all" | WoDerivedStatus; label: string }[] = [
  { value: "all", label: "كل الحالات" },
  { value: "Pending", label: "معلق" },
  { value: "In Progress", label: "قيد التنفيذ" },
  { value: "Done", label: "منتهي" },
];

export function DashboardPage() {
  const patches = useWorkOrderStore((s) => s.patches);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [project, setProject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | WoDerivedStatus>(
    "all"
  );
  const [department, setDepartment] = useState<string>("all");

  const projects = useMemo(() => {
    const s = new Set(
      PARSED_WOOD_ORDERS.work_orders.map((w) => w.project_name)
    );
    return Array.from(s).sort((a, b) => a.localeCompare(b, "ar"));
  }, []);

  const enriched = useMemo(() => {
    return PARSED_WOOD_ORDERS.work_orders.map((wo) => {
      const merged = mergeRouting(wo, patches);
      const status = deriveWoStatus(wo, merged);
      const bottleneck = getBottleneckStage(wo, merged);
      return { workOrder: wo, merged, status, bottleneck };
    });
  }, [patches]);

  const filtered = useMemo(() => {
    return enriched.filter((row) => {
      if (project !== "all" && row.workOrder.project_name !== project) {
        return false;
      }
      if (statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }
      if (department !== "all" && row.bottleneck !== department) {
        return false;
      }
      return true;
    });
  }, [enriched, project, statusFilter, department]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-2 border-b pb-4">
        <p className="text-muted-foreground text-sm">
          {PARSED_WOOD_ORDERS.factory_name}
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              أوامر العمل النشطة
            </h1>
            <p className="text-muted-foreground text-base">
              عرض Kanban أو جدول متقدم — فلاتر سريعة للمشروع والحالة والقسم
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={view === "kanban" ? "default" : "outline"}
              size="lg"
              onClick={() => setView("kanban")}
            >
              Kanban
            </Button>
            <Button
              variant={view === "table" ? "default" : "outline"}
              size="lg"
              onClick={() => setView("table")}
            >
              جدول
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">فلاتر سريعة</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium">
            المشروع
            <select
              className="border-input bg-background text-foreground focus-visible:ring-ring h-12 w-full rounded-lg border px-3 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
              value={project}
              onChange={(e) => setProject(e.target.value)}
            >
              <option value="all">كل المشاريع</option>
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm font-medium">
            الحالة
            <select
              className="border-input bg-background text-foreground focus-visible:ring-ring h-12 w-full rounded-lg border px-3 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | WoDerivedStatus)
              }
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm font-medium">
            القسم (الاختناق الحالي)
            <select
              className="border-input bg-background text-foreground focus-visible:ring-ring h-12 w-full rounded-lg border px-3 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {DEPARTMENT_FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.labelAr}
                </option>
              ))}
            </select>
          </label>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm tabular-nums">
        عرض {filtered.length} من {enriched.length} أمر عمل
      </p>

      {view === "kanban" ? (
        <KanbanBoard rows={filtered} />
      ) : (
        <WorkOrdersTable rows={filtered} />
      )}
    </div>
  );
}
