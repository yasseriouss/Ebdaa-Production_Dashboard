import { notFound } from "next/navigation";

import { WorkOrderDetailView } from "@/components/work-order/work-order-detail-view";
import { PARSED_WOOD_ORDERS } from "@/lib/wood-orders-data";

export default async function WorkOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workOrderId = decodeURIComponent(id);
  const exists = PARSED_WOOD_ORDERS.work_orders.some(
    (w) => w.work_order_id === workOrderId
  );
  if (!exists) {
    notFound();
  }
  return <WorkOrderDetailView workOrderId={workOrderId} />;
}
