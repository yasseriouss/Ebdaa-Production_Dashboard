import { useMemo } from "react";
import { woodWorkOrdersFixture } from "../data/fixtures";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { useFhWoodOrders } from "./api/hooks/useFactoryHub";
import { useDirection } from "./useDirection";
import { appLocale } from "./formatLocale";
import type { WoodWorkOrder } from "../data/types";

function aggregateStageThroughput(orders: WoodWorkOrder[], locale: string) {
  const ar = locale.startsWith("ar");
  return WOOD_STAGE_ORDER.map((stage) => {
    const total = orders.reduce(
      (acc, order) => acc + order.routing_progress[stage].qty_passed,
      0,
    );
    return {
      stage: ar ? WOOD_STAGE_LABELS[stage].arabic : WOOD_STAGE_LABELS[stage].english,
      qty: total,
    };
  });
}

/** Lowest-throughput wood stage label for dashboard / news ticker links. */
export function useWoodBottleneckStage() {
  const { direction } = useDirection();
  const locale = appLocale(direction);
  const { data: orders = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );

  return useMemo(() => {
    const stageData = aggregateStageThroughput(orders, locale);
    const bottleneck = stageData.reduce(
      (acc, row) => (row.qty < acc.qty ? row : acc),
      stageData[0] ?? { stage: "—", qty: 0 },
    );
    return bottleneck.stage;
  }, [orders, locale]);
}
