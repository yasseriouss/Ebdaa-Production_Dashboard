import { describe, expect, it } from "vitest";
import { interpolate, resolveMessage } from "./resolveMessage";

const tree = {
  nav: { dashboard: "Home" },
  factory: { productionHub: { title: "Production" } },
};

describe("resolveMessage", () => {
  it("resolves nested keys", () => {
    expect(resolveMessage(tree, "nav.dashboard")).toBe("Home");
    expect(resolveMessage(tree, "factory.productionHub.title")).toBe("Production");
  });

  it("returns undefined for missing keys without throwing", () => {
    expect(resolveMessage(tree, "missing.key")).toBeUndefined();
    expect(resolveMessage(tree, "nav.dashboard.extra")).toBeUndefined();
  });
});

describe("interpolate", () => {
  it("substitutes params and leaves unknown placeholders", () => {
    expect(interpolate("Hello {{name}}", { name: "Ada" })).toBe("Hello Ada");
    expect(interpolate("x={{y}}", {})).toBe("x={{y}}");
  });
});
