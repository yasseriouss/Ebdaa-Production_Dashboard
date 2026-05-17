import { Building2, Cpu, Trees } from "lucide-react";
import {
  employeeAssignmentsFixture,
  factoryCapacityFixture,
  DEPARTMENT_REPORTS_TO,
} from "../data/fixtures";
import { departmentReportsToLabel } from "../data/routing";
import type { EmployeeAssignments, FactoryCapacitySchema } from "../data/types";
import { useFhReferenceSnapshot } from "../lib/api/hooks/useFactoryHub";
import { useTranslation } from "../context/I18nContext";

export default function Departments() {
  const { t, locale } = useTranslation();
  const { data: capRef, isSuccess: capOk } = useFhReferenceSnapshot("factory_capacity");
  const { data: empRef, isSuccess: empOk } = useFhReferenceSnapshot("employee_assignments");

  const factoryCapacityLive: FactoryCapacitySchema =
    (capRef?.payload as unknown as FactoryCapacitySchema | undefined) ?? factoryCapacityFixture;
  const employeeAssignmentsLive: EmployeeAssignments =
    (empRef?.payload as unknown as EmployeeAssignments | undefined) ?? employeeAssignmentsFixture;

  const woodFactory = factoryCapacityLive.woodworking_factory;
  const metalFactory = factoryCapacityLive.metal_factory;

  const refLabel = capOk && empOk ? t("pages.departments.refHub") : t("pages.departments.refFixture");

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="border-b border-brand-border pb-6">
        <h1 className="text-2xl font-bold tracking-tighter uppercase flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-luxury" />
          {t("pages.departments.title")}
        </h1>
        <p className="text-sm text-brand-metal mt-1">{t("pages.departments.subtitle")}</p>
        <p className="text-[10px] text-brand-metal mt-2 font-mono">{refLabel}</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center gap-2 text-brand-wood">
          <Trees className="w-5 h-5" />
          <h2 className="text-sm font-bold uppercase tracking-widest">{woodFactory?.name ?? t("pages.departments.woodFactory")}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(woodFactory?.departments ?? []).map((dept) => {
            const emps = employeeAssignmentsLive.departments[dept.id] ?? [];
            const parentId = DEPARTMENT_REPORTS_TO[dept.id];
            const factoryName =
              locale === "ar" ? (woodFactory?.name ?? "") : t("pages.departments.woodFactoryOfficial");
            return (
              <article key={dept.id} className="glass-panel p-4 border border-brand-border space-y-2">
                <div className="flex justify-between gap-2">
                  <h3 className="text-sm font-bold">{dept.name}</h3>
                  <span className="text-[10px] text-brand-metal">
                    {t("pages.departments.peopleStations", {
                      people: String(emps.length),
                      stations: String(dept.tasks.length),
                    })}
                  </span>
                </div>
                <div className="text-[10px] text-brand-metal space-y-0.5">
                  <p dir="auto">
                    {t("pages.departments.belongsToFactory", {
                      name: factoryName,
                      id: woodFactory?.factory_id ?? "",
                    })}
                  </p>
                  {parentId ? (
                    <p dir="auto">
                      {t("pages.departments.subDepartmentOf", {
                        parent: departmentReportsToLabel(parentId, locale),
                      })}
                    </p>
                  ) : (
                    <p dir="auto">{t("pages.departments.topLevelDepartment")}</p>
                  )}
                </div>
                {dept.description ? (
                  <p className="text-xs text-brand-metal" dir="auto">
                    {dept.description}
                  </p>
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
          <h2 className="text-sm font-bold uppercase tracking-widest">{metalFactory?.name ?? t("pages.departments.metalFactory")}</h2>
        </div>
        <p className="text-xs text-brand-metal leading-relaxed" dir="ltr" lang="en">
          {t("pages.departments.metalWorkforceHint")}
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {(metalFactory?.departments ?? []).map((dept) => {
            const parentId = DEPARTMENT_REPORTS_TO[dept.id];
            const factoryName =
              locale === "ar" ? (metalFactory?.name ?? "") : t("pages.departments.metalFactoryOfficial");
            return (
              <article key={dept.id} className="glass-panel p-4 border border-brand-border space-y-2">
                <div className="flex justify-between gap-2">
                  <h3 className="text-sm font-bold">{dept.name}</h3>
                  <span className="text-[10px] text-brand-metal">
                    {t("pages.departments.stationsOnly", { n: String(dept.tasks.length) })}
                  </span>
                </div>
                <div className="text-[10px] text-brand-metal space-y-0.5">
                  <p dir="auto">
                    {t("pages.departments.belongsToFactory", {
                      name: factoryName,
                      id: metalFactory?.factory_id ?? "",
                    })}
                  </p>
                  {parentId ? (
                    <p dir="auto">
                      {t("pages.departments.subDepartmentOf", {
                        parent: departmentReportsToLabel(parentId, locale),
                      })}
                    </p>
                  ) : (
                    <p dir="auto">{t("pages.departments.topLevelDepartment")}</p>
                  )}
                </div>
              {dept.description ? (
                <p className="text-xs text-brand-metal" dir="auto">
                  {dept.description}
                </p>
              ) : null}
              <p className="text-[10px] text-brand-metal">{t("pages.departments.workforcePlanned")}</p>
            </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
