import { describe, expect, it } from "vitest";

/** Mirrors LegacyFactoryRedirects target paths for regression tests. */
export function legacyRedirectTarget(pathname: string): string | null {
  if (pathname === "/metal/orders") return "/orders/metal";
  const metalDetail = /^\/metal\/orders\/(.+)$/.exec(pathname);
  if (metalDetail) return `/orders/metal/${metalDetail[1]}`;
  if (pathname === "/wooden/orders") return "/orders/wood";
  const woodDetail = /^\/wooden\/orders\/(.+)$/.exec(pathname);
  if (woodDetail) return `/orders/wood/${woodDetail[1]}`;
  if (pathname === "/projects") return "/projects/hub";
  if (pathname === "/dashboard/classic") return "/";
  if (pathname === "/dashboard/factory") return "/#executive";
  return null;
}

describe("legacy factory URL redirects", () => {
  it("maps metal and wood order list and detail paths", () => {
    expect(legacyRedirectTarget("/metal/orders")).toBe("/orders/metal");
    expect(legacyRedirectTarget("/metal/orders/abc-1")).toBe("/orders/metal/abc-1");
    expect(legacyRedirectTarget("/wooden/orders")).toBe("/orders/wood");
    expect(legacyRedirectTarget("/wooden/orders/wo-9")).toBe("/orders/wood/wo-9");
  });

  it("maps legacy /projects to hub", () => {
    expect(legacyRedirectTarget("/projects")).toBe("/projects/hub");
  });

  it("maps legacy /dashboard/classic to /", () => {
    expect(legacyRedirectTarget("/dashboard/classic")).toBe("/");
  });

  it("maps legacy /dashboard/factory to executive section on home", () => {
    expect(legacyRedirectTarget("/dashboard/factory")).toBe("/#executive");
  });

  it("returns null for unrelated paths", () => {
    expect(legacyRedirectTarget("/production")).toBeNull();
  });
});
