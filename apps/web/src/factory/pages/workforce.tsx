import { useState } from "react";
import { useListEmployees, useGetEmployeeStats, useGetEmployeesHeadcount } from "@workspace/api-client-react";
import { PieBulletLegend } from "@factory/components/PieBulletLegend";
import { Skeleton } from "@factory/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@factory/lib/utils";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const DEPT_COLORS = [
  "oklch(64% 0.13 28)", "oklch(65% 0.15 250)", "oklch(65% 0.15 140)",
  "oklch(60% 0.15 30)", "oklch(60% 0.15 280)", "oklch(75% 0.15 80)",
  "oklch(55% 0.18 310)", "oklch(70% 0.12 200)", "oklch(68% 0.14 60)",
  "oklch(58% 0.12 170)", "oklch(62% 0.16 350)", "oklch(72% 0.10 120)",
];

const executiveTransition = { type: "spring" as const, damping: 30, stiffness: 200, mass: 1 };
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const itemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: executiveTransition },
};

type ViewMode = "roster" | "headcount";

export default function Workforce() {
  const { ft } = useFactoryTranslation();
  const [departmentId, setDepartmentId] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");
  const [redact, setRedact] = useState(false);
  const [view, setView] = useState<ViewMode>("roster");

  const { data: stats, isLoading: loadingStats } = useGetEmployeeStats();
  const { data: headcount, isLoading: loadingHC } = useGetEmployeesHeadcount();
  const { data: employees, isLoading: loadingList } = useListEmployees({
    department_id: departmentId || undefined,
    role: role || undefined,
    search: search || undefined,
    redact: redact ? "true" : undefined,
  });

  const empList = Array.isArray(employees) ? employees : [];
  const hcList = Array.isArray(headcount) ? headcount : [];

  const deptPieData = (stats?.departments || []).map((d: any, i: number) => ({
    name: d.departmentName || d.departmentId,
    value: d.count,
    fill: DEPT_COLORS[i % DEPT_COLORS.length],
  }));

  const hcChartData = hcList.map((h: any) => ({
    dept: h.departmentId,
    planned: h.plannedCount,
    actual: h.actualCount,
  }));

  function handleExportCsv() {
    const params = new URLSearchParams();
    if (departmentId) params.set("department_id", departmentId);
    if (role) params.set("role", role);
    if (search) params.set("search", search);
    if (redact) params.set("redact", "true");
    window.open(`/api/export/employees?${params.toString()}`, "_blank");
  }

  if (loadingStats) {
    return (
      <div className="mx-auto max-w-(--breakpoint-2xl) space-y-8 p-4 sm:p-8 lg:p-12">
        <Skeleton className="mb-2 h-10 w-56 sm:h-12 sm:w-72" />
        <Skeleton className="h-6 w-full max-w-md" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8">
          <Skeleton className="h-36 rounded-4xl sm:h-40" />
          <Skeleton className="h-36 rounded-4xl sm:h-40" />
        </div>
        <Skeleton className="h-[min(55vw,16rem)] min-h-50 w-full rounded-4xl" />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-(--breakpoint-2xl) space-y-8 p-4 sm:space-y-10 sm:p-8 lg:p-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">{ft("workforce.title")}</h1>
        <p className="text-base text-muted-foreground font-medium sm:text-lg">{ft("workforce.subtitle")}</p>
      </header>

      {/* KPI cards — scale with viewport and card bounds */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 *:min-w-0">
        <motion.div variants={itemVariants} className="double-bezel-outer">
          <div className="double-bezel-inner flex h-full min-h-[clamp(7.5rem,22vw,11rem)] flex-col justify-between gap-3 p-4 sm:p-5 md:p-6">
            <h3 className="text-[clamp(0.625rem,1.6vw,0.75rem)] font-bold uppercase leading-snug tracking-wider text-muted-foreground">
              {ft("workforce.totalEmployees")}
            </h3>
            <div className="text-[clamp(1.75rem,6vw+0.5rem,3rem)] font-bold leading-none tracking-tight text-foreground tabular-nums">
              {stats?.total || 0}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="double-bezel-outer">
          <div className="double-bezel-inner flex h-full min-h-[clamp(7.5rem,22vw,11rem)] flex-col justify-between gap-3 p-4 sm:p-5 md:p-6">
            <h3 className="text-[clamp(0.625rem,1.6vw,0.75rem)] font-bold uppercase leading-snug tracking-wider text-muted-foreground">
              {ft("workforce.departments")}
            </h3>
            <div className="text-[clamp(1.75rem,6vw+0.5rem,3rem)] font-bold leading-none tracking-tight text-foreground tabular-nums">
              {stats?.departments?.length || 0}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Department distribution — full-width row */}
      <motion.section variants={itemVariants} className="double-bezel-outer w-full min-w-0">
        <div className="double-bezel-inner flex flex-col gap-4 p-4 sm:gap-5 sm:p-5 md:p-8">
          <h2 className="shrink-0 border-b border-foreground/10 pb-3 text-sm font-bold tracking-wide text-foreground sm:text-base">
            {ft("workforce.deptChart")}
          </h2>
          <div className="h-[min(55vw,14rem)] w-full min-h-50 sm:h-[min(45vw,16rem)] sm:min-h-56 md:h-[min(40vw,18rem)] md:min-h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 4, right: 4, bottom: 8, left: 4 }}>
                <Pie
                  data={deptPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="72%"
                  innerRadius="42%"
                  paddingAngle={3}
                  stroke="none"
                >
                  {deptPieData.map((entry: any, idx: number) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "oklch(99% 0.008 70)",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "clamp(11px, 2.5vw, 12px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {deptPieData.length > 0 && (
            <div className="border-t border-foreground/10 pt-3">
              <PieBulletLegend
                className="text-[clamp(10px,2.2vw,11px)]"
                items={deptPieData.map((d: { name: string; fill: string; value: number }) => ({
                  name: d.name,
                  fill: d.fill,
                  value: d.value,
                }))}
              />
            </div>
          )}
        </div>
      </motion.section>

      {/* View toggle */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          onClick={() => setView("roster")}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
            view === "roster" ? "bg-accent text-white" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
          )}
        >
          قائمة الموظفين
        </button>
        <button
          onClick={() => setView("headcount")}
          className={cn(
            "px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
            view === "headcount" ? "bg-accent text-white" : "bg-foreground/5 text-foreground hover:bg-foreground/10"
          )}
        >
          المخطط مقابل الفعلي
        </button>
      </motion.div>

      {view === "roster" && (
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Filters */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">القسم</label>
                  <select
                    value={departmentId}
                    onChange={e => setDepartmentId(e.target.value)}
                    className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  >
                    <option value="">الكل</option>
                    {(stats?.departments || []).map((d: any) => (
                      <option key={d.departmentId} value={d.departmentId}>{d.departmentName || d.departmentId}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[160px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الدور</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  >
                    <option value="">الكل</option>
                    {(stats?.roles || []).map((r: any) => (
                      <option key={r.role} value={r.role}>{r.role}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">بحث بالاسم</label>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="عربي أو إنجليزي..."
                    className="h-10 rounded-xl border border-foreground/10 bg-background px-3 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer h-10">
                  <input type="checkbox" checked={redact} onChange={e => setRedact(e.target.checked)} className="rounded" />
                  <span className="text-sm font-medium text-muted-foreground">إخفاء الأسماء</span>
                </label>
                <button
                  onClick={handleExportCsv}
                  className="h-10 px-6 rounded-xl bg-foreground/5 text-sm font-bold hover:bg-foreground/10 transition-colors"
                >
                  تصدير CSV
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/5">
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">المعرّف</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">الاسم</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">القسم</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">المسمى الوظيفي</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">الدور</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">تاريخ التعيين</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList ? (
                    <tr><td colSpan={6} className="p-8 text-center"><Skeleton className="h-6 w-48 mx-auto" /></td></tr>
                  ) : empList.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">لا توجد نتائج</td></tr>
                  ) : (
                    empList.map((emp: any) => (
                      <tr key={emp.id} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                        <td className="p-4 font-mono text-xs text-muted-foreground">{emp.id}</td>
                        <td className="p-4 font-medium">{emp.name}</td>
                        <td className="p-4 text-muted-foreground">{emp.departmentName || emp.departmentId || "—"}</td>
                        <td className="p-4 text-muted-foreground">{emp.jobTitle}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">{emp.standardizedRole}</span>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">{emp.hireDate || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="p-4 text-xs text-muted-foreground border-t border-foreground/5">
                {empList.length} موظف
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <p className="text-xs text-muted-foreground">
            يحتوي على بيانات شخصية. للاستخدام المحلي فقط — لا تشارك لقطات الشاشة بدون إخفاء الأسماء.
          </p>
        </motion.div>
      )}

      {view === "headcount" && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-8">المخطط مقابل الفعلي حسب القسم</h3>
              <div className="h-[400px]">
                {loadingHC ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hcChartData} layout="vertical" margin={{ right: 30, left: 120 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(22% 0.02 50 / 0.05)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "oklch(22% 0.02 50)" }} />
                      <YAxis type="category" dataKey="dept" tick={{ fontSize: 11, fill: "oklch(22% 0.02 50)" }} width={110} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "oklch(99% 0.008 70)", border: "none", borderRadius: "12px", fontSize: "12px" }} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="planned" name="المخطط" fill="oklch(65% 0.15 250)" radius={[0, 8, 8, 0]} barSize={16} />
                      <Bar dataKey="actual" name="الفعلي" fill="oklch(65% 0.15 140)" radius={[0, 8, 8, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Headcount table */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-foreground/5">
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">القسم</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">المخطط</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">الفعلي</th>
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">الفرق</th>
                  </tr>
                </thead>
                <tbody>
                  {hcList.map((row: any) => (
                    <tr key={row.departmentId} className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors">
                      <td className="p-4 font-medium">{row.departmentId}</td>
                      <td className="p-4 tabular-nums">{row.plannedCount}</td>
                      <td className="p-4 tabular-nums">{row.actualCount}</td>
                      <td className={cn("p-4 tabular-nums font-bold", row.delta > 0 ? "text-green-600" : row.delta < 0 ? "text-red-500" : "text-muted-foreground")}>
                        {row.delta > 0 ? `+${row.delta}` : row.delta}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
