import { useMemo, useState } from "react";
import { Activity, ChevronRight } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArabicText } from "../components/brand/ArabicText";
import { Select } from "../components/ui/Select";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { findDepartment } from "../data/fixtures/factoryCapacity";
import { woodWorkOrdersFixture, employeeAssignmentsFixture } from "../data/fixtures";
import { useFhWoodOrders } from "../lib/api/hooks/useFactoryHub";
import {
  completionPercent,
  statusFromCompletion,
  type WoodWorkOrder,
} from "../data/types";

export default function ProjectAnalytics() {
  const { data: hubWood = woodWorkOrdersFixture.work_orders } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const projects = useMemo(() => {
    return Array.from(new Set(hubWood.map((order) => order.project_name))).sort();
  }, [hubWood]);
  const [project, setProject] = useState<string>(projects[0] ?? "");

  const projectOrders = useMemo(
    () => hubWood.filter((o) => o.project_name === project),
    [hubWood, project],
  );

  const routingTotals = useMemo(() => {
    return WOOD_STAGE_ORDER.map((stage) => ({
      stage: WOOD_STAGE_LABELS[stage].english,
      qty: projectOrders.reduce(
        (acc, order) => acc + order.routing_progress[stage].qty_passed,
        0,
      ),
    }));
  }, [projectOrders]);

  const timeSeries = useMemo(() => {
    return projectOrders
      .filter((order) => order.dates.delivery_date !== "nan")
      .sort((a, b) => a.dates.delivery_date.localeCompare(b.dates.delivery_date))
      .map((order) => ({
        date: order.dates.delivery_date,
        completed: order.quantities.completed,
        total: order.quantities.total_required,
      }));
  }, [projectOrders]);

  const departmentsHit = useMemo(() => {
    const ids = new Set<string>();
    for (const order of projectOrders) {
      for (const stage of WOOD_STAGE_ORDER) {
        if (order.routing_progress[stage].qty_passed > 0) {
          ids.add(WOOD_STAGE_LABELS[stage].department);
        }
      }
    }
    return Array.from(ids);
  }, [projectOrders]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end border-b border-brand-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-brand-wood" />
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Project Analytics</h2>
          </div>
          <p className="text-sm text-brand-metal mt-1">
            Drill into a single project across the routing path
            <span className="mx-2 text-brand-border">|</span>
            <ArabicText>تحليلات المشاريع</ArabicText>
          </p>
        </div>
        <Select
          label="Active project"
          value={project}
          onChange={(event) => setProject(event.target.value)}
          className="min-w-[16rem]"
        >
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Stat label="Work Orders" value={projectOrders.length.toString()} />
        <Stat
          label="Units (target)"
          value={projectOrders
            .reduce((a, o) => a + o.quantities.total_required, 0)
            .toLocaleString()}
        />
        <Stat
          label="Units (done)"
          value={projectOrders
            .reduce((a, o) => a + o.quantities.completed, 0)
            .toLocaleString()}
        />
        <Stat
          label="Avg progress"
          value={`${Math.round(
            projectOrders.reduce((a, o) => a + completionPercent(o.quantities), 0) /
              Math.max(projectOrders.length, 1),
          )}%`}
        />
      </section>

      <section className="glass-panel p-4 sm:p-6 md:p-8">
        <header className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest">Project Routing</h3>
          <p className="text-[10px] text-brand-metal uppercase tracking-wider">
            Stages activated by this project
          </p>
        </header>
        <ol className="flex flex-wrap items-stretch gap-2">
          {WOOD_STAGE_ORDER.map((stage, index) => {
            const labels = WOOD_STAGE_LABELS[stage];
            const dept = findDepartment(labels.department);
            const qty = routingTotals[index].qty;
            const active = qty > 0;
            return (
              <li key={stage} className="flex items-center gap-2">
                <div
                  className={`min-w-[12rem] border bg-brand-black/40 p-3 ${
                    active ? "border-brand-wood/60" : "border-brand-border"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest text-brand-metal">
                    Step {index + 1}
                  </p>
                  <p className="text-xs font-bold text-brand-luxury">{labels.english}</p>
                  <ArabicText className="block text-[10px] text-brand-metal">
                    {labels.arabic}
                  </ArabicText>
                  <p className="text-[10px] text-brand-metal mt-1">
                    {dept?.name}
                  </p>
                  <p className="text-[11px] mt-2 text-brand-luxury">
                    {qty.toLocaleString()} units
                  </p>
                </div>
                {index < WOOD_STAGE_ORDER.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-brand-metal" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <article className="glass-panel p-4 sm:p-6 md:p-8">
          <header className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest">Throughput by Stage</h3>
            <p className="text-[10px] text-brand-metal uppercase tracking-wider">
              Units completed (project total)
            </p>
          </header>
          <div className="h-[260px] sm:h-[280px] min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routingTotals} margin={{ top: 12, right: 12, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="stage" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                />
                <Bar dataKey="qty" fill="#D97706" radius={0} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel p-4 sm:p-6 md:p-8">
          <header className="mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest">Delivery Curve</h3>
            <p className="text-[10px] text-brand-metal uppercase tracking-wider">
              Per work-order completed vs target
            </p>
          </header>
          <div className="h-[260px] sm:h-[280px] min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 12, right: 12, left: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                />
                <Line type="monotone" dataKey="total" stroke="#71717A" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completed" stroke="#D97706" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="glass-panel p-4 sm:p-6 md:p-8">
        <header className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest">BOM Breakdown</h3>
          <p className="text-[10px] text-brand-metal uppercase tracking-wider">
            Products → Parts → Stages (derived from work orders)
          </p>
        </header>
        <ul className="space-y-3">
          {projectOrders.map((order) => (
            <BomNode key={order.work_order_id} order={order} />
          ))}
          {projectOrders.length === 0 && (
            <li className="text-xs text-brand-metal">No work orders for this project.</li>
          )}
        </ul>
      </section>

      <section className="glass-panel p-6">
        <header className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest">Resource Utilization</h3>
          <p className="text-[10px] text-brand-metal uppercase tracking-wider">
            Departments actively touched by this project
          </p>
        </header>
        {departmentsHit.length === 0 ? (
          <p className="text-xs text-brand-metal">No production progress recorded yet.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {departmentsHit.map((deptId) => {
              const dept = findDepartment(deptId);
              const headcount =
                employeeAssignmentsFixture.departments[deptId]?.length ?? 0;
              return (
                <li key={deptId} className="border border-brand-border p-3 bg-brand-black/40">
                  <p className="text-[10px] uppercase tracking-widest text-brand-metal">
                    {deptId}
                  </p>
                  <ArabicText className="block text-xs text-brand-luxury">
                    {dept?.name ?? deptId}
                  </ArabicText>
                  <p className="text-[10px] text-brand-metal mt-2">
                    {dept?.tasks.length ?? 0} tasks · {headcount} staff
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">{label}</p>
      <p className="mt-2 text-2xl font-bold text-brand-luxury">{value}</p>
    </div>
  );
}

function BomNode({ order }: { order: WoodWorkOrder }) {
  const status = statusFromCompletion(completionPercent(order.quantities));
  return (
    <li className="border border-brand-border p-3 bg-brand-black/40">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-brand-metal">
            {order.work_order_id}
          </p>
          <ArabicText className="block text-xs text-brand-luxury">
            {order.product_name}
          </ArabicText>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-brand-metal">
          {status} · {order.quantities.completed}/{order.quantities.total_required}
        </span>
      </div>
      <ol className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-brand-metal">
        {WOOD_STAGE_ORDER.map((stage) => {
          const passed = order.routing_progress[stage].qty_passed;
          if (!passed) return null;
          return (
            <li
              key={stage}
              className="border border-brand-border px-2 py-1 bg-brand-elevated text-brand-luxury"
            >
              {WOOD_STAGE_LABELS[stage].english}
              <span className="text-brand-metal"> · {passed}</span>
            </li>
          );
        })}
      </ol>
    </li>
  );
}
