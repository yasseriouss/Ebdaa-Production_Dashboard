export type CoachRouteConfig = {
  pathPrefix: string;
  bannerKey: string;
  toastKey?: string;
};

export const EBdaa_ROUTE_COACH_HINTS: CoachRouteConfig[] = [
  { pathPrefix: "/orders/wood", bannerKey: "coach.hints.ordersWood.banner", toastKey: "coach.hints.ordersWood.toast" },
  {
    pathPrefix: "/daily/wood",
    bannerKey: "coach.hints.dailyWood.banner",
    toastKey: "coach.hints.dailyWood.toast",
  },
  { pathPrefix: "/projects/new", bannerKey: "coach.hints.projectsNew.banner" },
  {
    pathPrefix: "/planning",
    bannerKey: "coach.hints.planning.banner",
    toastKey: "coach.hints.planning.toast",
  },
  { pathPrefix: "/about-system", bannerKey: "coach.hints.aboutSystem.banner" },
  { pathPrefix: "/equipment", bannerKey: "coach.hints.equipment.banner" },
  {
    pathPrefix: "/",
    bannerKey: "coach.hints.home.banner",
    toastKey: "coach.hints.home.toast",
  },
];

export function coachingMatch(pathname: string): CoachRouteConfig | undefined {
  const specific = [...EBdaa_ROUTE_COACH_HINTS]
    .filter((h) => h.pathPrefix !== "/")
    .sort((a, b) => b.pathPrefix.length - a.pathPrefix.length)
    .find((h) => pathname === h.pathPrefix || pathname.startsWith(`${h.pathPrefix}/`));
  if (specific) return specific;
  if (pathname === "/") return EBdaa_ROUTE_COACH_HINTS.find((h) => h.pathPrefix === "/");
  return undefined;
}
