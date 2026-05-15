"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STAGE_LABELS } from "@/lib/stage-config";
import { PARSED_WOOD_ORDERS } from "@/lib/wood-orders-data";
import {
  derivePriority,
  deriveWoStatus,
  floorProgressRatio,
  getBottleneckStage,
  getStageUiStatus,
  mergeRouting,
  visibleStageKeys,
  type StageUiStatus,
} from "@/lib/wood-orders-logic";
import { cn } from "@/lib/utils";
import { useWorkOrderStore } from "@/store/work-order-store";

const STAGE_STATUS_OPTIONS: { value: StageUiStatus; label: string }[] = [
  { value: "not_started", label: "لم يبدأ" },
  { value: "in_progress", label: "قيد التنفيذ" },
  { value: "completed", label: "مكتمل" },
];

function stageStatusTone(status: StageUiStatus) {
  if (status === "completed") {
    return "border-emerald-600/40 bg-emerald-600/10 text-emerald-900 dark:text-emerald-100";
  }
  if (status === "in_progress") {
    return "border-amber-500/50 bg-amber-500/10 text-amber-950 dark:text-amber-100";
  }
  return "border-muted-foreground/30 bg-muted text-muted-foreground";
}

export function WorkOrderDetailView({ workOrderId }: { workOrderId: string }) {
  const patches = useWorkOrderStore((s) => s.patches);
  const setQtyPassed = useWorkOrderStore((s) => s.setQtyPassed);
  const setStageStatus = useWorkOrderStore((s) => s.setStageStatus);

  const workOrder = useMemo(
    () =>
      PARSED_WOOD_ORDERS.work_orders.find(
        (w) => w.work_order_id === workOrderId
      ),
    [workOrderId]
  );

  if (!workOrder) {
    return null;
  }

  const merged = mergeRouting(workOrder, patches);
  const status = deriveWoStatus(workOrder, merged);
  const priority = derivePriority(workOrder.dates.delivery_date, status);
  const pct = Math.round(floorProgressRatio(workOrder, merged) * 100);
  const bottleneck = getBottleneckStage(workOrder, merged);

  const orderedStages = visibleStageKeys(workOrder);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
      <div>
        <Link
          href="/"
          className="text-primary text-sm font-medium underline-offset-4 hover:underline"
        >
          ← العودة إلى لوحة التحكم
        </Link>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle className="text-xl md:text-2xl">
                {workOrder.work_order_id}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                <span className="font-medium text-foreground">المشروع / العميل:</span>{" "}
                {workOrder.project_name}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={priority === "high" ? "destructive" : "secondary"}
                className="text-sm"
              >
                {priority === "high" ? "أولوية عالية" : "أولوية عادية"}
              </Badge>
              <Badge variant="outline" className="text-sm">
                {status === "Done"
                  ? "منتهي"
                  : status === "In Progress"
                    ? "قيد التنفيذ"
                    : "معلق"}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">التقدم الإجمالي</span>
              <span className="tabular-nums font-semibold">{pct}%</span>
            </div>
            <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            مرحلة الاختناق الحالية:{" "}
            <span className="text-foreground font-medium">
              {bottleneck
                ? (STAGE_LABELS[bottleneck]?.ar ?? bottleneck)
                : "—"}
            </span>
          </p>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">مسار الإنتاج</h2>
        <p className="text-muted-foreground text-sm">
          تحديث كمية ما تم تنفيذه وحالة كل مرحلة (يُحفظ محلياً على هذا الجهاز)
        </p>

        <div className="relative me-3 border-s border-dashed border-border ps-6">
          {orderedStages.map((stageKey) => {
            const row = merged[stageKey];
            const labels = STAGE_LABELS[stageKey] ?? {
              ar: stageKey,
              en: stageKey,
              short: stageKey,
            };
            const uiStatus = getStageUiStatus(
              workOrder,
              stageKey,
              merged,
              patches
            );
            const total = row?.qty_required ?? workOrder.quantities.total_required;

            return (
              <div key={stageKey} className="relative pb-8 last:pb-0">
                <span
                  className={cn(
                    "absolute -start-[9px] top-3 size-3 rounded-full border-2 bg-background",
                    uiStatus === "completed" && "border-emerald-600 bg-emerald-600",
                    uiStatus === "in_progress" && "border-amber-500 bg-amber-500",
                    uiStatus === "not_started" && "border-muted-foreground"
                  )}
                />
                <Card
                  className={cn(
                    "border-2 transition-colors",
                    stageStatusTone(uiStatus)
                  )}
                >
                  <CardHeader className="gap-1 pb-2">
                    <CardTitle className="text-base">
                      {labels.ar}{" "}
                      <span className="text-muted-foreground font-normal">
                        / {labels.en}
                      </span>
                    </CardTitle>
                    <p className="text-muted-foreground font-mono text-xs">
                      {row?.department}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`qty-${stageKey}`} className="text-base">
                          كمية ما تم تنفيذه (qty_passed)
                        </Label>
                        <Input
                          id={`qty-${stageKey}`}
                          type="number"
                          inputMode="numeric"
                          min={0}
                          className="h-12 min-h-12 text-lg"
                          value={row?.qty_passed ?? 0}
                          onChange={(e) =>
                            setQtyPassed(
                              workOrder.work_order_id,
                              stageKey,
                              Number(e.target.value)
                            )
                          }
                        />
                        <p className="text-muted-foreground text-xs">
                          المطلوب للمرحلة: {total}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor={`st-${stageKey}`} className="text-base">
                          حالة المرحلة
                        </Label>
                        <select
                          id={`st-${stageKey}`}
                          className="border-input bg-background text-foreground focus-visible:ring-ring h-12 w-full rounded-lg border px-3 text-base shadow-xs focus-visible:ring-2 focus-visible:outline-none"
                          value={uiStatus}
                          onChange={(e) =>
                            setStageStatus(
                              workOrder.work_order_id,
                              stageKey,
                              e.target.value as StageUiStatus
                            )
                          }
                        >
                          {STAGE_STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
