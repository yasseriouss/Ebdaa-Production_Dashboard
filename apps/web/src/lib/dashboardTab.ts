export type DashboardTab = "executive" | "operational";

export function dashboardTabHash(tab: DashboardTab): string {
  return tab === "operational" ? "#operational" : "#executive";
}

export function parseDashboardTabFromHash(hash: string): DashboardTab {
  return hash === "#operational" ? "operational" : "executive";
}
