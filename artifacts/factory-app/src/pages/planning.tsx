import { useState } from "react";
import { useGetDashboardGantt } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "تحت التصنيع": "bg-blue-500/20 text-blue-400",
    "لم يتم البدء": "bg-muted text-muted-foreground",
    "في المخزن": "bg-yellow-500/20 text-yellow-400",
    "تم الانتهاء": "bg-green-500/20 text-green-400",
    "تم التسليم": "bg-primary/20 text-primary",
    "متوقف": "bg-destructive/20 text-destructive",
    Production: "bg-blue-500/20 text-blue-400",
    Delivered: "bg-green-500/20 text-green-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

const METAL_STAGES_DEPS = [
  { from: "الليزر", to: "التجميع", label: "انتظار قطع" },
  { from: "المقص", to: "مكابس و تكويع", label: "تكويع الصفائح" },
  { from: "البانش", to: "التخليع", label: "ثقوب" },
  { from: "التنايات", to: "لحام CO2", label: "تنعيم قبل اللحام" },
  { from: "لحام CO2", to: "تجليخ", label: "تنعيم اللحام" },
  { from: "تجليخ", to: "الدهان", label: "تجهيز السطح" },
  { from: "الدهان", to: "التجميع", label: "تجفيف" },
  { from: "التجميع", to: "التسليم", label: "فحص نهائي" },
];

const PERT_NODES = [
  { id: "start", label: "بداية", x: 50, y: 150, color: "bg-primary" },
  { id: "laser", label: "الليزر", x: 180, y: 60, color: "bg-blue-500/30" },
  { id: "shear", label: "المقص", x: 180, y: 150, color: "bg-blue-500/30" },
  { id: "punch", label: "البانش", x: 180, y: 240, color: "bg-blue-500/30" },
  { id: "press", label: "مكابس", x: 320, y: 150, color: "bg-blue-500/30" },
  { id: "drill", label: "المثقاب", x: 320, y: 240, color: "bg-blue-500/30" },
  { id: "weld_co2", label: "لحام CO2", x: 460, y: 120, color: "bg-yellow-500/30" },
  { id: "grind", label: "تجليخ", x: 460, y: 210, color: "bg-yellow-500/30" },
  { id: "weld_brass", label: "لحام نحاس", x: 600, y: 150, color: "bg-orange-500/30" },
  { id: "paint", label: "الدهان", x: 720, y: 100, color: "bg-orange-500/30" },
  { id: "assemble", label: "التجميع", x: 720, y: 210, color: "bg-green-500/30" },
  { id: "deliver", label: "التسليم", x: 850, y: 150, color: "bg-primary" },
];

const PERT_EDGES = [
  { from: "start", to: "laser" }, { from: "start", to: "shear" }, { from: "start", to: "punch" },
  { from: "laser", to: "weld_co2" }, { from: "shear", to: "press" }, { from: "punch", to: "drill" },
  { from: "press", to: "weld_co2" }, { from: "drill", to: "grind" },
  { from: "weld_co2", to: "grind" }, { from: "grind", to: "weld_brass" },
  { from: "weld_brass", to: "paint" }, { from: "weld_brass", to: "assemble" },
  { from: "paint", to: "deliver" }, { from: "assemble", to: "deliver" },
];

export default function Planning() {
  const [factory, setFactory] = useState("all");
  const { data: ganttData, isLoading } = useGetDashboardGantt(
    { factory: factory as "metal" | "wooden" | "all" },
    { query: { queryKey: ["gantt", factory] } }
  );

  const items = ganttData || [];
  const allDates = items.flatMap(i => [new Date(i.startDate), new Date(i.endDate)]).filter(d => !isNaN(d.getTime()));
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date("2025-01-01");
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date("2025-12-31");
  const totalDays = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const CHART_WIDTH = 800;

  const getX = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    return Math.round(((d.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * CHART_WIDTH);
  };

  const getWidth = (start: string, end: string) => {
    const w = getX(end) - getX(start);
    return Math.max(4, w);
  };

  const nodeMap = new Map(PERT_NODES.map(n => [n.id, n]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">التخطيط والجدولة</h1>
        <p className="text-muted-foreground mt-1">مخطط Gantt ومخطط PERT لمراحل التصنيع</p>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>مخطط Gantt - أوامر الشغل</CardTitle>
          <Select value={factory} onValueChange={setFactory} data-testid="select-factory-filter">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="metal">المصنع المعدني</SelectItem>
              <SelectItem value="wooden">المصنع الخشبي</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">لا توجد بيانات لعرضها</div>
          ) : (
            <div className="overflow-x-auto" data-testid="gantt-chart">
              <div className="flex gap-4 mb-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-primary/50 inline-block" /> معدني</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-blue-500/50 inline-block" /> خشبي</div>
              </div>
              <div className="min-w-[900px]">
                {/* Header: months */}
                <div className="flex mb-1 pr-40">
                  <div className="relative flex-1 h-6 border-b border-border">
                    {[0, 25, 50, 75, 100].map(pct => {
                      const d = new Date(minDate.getTime() + (pct / 100) * (maxDate.getTime() - minDate.getTime()));
                      return (
                        <span key={pct} className="absolute text-xs text-muted-foreground transform -translate-x-1/2" style={{ left: `${pct}%` }}>
                          {d.toLocaleDateString("ar-EG", { month: "short", year: "2-digit" })}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {/* Rows */}
                {items.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2 mb-1 group" data-testid={`gantt-row-${item.id}`}>
                    <div className="w-40 shrink-0 text-xs text-right pr-2 truncate text-foreground/80">
                      <div className="font-medium truncate">{item.moNumber}</div>
                      <div className="text-muted-foreground truncate text-[10px]">{item.client}</div>
                    </div>
                    <div className="flex-1 relative h-7 bg-muted/20 rounded">
                      <div
                        className={`absolute h-full rounded transition-all ${item.factory === "metal" ? "bg-primary/60" : "bg-blue-500/50"}`}
                        style={{
                          left: `${(getX(item.startDate) / CHART_WIDTH) * 100}%`,
                          width: `${(getWidth(item.startDate, item.endDate) / CHART_WIDTH) * 100}%`,
                        }}
                        title={`${item.moNumber} — ${item.completionPct}% مكتمل`}
                      >
                        <div
                          className="absolute h-full rounded bg-green-500/60 transition-all"
                          style={{ width: `${item.completionPct}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 px-1">
                          {item.completionPct}%
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PERT Chart */}
      <Card>
        <CardHeader>
          <CardTitle>مخطط PERT - تسلسل مراحل المصنع المعدني</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" data-testid="pert-chart">
            <svg width="950" height="320" viewBox="0 0 950 320" className="w-full">
              {/* Edges */}
              {PERT_EDGES.map((e, i) => {
                const from = nodeMap.get(e.from);
                const to = nodeMap.get(e.to);
                if (!from || !to) return null;
                const fx = from.x + 40; const fy = from.y + 16;
                const tx = to.x; const ty = to.y + 16;
                return (
                  <line key={i} x1={fx} y1={fy} x2={tx} y2={ty}
                    stroke="hsl(var(--border))" strokeWidth="1.5"
                    markerEnd="url(#arrowhead)" />
                );
              })}
              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" />
                </marker>
              </defs>
              {/* Nodes */}
              {PERT_NODES.map(n => (
                <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                  <rect width="80" height="32" rx="6"
                    fill={n.id === "start" || n.id === "deliver" ? "hsl(var(--primary))" : "hsl(var(--card))"}
                    stroke="hsl(var(--border))" strokeWidth="1.5" />
                  <text x="40" y="20" textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 11, fontFamily: "Tajawal, sans-serif", fill: "hsl(var(--foreground))" }}>
                    {n.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
