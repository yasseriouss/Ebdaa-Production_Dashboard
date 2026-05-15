"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import type { WoDerivedStatus } from "@/lib/wood-orders-logic";
import { floorProgressRatio, isDeliveryDelayed } from "@/lib/wood-orders-logic";
import type { WorkOrderRaw } from "@/lib/wood-orders-schema";

function statusBadgeVariant(status: WoDerivedStatus) {
  if (status === "Done") return "default" as const;
  if (status === "In Progress") return "secondary" as const;
  return "outline" as const;
}

function statusBadgeClass(status: WoDerivedStatus) {
  if (status === "Done")
    return "border-emerald-600/30 bg-emerald-600/15 text-emerald-800 dark:text-emerald-200";
  if (status === "In Progress")
    return "border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100";
  return "";
}

export function WorkOrderCard({
  workOrder,
  merged,
  status,
}: {
  workOrder: WorkOrderRaw;
  merged: Record<
    string,
    { qty_passed: number; qty_required: number; department: string }
  >;
  status: WoDerivedStatus;
}) {
  const ratio = floorProgressRatio(workOrder, merged);
  const pct = Math.round(ratio * 100);
  const delayed = isDeliveryDelayed(
    workOrder.dates.delivery_date,
    status
  );
  const delivery = workOrder.dates.delivery_date;
  const deliveryLabel = delivery
    ? delivery.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  return (
    <Card className="border-border/80 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="gap-2 pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug font-semibold">
            {workOrder.product_name}
          </CardTitle>
          <Badge
            variant={statusBadgeVariant(status)}
            className={statusBadgeClass(status)}
          >
            {status === "Done"
              ? "منتهي"
              : status === "In Progress"
                ? "قيد التنفيذ"
                : "معلق"}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {workOrder.project_name}
        </p>
        <p className="font-mono text-xs tracking-wide text-primary">
          {workOrder.work_order_id}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">التقدم</span>
            <span className="tabular-nums font-medium">{pct}%</span>
          </div>
          <Progress value={pct} className="w-full">
            <ProgressTrack className="h-2.5">
              <ProgressIndicator className="bg-primary" />
            </ProgressTrack>
          </Progress>
          <p className="text-muted-foreground text-xs">
            {workOrder.quantities.completed} /{" "}
            {workOrder.quantities.total_required} مكتمل (بيانات النظام)
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">التسليم</span>
          <span
            className={
              delayed
                ? "font-semibold text-destructive"
                : "text-foreground font-medium"
            }
          >
            {deliveryLabel}
          </span>
        </div>
        <Link
          href={`/work-orders/${encodeURIComponent(workOrder.work_order_id)}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex min-h-12 w-full items-center justify-center rounded-lg px-4 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          فتح أمر العمل
        </Link>
      </CardContent>
    </Card>
  );
}
