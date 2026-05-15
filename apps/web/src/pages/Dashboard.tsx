import { useMemo } from "react";
import { Link } from "wouter";
import {
  AlertTriangle,
  BookOpen,
  CalendarRange,
  Clock,
  Cpu,
  Factory,
  Package,
  Shield,
  TrendingUp,
  Trees,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArabicText } from "../components/brand/ArabicText";
import { BrandLogo } from "../components/brand/BrandLogo";
import {
  employeeAssignmentsFixture,
  factoryCapacityFixture,
  woodWorkOrdersFixture,
} from "../data/fixtures";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { useFhReferenceSnapshot, useFhWoodOrders } from "../lib/api/hooks/useFactoryHub";
import {
  completionPercent,
  statusFromCompletion,
  type EmployeeAssignments,
  type FactoryCapacitySchema,
  type WoodWorkOrder,
  type WorkOrderStatus,
} from "../data/types";

interface StatCardProps {
  title: string;
  arabicTitle: string;
  value: string;
  trend?: "up" | "down";
  trendValue?: string;
  icon: React.ElementType;
  color: string;
}

function StatCard({
  title,
  arabicTitle,
  value,
  trend,
  trendValue,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="stat-card group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-bold text-brand-metal uppercase tracking-widest">{title}</p>
          <ArabicText block className="text-[9px] text-brand-metal mb-2">
            {arabicTitle}
          </ArabicText>
          <h3 className="text-2xl font-bold text-brand-luxury mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-brand-border">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span
            className={`text-[10px] font-bold ${
              trend === "up" ? "text-brand-success" : "text-brand-error"
            }`}
          >
            {trendValue}
          </span>
          <span className="text-[10px] text-brand-metal uppercase tracking-wider">vs last week</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-metal/20 to-transparent" />
    </div>
  );
}

const STATUS_TONE: Record<WorkOrderStatus, string> = {
  Done: "#10B981",
  "In Progress": "#F59E0B",
  Pending: "#71717A",
};

const SYNTHETIC_WEEK = [
  { name: "Mon", metal: 412, wood: 280 },
  { name: "Tue", metal: 365, wood: 318 },
  { name: "Wed", metal: 290, wood: 422 },
  { name: "Thu", metal: 348, wood: 410 },
  { name: "Fri", metal: 401, wood: 510 },
  { name: "Sat", metal: 320, wood: 388 },
  { name: "Sun", metal: 244, wood: 220 },
];

function aggregateStatus(orders: WoodWorkOrder[]) {
  const buckets: Record<WorkOrderStatus, number> = {
    Done: 0,
    "In Progress": 0,
    Pending: 0,
  };
  for (const order of orders) {
    buckets[statusFromCompletion(completionPercent(order.quantities))] += 1;
  }
  return (Object.keys(buckets) as WorkOrderStatus[]).map((key) => ({
    name: key,
    value: buckets[key],
  }));
}

function aggregateStageThroughput(orders: WoodWorkOrder[]) {
  return WOOD_STAGE_ORDER.map((stage) => {
    const total = orders.reduce(
      (acc, order) => acc + order.routing_progress[stage].qty_passed,
      0,
    );
    return { stage: WOOD_STAGE_LABELS[stage].english, qty: total };
  });
}

export default function Dashboard() {
  const { data: orders = woodWorkOrdersFixture.work_orders, isSuccess: hubOrdersLive } = useFhWoodOrders(
    woodWorkOrdersFixture.work_orders,
  );
  const { data: capRef, isSuccess: capHub } = useFhReferenceSnapshot("factory_capacity");
  const { data: empRef, isSuccess: empHub } = useFhReferenceSnapshot("employee_assignments");

  const factoryCapacityLive: FactoryCapacitySchema =
    (capRef?.payload as unknown as FactoryCapacitySchema | undefined) ?? factoryCapacityFixture;
  const employeeAssignmentsLive: EmployeeAssignments =
    (empRef?.payload as unknown as EmployeeAssignments | undefined) ?? employeeAssignmentsFixture;
  const statusData = useMemo(() => aggregateStatus(orders), [orders]);
  const stageData = useMemo(() => aggregateStageThroughput(orders), [orders]);

  const totalOrders = orders.length;
  const wip = orders.filter(
    (o) => statusFromCompletion(completionPercent(o.quantities)) === "In Progress",
  ).length;
  const bottleneck = stageData.reduce(
    (acc, row) => (row.qty < acc.qty ? row : acc),
    stageData[0] ?? { stage: "—", qty: 0 },
  );
  const headcount =
    Object.values(employeeAssignmentsLive.departments).reduce((acc, list) => acc + list.length, 0) +
    employeeAssignmentsLive.management_layer.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-end border-b border-brand-border pb-6">
        <div className="flex items-start gap-4 min-w-0">
          <BrandLogo className="h-12 w-auto max-h-12 max-w-[120px] shrink-0 object-contain object-left" />
          <div className="min-w-0">
            <h2 className="text-3xl font-bold tracking-tighter uppercase">Command Center</h2>
            <p className="text-sm text-brand-metal font-medium mt-1">
              Global Manufacturing Overview
              <span className="mx-2 text-brand-border">|</span>
              <ArabicText>لوحة التحكم الرئيسية</ArabicText>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="industrial-btn">
            <Clock className="w-4 h-4" />
            <span>Shift Status: ON</span>
          </button>
          <button
            type="button"
            className="industrial-btn bg-brand-wood/10 border-brand-wood/50 text-brand-wood"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{bottleneck.stage} bottleneck</span>
          </button>
        </div>
      </header>

        <div className="flex flex-wrap gap-2 items-center">
        <p className="text-[9px] font-mono text-brand-metal w-full mb-1" dir="ltr">
          Data: orders {hubOrdersLive ? "hub" : "fixture"} · capacity {capHub ? "hub" : "fixture"} · assignments{" "}
          {empHub ? "hub" : "fixture"}
        </p>
        <Link
          href="/admin/permissions"
          className="industrial-btn py-1.5 px-3 text-[10px] gap-1.5 border-brand-success/40 text-brand-success bg-brand-success/5"
        >
          <Shield className="w-3 h-3" />
          <ArabicText className="text-[10px]">توزيع الصلاحيات</ArabicText>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-metal me-1">Ebdaa hub</span>
        <Link href="/about-system" className="industrial-btn py-1.5 px-3 text-[10px] gap-1.5">
          <BookOpen className="w-3 h-3" />
          About / تدريب
        </Link>
        <Link href="/equipment" className="industrial-btn py-1.5 px-3 text-[10px] gap-1.5">
          <Factory className="w-3 h-3" />
          Equipment
        </Link>
        <Link href="/planning" className="industrial-btn py-1.5 px-3 text-[10px] gap-1.5">
          <CalendarRange className="w-3 h-3" />
          Planning KPI
        </Link>
        <Link href="/daily/wood" className="industrial-btn py-1.5 px-3 text-[10px] gap-1.5 border-brand-wood/40 text-brand-wood">
          <Trees className="w-3 h-3" />
          Daily wood
        </Link>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          arabicTitle="إجمالي الطلبات"
          value={totalOrders.toLocaleString()}
          trend="up"
          trendValue="+12.5%"
          icon={Package}
          color="text-brand-luxury"
        />
        <StatCard
          title="Production WIP"
          arabicTitle="الإنتاج قيد التنفيذ"
          value={wip.toLocaleString()}
          trend="down"
          trendValue="-2.4%"
          icon={TrendingUp}
          color="text-brand-success"
        />
        <StatCard
          title="Bottleneck Stage"
          arabicTitle="مرحلة الاختناق"
          value={bottleneck.stage}
          icon={AlertTriangle}
          color="text-brand-error"
        />
        <StatCard
          title="Active Headcount"
          arabicTitle="العمالة المتاحة"
          value={headcount.toLocaleString()}
          icon={Users}
          color="text-brand-warning"
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 glass-panel p-4 sm:p-6 md:p-8 relative">
          <BrandLogo
            className="pointer-events-none select-none absolute right-6 bottom-6 h-8 w-auto max-h-8 max-w-[96px] object-contain opacity-10"
            alt=""
          />
          <header className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Productivity Index</h3>
              <p className="text-[10px] text-brand-metal uppercase tracking-wider">
                Weekly output comparison
                <span className="mx-2">|</span>
                <ArabicText>مؤشر الإنتاجية</ArabicText>
              </p>
            </div>
            <div className="flex gap-4">
              <Legend swatch="bg-brand-metal" label="Metal Factory" />
              <Legend swatch="bg-brand-wood" label="Wood Factory" />
            </div>
          </header>
          <div className="h-[280px] sm:h-[300px] w-full min-h-[240px] pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SYNTHETIC_WEEK} margin={{ top: 12, right: 8, left: 4, bottom: 8 }}>
                <defs>
                  <linearGradient id="colorMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717A" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#71717A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D97706" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#D97706" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                  itemStyle={{ color: "#F3F4F6" }}
                />
                <Area type="monotone" dataKey="metal" stroke="#71717A" strokeWidth={2} fillOpacity={1} fill="url(#colorMetal)" />
                <Area type="monotone" dataKey="wood" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorWood)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-panel p-4 sm:p-6 md:p-8 flex flex-col">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Wood Orders Mix</h3>
          <p className="text-[10px] text-brand-metal uppercase tracking-wider mb-6">
            <ArabicText>توزيع أوامر التشغيل</ArabicText>
          </p>
          <div className="flex flex-col gap-8 md:gap-10 lg:flex-row lg:items-center lg:justify-between flex-1 min-h-0">
            <div className="flex justify-center lg:justify-start shrink-0 w-full lg:w-[42%]">
              <div className="w-full max-w-[260px] aspect-square mx-auto lg:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#101010", border: "1px solid #1F1F1F", fontSize: "10px" }}
                      itemStyle={{ color: "#F3F4F6" }}
                      wrapperStyle={{ outline: "none" }}
                    />
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="42%"
                      outerRadius="68%"
                      paddingAngle={2}
                      stroke="#101010"
                      strokeWidth={2}
                      label={false}
                      isAnimationActive={false}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_TONE[entry.name as WorkOrderStatus]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <ul
              className="flex flex-col gap-4 lg:gap-5 flex-1 min-w-0 w-full lg:max-w-[min(100%,14rem)] xl:max-w-none lg:ps-8 lg:ms-2 lg:border-s border-brand-border pt-2 lg:pt-0"
              aria-label="Order status breakdown"
            >
              {statusData.map((entry) => (
                <li key={entry.name} className="flex items-start gap-4">
                  <span
                    className="mt-1 shrink-0 w-3 h-3 rounded-full ring-2 ring-brand-border shadow-sm"
                    style={{ backgroundColor: STATUS_TONE[entry.name as WorkOrderStatus] }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-brand-luxury leading-snug">
                      {entry.name}
                    </span>
                    <span className="text-[10px] text-brand-metal tabular-nums">
                      {entry.value} {entry.value === 1 ? "order" : "orders"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="lg:col-span-2 glass-panel p-4 sm:p-6 md:p-8">
          <header className="flex justify-between items-start mb-6 gap-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Stage Throughput</h3>
              <p className="text-[10px] text-brand-metal uppercase tracking-wider">
                Wood factory · units completed per stage
              </p>
            </div>
            <Trees className="w-4 h-4 text-brand-wood" />
          </header>
          <div className="h-[240px] sm:h-[260px] w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 12, right: 12, left: 8, bottom: 28 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="stage" stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={10} tickLine={false} axisLine={false} />
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
          <h3 className="text-sm font-bold uppercase tracking-widest mb-2">Department Load</h3>
          <p className="text-[10px] text-brand-metal uppercase tracking-wider mb-4">
            Open orders · per department
          </p>
          <ul className="space-y-3">
            {factoryCapacityLive.woodworking_factory.departments.slice(0, 6).map((dept) => {
              const assigned = employeeAssignmentsLive.departments[dept.id]?.length ?? 0;
              const capacity = dept.tasks.length;
              const load = Math.min(60 + assigned * 1.5, 95);
              return (
                <li key={dept.id} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Cpu className="w-3.5 h-3.5 text-brand-metal" />
                      <ArabicText className="truncate text-xs text-brand-luxury">
                        {dept.name}
                      </ArabicText>
                    </div>
                    <span className="text-[10px] text-brand-metal uppercase tracking-widest">
                      {assigned} staff · {capacity} tasks
                    </span>
                  </div>
                  <div className="h-1 w-full bg-brand-border">
                    <div
                      className="h-full bg-brand-wood"
                      style={{ width: `${load}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </article>
      </section>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 ${swatch}`} />
      <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </div>
  );
}
