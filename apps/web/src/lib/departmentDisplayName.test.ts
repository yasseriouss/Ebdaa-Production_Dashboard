import { describe, expect, it } from "vitest";
import { formatDepartmentDisplayName } from "./departmentDisplayName";

describe("formatDepartmentDisplayName", () => {
  it("shortens DEPT_PANEL_PROC by id", () => {
    expect(
      formatDepartmentDisplayName("قسم المسطحات والتشغيل الآلي", "DEPT_PANEL_PROC"),
    ).toBe("قسم المسطحات");
  });

  it("shortens legacy name without id", () => {
    expect(formatDepartmentDisplayName("قسم المسطحات والتشغيل الآلي")).toBe("قسم المسطحات");
  });

  it("leaves other departments unchanged", () => {
    expect(formatDepartmentDisplayName("قسم النجارة")).toBe("قسم النجارة");
  });
});
