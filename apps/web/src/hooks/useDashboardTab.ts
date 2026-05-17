import { useCallback, useEffect, useState } from "react";
import {
  dashboardTabHash,
  parseDashboardTabFromHash,
  type DashboardTab,
} from "../lib/dashboardTab";

export function useDashboardTab(defaultTab: DashboardTab = "executive") {
  const [tab, setTab] = useState<DashboardTab>(defaultTab);

  useEffect(() => {
    const syncFromHash = () => setTab(parseDashboardTabFromHash(window.location.hash));
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const setDashboardTab = useCallback((next: DashboardTab) => {
    setTab(next);
    if (typeof window === "undefined") return;
    const hash = dashboardTabHash(next);
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(null, "", url);
  }, []);

  return { tab, setDashboardTab };
}
