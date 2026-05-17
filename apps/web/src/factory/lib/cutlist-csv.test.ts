import { describe, expect, it } from "vitest";
import { formatCutlistForOrderNotes, parseCutlistCsv } from "./cutlist-csv";

describe("parseCutlistCsv", () => {
  it("parses comma-separated headers in English", () => {
    const csv = `part no,description,qty,dept
P-1,Door panel,2,CNC`;
    const rows = parseCutlistCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].partCode).toBe("P-1");
    expect(rows[0].description).toBe("Door panel");
    expect(rows[0].qty).toBe(2);
    expect(rows[0].department).toBe("CNC");
  });

  it("returns empty array when headers are unrecognized", () => {
    expect(parseCutlistCsv("foo,bar\n1,2")).toEqual([]);
  });
});

describe("formatCutlistForOrderNotes", () => {
  it("includes line label and parts summary", () => {
    const parts = parseCutlistCsv(`code,description,qty\nA,Part A,1`);
    const text = formatCutlistForOrderNotes("Line 1", "Wood", parts);
    expect(text).toContain("Line 1");
    expect(text).toContain("Part A");
  });
});
