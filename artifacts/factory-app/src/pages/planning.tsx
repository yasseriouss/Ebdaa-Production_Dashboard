import { useState, useMemo } from "react";
import { useGetDashboardGantt } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "تحت التصنيع": "bg-blue-500/20 text-blue-400",
    "لم يتم البدء": "bg-muted text-muted-foreground",
    "في المخزن": "bg-yellow-500/20 text-yellow-400",
    "تم الانتهاء": "bg-green-500/20 text-green-400",
    "تم التسليم": "bg-green-500/20 text-green-400",
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

const PERT_NODES = [
  { id: "start", label: "بداية", x: 50, y: 150 },
  { id: "laser", label: "الليزر", x: 180, y: 60 },
  { id: "shear", label: "المقص", x: 180, y: 150 },
  { id: "punch", label: "البانش", x: 180, y: 240 },
  { id: "press", label: "مكابس", x: 320, y: 150 },
  { id: "drill", label: "المثقاب", x: 320, y: 240 },
  { id: "weld_co2", label: "لحام CO2", x: 460, y: 120 },
  { id: "grind", label: "تجليخ", x: 460, y: 210 },
  { id: "weld_brass", label: "لحام نحاس", x: 600, y: 150 },
  { id: "paint", label: "الدهان", x: 720, y: 100 },
  { id: "assemble", label: "التجميع", x: 720, y: 210 },
  { id: "deliver", label: "التسليم", x: 850, y: 150 },
];

const PERT_EDGES = [
  { from: "start", to: "laser" }, { from: "start", to: "shear" }, { from: "start", to: "punch" },
  { from: "laser", to: "weld_co2" }, { from: "shear", to: "press" }, { from: "punch", to: "drill" },
  { from: "press", to: "weld_co2" }, { from: "drill", to: "grind" },
  { from: "weld_co2", to: "grind" }, { from: "grind", to: "weld_brass" },
  { from: "weld_brass", to: "paint" }, { from: "weld_brass", to: "assemble" },
  { from: "paint", to: "deliver" }, { from: "assemble", to: "deliver" },
];

function detectOverlaps(items: { id: string; startDate?: string; endDate?: string; client?: string }[]) {
  const overlaps = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]; const b = items[j];
      if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) continue;
      if (a.client !== b.client || !a.client) continue; // only flag same-client overlaps
      const aStart = new Date(a.startDate).getTime();
      const aEnd = new Date(a.endDate).getTime();
      const bStart = new Date(b.startDate).getTime();
      const bEnd = new Date(b.endDate).getTime();
      if (aStart < bEnd && aEnd > bStart) {
        overlaps.add(a.id);
        overlaps.add(b.id);
      }
    }
  }
  return overlaps;
}

export default function Planning() {
  const [factory, setFactory] = useState("all");
  const [projectFilter, setProjectFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: ganttData, isLoading } = useGetDashboardGantt(
    {
      factory: factory as "metal" | "wooden" | "all",
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    },
    { query: { queryKey: ["gantt", factory, dateFrom, dateTo] } }
  );

  const allItems = ganttData || [];

  const items = useMemo(() => {
    if (!projectFilter.trim()) return allItems;
    const q = projectFilter.trim().toLowerCase();
    return allItems.filter(i =>
      (i.client || "").toLowerCase().includes(q) ||
      (i.moNumber || "").toLowerCase().includes(q) ||
      (i.project || "").toLowerCase().includes(q)
    );
  }, [allItems, projectFilter]);

  const overlappingIds = useMemo(() => detectOverlaps(items), [items]);

  const allDates = items.flatMap(i => [new Date(i.startDate ?? ""), new Date(i.endDate ?? "")]).filter(d => !isNaN(d.getTime()));
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date("2025-01-01");
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date("2025-12-31");
  const totalMs = Math.max(1, maxDate.getTime() - minDate.getTime());
  const CHART_WIDTH = 800;

  const getLeftPct = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    return Math.max(0, ((d.getTime() - minDate.getTime()) / totalMs) * 100);
  };
  const getWidthPct = (start: string, end: string) => {
    const s = new Date(start).getTime(); const e = new Date(end).getTime();
    if (isNaN(s) || isNaN(e)) return 1;
    return Math.max(0.5, ((e - s) / totalMs) * 100);
  };

  const nodeMap = new Map(PERT_NODES.map(n => [n.id, n]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">التخطيط والجدولة</h1>
        <p className="text-muted-foreground mt-1">مخطط Gantt ومخطط PERT مع تحديد تعارضات المواعيد</p>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>مخطط Gantt - أوامر الشغل</CardTitle>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">المصنع</Label>
              <Select value={factory} onValueChange={setFactory} data-testid="select-factory-filter">
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="metal">المعدني</SelectItem>
                  <SelectItem value="wooden">الخشبي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">بحث</Label>
              <Input
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                placeholder="عميل أو أمر..."
                className="w-40 h-8 text-xs"
                data-testid="input-project-filter"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">من تاريخ</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-36 h-8 text-xs"
                data-testid="input-date-from"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">إلى تاريخ</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-36 h-8 text-xs"
                data-testid="input-date-to"
              />
            </div>
          </div>
          {overlappingIds.size > 0 && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive" data-testid="overlap-warning">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              تنبيه: {overlappingIds.size} أمر بها تعارضات في المواعيد مع أوامر لنفس العميل
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">لا توجد بيانات لعرضها</div>
          ) : (
            <div className="overflow-x-auto" data-testid="gantt-chart">
              <div className="flex gap-4 mb-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-primary/50 inline-block" /> معدني</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-blue-500/50 inline-block" /> خشبي</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-destructive/50 inline-block" /> تعارض مواعيد</div>
                <span className="text-muted-foreground">إجمالي: {items.length} أمر</span>
              </div>
              <div className="min-w-[900px]">
                {/* Header: date labels */}
                <div className="flex mb-1 pr-44">
                  <div className="relative flex-1 h-6 border-b border-border">
                    {[0, 25, 50, 75, 100].map(pct => {
                      const d = new Date(minDate.getTime() + (pct / 100) * totalMs);
                      return (
                        <span key={pct} className="absolute text-xs text-muted-foreground transform -translate-x-1/2" style={{ left: `${pct}%` }}>
                          {d.toLocaleDateString("ar-EG", { month: "short", year: "2-digit" })}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {/* Rows */}
                {items.map((item) => {
                  const hasOverlap = overlappingIds.has(item.id);
                  return (
                    <div key={item.id} className="flex items-center gap-2 mb-1 group" data-testid={`gantt-row-${item.id}`}>
                      <div className="w-44 shrink-0 text-xs text-right pr-2 truncate">
                        <div className="font-medium truncate text-foreground/90">{item.moNumber}</div>
                        <div className="text-muted-foreground truncate text-[10px]">{item.client}</div>
                      </div>
                      <div className="flex-1 relative h-7 bg-muted/20 rounded overflow-hidden">
                        <div
                          className={`absolute h-full rounded transition-all ${hasOverlap ? "bg-destructive/60 ring-1 ring-destructive" : item.factory === "metal" ? "bg-primary/60" : "bg-blue-500/50"}`}
                          style={{
                            left: `${getLeftPct(item.startDate ?? "")}%`,
                            width: `${getWidthPct(item.startDate ?? "", item.endDate ?? "")}%`,
                          }}
                          title={`${item.moNumber} — ${item.completionPct}% مكتمل${hasOverlap ? " ⚠ تعارض" : ""}`}
                        >
                          <div className="absolute h-full rounded bg-green-500/60" style={{ width: `${item.completionPct}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 px-1">
                            {item.completionPct}%
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                      {hasOverlap && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PERT Chart */}
      <Card>
        <CardHeader>
          <CardTitle>مخطط PERT - تسلسل مراحل المصنع المعدني (المسار الحرج)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto" data-testid="pert-chart">
            <svg width="950" height="320" viewBox="0 0 950 320" className="w-full">
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--muted-foreground))" />
                </marker>
                <marker id="arrowhead-critical" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#ef4444" />
                </marker>
              </defs>
              {/* Critical path edges highlighted */}
              {PERT_EDGES.map((e, i) => {
                const from = nodeMap.get(e.from);
                const to = nodeMap.get(e.to);
                if (!from || !to) return null;
                const isCritical = ["weld_co2", "grind", "weld_brass", "paint", "deliver"].includes(e.to);
                return (
                  <line key={i}
                    x1={from.x + 80} y1={from.y + 16}
                    x2={to.x} y2={to.y + 16}
                    stroke={isCritical ? "#ef4444" : "hsl(var(--border))"}
                    strokeWidth={isCritical ? "2" : "1.5"}
                    markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                  />
                );
              })}
              {PERT_NODES.map(n => {
                const isCritical = ["weld_co2", "grind", "weld_brass", "paint", "assemble", "deliver"].includes(n.id);
                const isEndpoint = n.id === "start" || n.id === "deliver";
                return (
                  <g key={n.id} transform={`translate(${n.x},${n.y})`}>
                    <rect width="80" height="32" rx="6"
                      fill={isEndpoint ? "hsl(var(--primary))" : isCritical ? "rgba(239,68,68,0.2)" : "hsl(var(--card))"}
                      stroke={isCritical ? "#ef4444" : "hsl(var(--border))"}
                      strokeWidth={isCritical ? "2" : "1.5"} />
                    <text x="40" y="20" textAnchor="middle"
                      style={{ fontSize: 10, fontFamily: "Tajawal, sans-serif", fill: "hsl(var(--foreground))" }}>
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block" /> المسار الحرج</div>
              <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-muted-foreground inline-block" /> مسار ثانوي</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
