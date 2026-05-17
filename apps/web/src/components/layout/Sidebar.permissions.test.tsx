import { describe, expect, it } from "vitest";
import { ROUTE_REQUIRED_PERMISSION } from "../../lib/routePermissions";

type NavSub = { href: string };
type NavEntry =
  | { kind: "leaf"; href: string }
  | { kind: "group"; children: NavSub[] };

function filterNav(entries: NavEntry[], keys: Set<string>): NavEntry[] {
  const gate = (href?: string) => {
    if (!href) return true;
    const req = ROUTE_REQUIRED_PERMISSION[href];
    if (!req) return true;
    return keys.has(req);
  };

  const out: NavEntry[] = [];
  for (const item of entries) {
    if (item.kind === "group") {
      const children = item.children.filter((s) => gate(s.href));
      if (children.length === 0) continue;
      out.push({ ...item, children });
    } else if (gate(item.href)) {
      out.push(item);
    }
  }
  return out;
}

const SAMPLE_NAV: NavEntry[] = [
  { kind: "leaf", href: "/import-export" },
  {
    kind: "group",
    children: [
      { href: "/orders/metal" },
      { href: "/orders/wood" },
    ],
  },
];

describe("sidebar permission gating", () => {
  it("hides import-export when import_export:import is missing", () => {
    const keys = new Set(["orders:metal:view", "orders:wood:view"]);
    const visible = filterNav(SAMPLE_NAV, keys);
    expect(visible.some((e) => e.kind === "leaf" && e.href === "/import-export")).toBe(false);
  });

  it("shows import-export when permission is granted", () => {
    const keys = new Set(["import_export:import"]);
    const visible = filterNav(SAMPLE_NAV, keys);
    expect(visible.some((e) => e.kind === "leaf" && e.href === "/import-export")).toBe(true);
  });

  it("drops production order group when no child is allowed", () => {
    const visible = filterNav(SAMPLE_NAV, new Set());
    const groups = visible.filter((e) => e.kind === "group");
    expect(groups).toHaveLength(0);
  });
});
