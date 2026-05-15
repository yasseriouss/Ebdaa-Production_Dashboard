"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { WoDerivedStatus } from "@/lib/wood-orders-logic";
import type { WorkOrderRaw } from "@/lib/wood-orders-schema";

import { WorkOrderCard } from "./work-order-card";

const COLUMNS: { key: WoDerivedStatus; title: string }[] = [
  { key: "Pending", title: "معلق" },
  { key: "In Progress", title: "قيد التنفيذ" },
  { key: "Done", title: "منتهي" },
];

export function KanbanBoard({
  rows,
}: {
  rows: {
    workOrder: WorkOrderRaw;
    merged: Record<
      string,
      { qty_passed: number; qty_required: number; department: string }
    >;
    status: WoDerivedStatus;
  }[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = rows.filter((r) => r.status === col.key);
        return (
          <div
            key={col.key}
            className="bg-muted/40 flex min-h-[320px] flex-col rounded-xl border p-3"
          >
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              <h2 className="text-sm font-semibold tracking-tight">
                {col.title}
              </h2>
              <span className="bg-background text-muted-foreground rounded-full border px-2 py-0.5 text-xs tabular-nums">
                {items.length}
              </span>
            </div>
            <ScrollArea className="max-h-[calc(100vh-220px)] pr-2">
              <div className="flex flex-col gap-3 pb-2">
                {items.map(({ workOrder, merged, status }) => (
                  <WorkOrderCard
                    key={workOrder.work_order_id}
                    workOrder={workOrder}
                    merged={merged}
                    status={status}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
