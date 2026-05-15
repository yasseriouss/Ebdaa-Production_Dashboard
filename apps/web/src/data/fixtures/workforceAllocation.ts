import type { WorkforceAllocation } from "../types";

/**
 * Planned headcount per role (planning baseline) parsed from
 * `Data/gem_Claude/gemini-code-1778775978292.json`. The source file is JSONC
 * with `//` comments; transcribed here as strict TS so it loads in the bundle.
 */
export const workforceAllocationFixture: WorkforceAllocation = {
  factory_id: "WF-001",
  management_engineering_layer: [
    { role_title: "مدير انتاج الخشبي", count: 1, type: "Plant Manager" },
    { role_title: "مهندس أول انتاج خشبى", count: 1, type: "Senior Production Engineer" },
    { role_title: "مهندس انتاج خشبي صناعي", count: 1, type: "Industrial Engineer" },
    { role_title: "مسئول متابعة خشبى", count: 1, type: "Production Follow-up" },
    { role_title: "مهندس CNC", count: 1, type: "CNC Programmer" },
  ],
  departments_workforce: [
    {
      department_id: "DEPT_SOLID_WOOD",
      staff: [
        { role_title: "مشرف قسم الطبيعي", count: 2, type: "Supervisor" },
        { role_title: "فنى نجار طبيعى و مكنجى", count: 7, type: "Machine Operator" },
        { role_title: "فنى نجار كرسجى", count: 4, type: "Specialized Joiner" },
        { role_title: "فنى نجار بنك", count: 11, type: "Bench Joiner" },
        { role_title: "نجار طبيعي", count: 2, type: "Joiner" },
      ],
    },
    {
      department_id: "DEPT_PANEL_PROC",
      staff: [
        { role_title: "فنى مقطع CNC", count: 3, type: "Panel Saw Operator" },
        { role_title: "فنى تخريم CNC", count: 4, type: "CNC Operator" },
        { role_title: "فنى شريط", count: 3, type: "Edge Bander Operator" },
        { role_title: "مساعد فنى CNC", count: 1, type: "Assistant" },
        { role_title: "مساعد فنى شريط", count: 1, type: "Assistant" },
      ],
    },
    {
      department_id: "DEPT_VENEER",
      staff: [
        { role_title: "فنى قشره", count: 2, type: "Veneer Technician" },
        { role_title: "فني مكابس", count: 1, type: "Press Operator" },
      ],
    },
    {
      department_id: "DEPT_SANDING",
      staff: [{ role_title: "فنى صنفرة", count: 2, type: "Sanding Technician" }],
    },
    {
      department_id: "DEPT_WOOD_PAINT",
      staff: [
        { role_title: "مشرف دهانات", count: 1, type: "Supervisor" },
        { role_title: "فنى دهانات", count: 23, type: "Painter/Finisher" },
      ],
    },
    {
      department_id: "DEPT_UPHOLSTERY",
      staff: [
        { role_title: "مشرف تنجيد", count: 1, type: "Supervisor" },
        { role_title: "فنى تنجيد شامل", count: 7, type: "Upholsterer" },
        { role_title: "فنى مقص وتلبيس", count: 2, type: "Cutter/Fitter" },
        { role_title: "فنى خياط", count: 2, type: "Tailor" },
      ],
    },
    {
      department_id: "DEPT_WOOD_ASSY",
      staff: [{ role_title: "فنى تجميع خشبى", count: 15, type: "Assembler" }],
    },
    {
      department_id: "SUPPORT_POOL",
      staff: [{ role_title: "مساعد عام خشبى", count: 7, type: "General Helper/Material Handler" }],
    },
  ],
};

/** Total planned headcount across all departments + management. */
export function plannedTotalHeadcount(): number {
  const mgmt = workforceAllocationFixture.management_engineering_layer.reduce(
    (acc, r) => acc + r.count,
    0,
  );
  const dept = workforceAllocationFixture.departments_workforce.reduce(
    (acc, d) => acc + d.staff.reduce((s, r) => s + r.count, 0),
    0,
  );
  return mgmt + dept;
}
