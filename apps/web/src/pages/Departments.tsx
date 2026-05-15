import { Building2, Cpu, Trees } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import {
  employeeAssignmentsFixture,
  factoryCapacityFixture,
} from "../data/fixtures";
import type { EmployeeAssignments, FactoryCapacitySchema } from "../data/types";
import { useFhReferenceSnapshot } from "../lib/api/hooks/useFactoryHub";

export default function Departments() {
  const { data: capRef, isSuccess: capOk } = useFhReferenceSnapshot("factory_capacity");
  const { data: empRef, isSuccess: empOk } = useFhReferenceSnapshot("employee_assignments");

  const factoryCapacityLive: FactoryCapacitySchema =
    (capRef?.payload as unknown as FactoryCapacitySchema | undefined) ?? factoryCapacityFixture;
  const employeeAssignmentsLive: EmployeeAssignments =
    (empRef?.payload as unknown as EmployeeAssignments | undefined) ?? employeeAssignmentsFixture;

  const woodFactory = factoryCapacityLive.woodworking_factory;
  const metalFactory = factoryCapacityLive.metal_factory;

  const refLabel = capOk && empOk ? "Hub reference" : "Fixture fallback (API unavailable or empty)";

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-luxury" />
          Departments & capacity
        </h1>
        <ArabicText className="text-brand-metal mt-1">الأقسام — السعة والموارد البشرية</ArabicText>
        <p className="text-[10px] text-brand-metal mt-2 font-mono">{refLabel}</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-wood">
          <Trees className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-widest">{woodFactory?.name ?? "Wood factory"}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(woodFactory?.departments ?? []).map((dept) => {
            const emps = employeeAssignmentsLive.departments[dept.id] ?? [];
            return (
              <article key={dept.id} className="glass-panel p-4 border border-brand-border space-y-2">
                <div className="flex justify-between gap-2">
                  <h3 className="text-sm font-bold">{dept.name}</h3>
                  <span className="text-[10px] text-brand-metal">
                    {emps.length} people · {dept.tasks.length} stations
                  </span>
                </div>
                {dept.description ? (
                  <ArabicText className="text-xs text-brand-metal">{dept.description}</ArabicText>
                ) : null}
                <ul className="text-[10px] text-brand-metal space-y-1 max-h-32 overflow-y-auto">
                  {emps.map((e) => (
                    <li key={e.employee_id}>
                      {e.name} <span className="opacity-60">{e.job_title}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-metal">
          <Cpu className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-widest">{metalFactory?.name ?? "Metal factory"}</h2>
        </div>
        <p className="text-xs text-brand-metal leading-relaxed">
          Metal workforce names are not in the wood-only fixture. Showing stations/tasks per department until a shared{" "}
          <code className="text-brand-luxury">GET /api/employees</code> feed exists.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {(metalFactory?.departments ?? []).map((dept) => (
            <article key={dept.id} className="glass-panel p-4 border border-brand-border space-y-2">
                <div className="flex justify-between gap-2">
                  <h3 className="text-sm font-bold">{dept.name}</h3>
                  <span className="text-[10px] text-brand-metal">{dept.tasks.length} stations</span>
                </div>
                {dept.description ? (
                  <ArabicText className="text-xs text-brand-metal">{dept.description}</ArabicText>
                ) : null}
              <p className="text-[10px] text-brand-metal">Workforce allocation: planned / TBD from HR integration.</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
