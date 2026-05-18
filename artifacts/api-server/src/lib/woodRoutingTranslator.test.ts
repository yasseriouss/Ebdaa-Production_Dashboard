import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  hubRoutingToLegacyStages,
  legacyStageQtyFromHub,
  legacyStagesToHubRouting,
} from "./woodRoutingTranslator.ts";

describe("woodRoutingTranslator", () => {
  it("maps hub keys to legacy القطع as bottleneck min", () => {
    const routing = {
      panel_saw: { qty_passed: 100 },
      edge_banding: { qty_passed: 80 },
      cnc_routing: { qty_passed: 90 },
    };
    assert.equal(legacyStageQtyFromHub(routing, "القطع"), 80);
  });

  it("derives legacy stage status from total required", () => {
    const stages = hubRoutingToLegacyStages(
      { packaging: { qty_passed: 50 }, assembly: { qty_passed: 50 } },
      50,
    );
    const pack = stages.find((s) => s.stageName === "التغليف");
    assert.equal(pack?.status, "تم الانتهاء");
    assert.equal(pack?.qtyDone, "50");
  });

  it("round-trips legacy stages into hub keys in groups", () => {
    const hub = legacyStagesToHubRouting(
      [
        { stageName: "القطع", qtyDone: "10" },
        { stageName: "التجميع", qtyDone: "5" },
        { stageName: "التشطيب", qtyDone: "0" },
        { stageName: "التغليف", qtyDone: "0" },
      ],
      100,
    );
    assert.equal(hub.panel_saw.qty_passed, 10);
    assert.equal(hub.assembly.qty_passed, 5);
    assert.equal(hub.painting.qty_passed, 0);
  });
});
