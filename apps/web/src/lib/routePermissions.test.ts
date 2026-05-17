import { describe, expect, it } from "vitest";
import { ROUTE_REQUIRED_PERMISSION } from "./routePermissions";

/** Hrefs referenced from Sidebar NAV_DEF (leaf + group children). */
const SIDEBAR_HREFS = [
  "/",
  "/dashboard/factory",
  "/production",
  "/orders/metal",
  "/orders/wood",
  "/departments",
  "/daily/metal",
  "/daily/wood",
  "/projects/hub",
  "/projects/joint",
  "/projects/new",
  "/projects/work-order-analysis",
  "/workforce",
  "/planning",
  "/about-system",
  "/workflow-routing",
  "/equipment",
  "/import-export",
  "/analytics",
  "/analytics/wood",
  "/analytics/metal",
  "/audit-log",
  "/performance/departments",
  "/performance/people",
  "/project-analytics",
  "/admin/permissions",
  "/dev/tools",
];

describe("ROUTE_REQUIRED_PERMISSION", () => {
  it("maps every sidebar href to a permission key", () => {
    for (const href of SIDEBAR_HREFS) {
      expect(ROUTE_REQUIRED_PERMISSION[href], `missing permission for ${href}`).toBeTruthy();
    }
  });

  it("uses non-empty catalog-style permission keys", () => {
    for (const [path, key] of Object.entries(ROUTE_REQUIRED_PERMISSION)) {
      expect(key.length).toBeGreaterThan(2);
      expect(key).toMatch(/^[a-z0-9_:]+$/);
      expect(path.startsWith("/")).toBe(true);
    }
  });

  it("includes dev and classic dashboard routes", () => {
    expect(ROUTE_REQUIRED_PERMISSION["/dev/tools"]).toBe("admin:permissions:view");
    expect(ROUTE_REQUIRED_PERMISSION["/dashboard/factory"]).toBe("dashboard:view");
  });
});
