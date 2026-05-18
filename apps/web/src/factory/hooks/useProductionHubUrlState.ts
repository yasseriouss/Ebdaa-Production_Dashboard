import { useCallback, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { productionHubHref, type ProductionHubFactory, type ProductionHubView } from "../../lib/canonicalRoutes";

type Tab = ProductionHubFactory;
type SubTab = ProductionHubView;

function readQuery(): { tab: Tab; subTab: SubTab } {
  const search = typeof window !== "undefined" ? window.location.search : "";
  const params = new URLSearchParams(search);
  const f = params.get("factory");
  const v = params.get("view");
  const tab: Tab = f === "metal" || f === "both" ? f : "wood";
  const subTab: SubTab = v === "production" ? "production" : "orders";
  return { tab, subTab };
}

export function useProductionHubUrlState() {
  const [location, navigate] = useLocation();
  const [tab, setTabState] = useState<Tab>(() => readQuery().tab);
  const [subTab, setSubTabState] = useState<SubTab>(() => readQuery().subTab);

  useEffect(() => {
    if (!location.startsWith("/production")) return;
    const next = readQuery();
    setTabState(next.tab);
    setSubTabState(next.subTab);
  }, [location]);

  const setTab = useCallback(
    (t: Tab) => {
      const nextSub: SubTab = t === "both" ? "orders" : subTab;
      setTabState(t);
      setSubTabState(nextSub);
      navigate(productionHubHref({ factory: t, view: nextSub }), { replace: true });
    },
    [navigate, subTab],
  );

  const setSubTab = useCallback(
    (s: SubTab) => {
      setSubTabState(s);
      navigate(productionHubHref({ factory: tab, view: s }), { replace: true });
    },
    [navigate, tab],
  );

  return { tab, subTab, setTab, setSubTab };
}
