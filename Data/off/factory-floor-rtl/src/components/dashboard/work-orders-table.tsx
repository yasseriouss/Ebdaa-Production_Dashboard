"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { WoDerivedStatus } from "@/lib/wood-orders-logic";
import { floorProgressRatio, isDeliveryDelayed } from "@/lib/wood-orders-logic";
import type { WorkOrderRaw } from "@/lib/wood-orders-schema";

function statusLabel(status: WoDerivedStatus) {
  if (status === "Done") return "منتهي";
  if (status === "In Progress") return "قيد التنفيذ";
  return "معلق";
}

export function WorkOrdersTable({
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
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[120px]">رقم الأمر</TableHead>
            <TableHead className="min-w-[140px]">المشروع</TableHead>
            <TableHead className="min-w-[200px]">المنتج</TableHead>
            <TableHead className="w-[120px]">التقدم</TableHead>
            <TableHead className="w-[120px]">التسليم</TableHead>
            <TableHead className="w-[110px]">الحالة</TableHead>
            <TableHead className="w-[120px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ workOrder, merged, status }) => {
            const ratio = floorProgressRatio(workOrder, merged);
            const pct = Math.round(ratio * 100);
            const delayed = isDeliveryDelayed(
              workOrder.dates.delivery_date,
              status
            );
            const delivery = workOrder.dates.delivery_date;
            const deliveryLabel = delivery
              ? delivery.toLocaleDateString("ar-EG")
              : "—";
            return (
              <TableRow key={workOrder.work_order_id}>
                <TableCell className="font-mono text-xs">
                  {workOrder.work_order_id}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {workOrder.project_name}
                </TableCell>
                <TableCell className="max-w-[320px] whitespace-normal">
                  {workOrder.product_name}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="bg-muted h-2 w-20 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {pct}%
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className={
                    delayed ? "font-semibold text-destructive" : undefined
                  }
                >
                  {deliveryLabel}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{statusLabel(status)}</Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/work-orders/${encodeURIComponent(workOrder.work_order_id)}`}
                    className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                  >
                    التفاصيل
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
