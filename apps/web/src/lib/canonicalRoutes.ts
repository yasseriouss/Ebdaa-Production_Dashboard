/** Canonical app URLs after IA unification (lists live under production hub). */
export const PRODUCTION_HUB_PATH = "/production";

export type ProductionHubFactory = "wood" | "metal" | "both";
export type ProductionHubView = "orders" | "production" | "daily";

export function productionHubHref(opts: {
  factory?: ProductionHubFactory;
  view?: ProductionHubView;
}): string {
  const params = new URLSearchParams();
  const factory = opts.factory ?? "wood";
  const view = opts.view ?? "orders";
  if (factory !== "wood") params.set("factory", factory);
  if (view !== "orders") params.set("view", view);
  const qs = params.toString();
  return qs ? `${PRODUCTION_HUB_PATH}?${qs}` : PRODUCTION_HUB_PATH;
}

export const ORDERS_METAL_LIST_REDIRECT = productionHubHref({ factory: "metal", view: "orders" });
export const ORDERS_WOOD_LIST_REDIRECT = productionHubHref({ factory: "wood", view: "orders" });
