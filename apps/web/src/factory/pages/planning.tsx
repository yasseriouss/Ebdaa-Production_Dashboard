import { useState, useMemo } from "react";
import { useGetDashboardGantt } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@factory/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@factory/components/ui/select";
import { Input } from "@factory/components/ui/input";
import { Label } from "@factory/components/ui/label";
import { Skeleton } from "@factory/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import { useDirection } from "../../lib/useDirection";
import { cn } from "@factory/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "تحت التصنيع": "bg-blue-500/20 text-blue-400",
    "لم يتم البدء": "bg-muted text-muted-foreground",
    "في المخزن": "bg-yellow-500/20 text-yellow-400",
    "تم الانتهاء": "bg-green-500/20 text-green-400",
    "تم التسليم": "bg-green-500/20 text-green-400",
    "به مشكله": "bg-rose-500/20 text-rose-400",
    "تحت التعديل": "bg-violet-500/20 text-violet-300",
    "فى انتظار خامات": "bg-amber-500/20 text-amber-400",
    Delivered: "bg-green-500/20 text-green-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${colors[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

const PERT_NODES = [
  { id: "start", labelKey: "planning.pertStart", x: 50, y: 150 },
  { id: "laser", labelKey: "planning.pertLaser", x: 180, y: 60 },
  { id: "shear", labelKey: "planning.pertShear", x: 180, y: 150 },
  { id: "punch", labelKey: "planning.pertPunch", x: 180, y: 240 },
  { id: "press", labelKey: "planning.pertPress", x: 320, y: 150 },
  { id: "drill", labelKey: "planning.pertDrill", x: 320, y: 240 },
  { id: "weld_co2", labelKey: "planning.pertWeldCO2", x: 460, y: 120 },
  { id: "grind", labelKey: "planning.pertGrind", x: 460, y: 210 },
  { id: "weld_brass", labelKey: "planning.pertWeldBrass", x: 600, y: 150 },
  { id: "paint", labelKey: "planning.pertPaint", x: 720, y: 100 },
  { id: "assemble", labelKey: "planning.pertAssemble", x: 720, y: 210 },
  { id: "deliver", labelKey: "planning.pertDeliver", x: 850, y: 150 },
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
  const { ft, locale } = useFactoryTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
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

  const items = useMemo(() => {
    const allItems = ganttData || [];
    if (!projectFilter.trim()) return allItems;
    const q = projectFilter.trim().toLowerCase();
    return allItems.filter(i =>
      (i.client || "").toLowerCase().includes(q) ||
      (i.moNumber || "").toLowerCase().includes(q) ||
      (i.project || "").toLowerCase().includes(q)
    );
  }, [ganttData, projectFilter]);

  const overlappingIds = useMemo(() => detectOverlaps(items), [items]);

  const allDates = items.flatMap(i => [new Date(i.startDate ?? ""), new Date(i.endDate ?? "")]).filter(d => !isNaN(d.getTime()));
  const minDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date("2025-01-01");
  const maxDate = allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))) : new Date("2025-12-31");
  const totalMs = Math.max(1, maxDate.getTime() - minDate.getTime());

  const getLeftPct = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 0;
    const pct = ((d.getTime() - minDate.getTime()) / totalMs) * 100;
    return Math.max(0, pct);
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
        <h1 className="text-3xl font-bold tracking-tight">{ft("planning.title")}</h1>
        <p className="text-muted-foreground mt-1">{ft("planning.subtitle")}</p>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{ft("planning.ganttTitle")}</CardTitle>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 pt-3">
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{ft("planning.filterFactory")}</Label>
              <Select value={factory} onValueChange={setFactory} data-testid="select-factory-filter">
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ft("orders.all")}</SelectItem>
                  <SelectItem value="metal">{ft("planning.legendMetal")}</SelectItem>
                  <SelectItem value="wooden">{ft("planning.legendWood")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{ft("planning.filterSearch")}</Label>
              <Input
                value={projectFilter}
                onChange={e => setProjectFilter(e.target.value)}
                placeholder={ft("planning.filterSearchPlaceholder")}
                className="w-40 h-8 text-xs"
                data-testid="input-project-filter"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{ft("planning.filterDateFrom")}</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-36 h-8 text-xs"
                data-testid="input-date-from"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs shrink-0">{ft("planning.filterDateTo")}</Label>
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
              {ft("planning.overlapWarning", { n: String(overlappingIds.size) })}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">{ft("planning.noData")}</div>
          ) : (
            <div className="overflow-x-auto" data-testid="gantt-chart">
              <div className="flex gap-4 mb-4 text-xs flex-wrap">
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-primary/50 inline-block" /> {ft("planning.legendMetal")}</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-blue-500/50 inline-block" /> {ft("planning.legendWood")}</div>
                <div className="flex items-center gap-1.5"><span className="w-4 h-3 rounded bg-destructive/50 inline-block" /> {ft("planning.legendOverlap")}</div>
                <span className="text-muted-foreground">{ft("planning.totalOrders", { n: String(items.length) })}</span>
              </div>
              <div className="min-w-[900px]">
                {/* Header: date labels */}
                <div className={cn("flex mb-1", rtl ? "pl-44" : "pr-44")}>
                  <div className="relative flex-1 h-6 border-b border-border">
                    {[0, 25, 50, 75, 100].map(pct => {
                      const d = new Date(minDate.getTime() + (pct / 100) * totalMs);
                      return (
                        <span key={pct} className="absolute text-xs text-muted-foreground transform -translate-x-1/2" style={{ [rtl ? "right" : "left"]: `${pct}%` }}>
                          {d.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", { month: "short", year: "2-digit" })}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {/* Rows */}
                {items.map((item) => {
                  const hasOverlap = overlappingIds.has(item.id);
                  const left = getLeftPct(item.startDate ?? "");
                  const width = getWidthPct(item.startDate ?? "", item.endDate ?? "");
                  return (
                    <div key={item.id} className="flex items-center gap-2 mb-1 group" data-testid={`gantt-row-${item.id}`}>
                      <div className="w-44 shrink-0 text-xs text-start px-2 truncate">
                        <div className="font-medium truncate text-foreground/90">{item.moNumber}</div>
                        <div className="text-muted-foreground truncate text-[10px]">{item.client}</div>
                      </div>
                      <div className="flex-1 relative h-7 bg-muted/20 rounded overflow-hidden">
                        <div
                          className={`absolute h-full rounded transition-all ${hasOverlap ? "bg-destructive/60 ring-1 ring-destructive" : item.factory === "metal" ? "bg-primary/60" : "bg-blue-500/50"}`}
                          style={{
                            [rtl ? "right" : "left"]: `${left}%`,
                            width: `${width}%`,
                          }}
                          title={`${item.moNumber} — ${item.completionPct}% ${ft("planning.completedHint")}${hasOverlap ? ` ⚠ ${ft("planning.overlapHint")}` : ""}`}
                        >
                          <div className={cn("absolute h-full rounded bg-green-500/60", rtl ? "right-0" : "left-0")} style={{ width: `${item.completionPct}%` }} />
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
        <CardContent>
          {/* PERT Chart */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold">{ft("planning.pertTitle")}</h3>
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
                      x1={rtl ? 950 - (from.x + 80) : from.x + 80} y1={from.y + 16}
                      x2={rtl ? 950 - to.x : to.x} y2={to.y + 16}
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
                    <g key={n.id} transform={`translate(${rtl ? 950 - n.x - 80 : n.x},${n.y})`}>
                      <rect width="80" height="32" rx="6"
                        fill={isEndpoint ? "hsl(var(--primary))" : isCritical ? "rgba(239,68,68,0.2)" : "hsl(var(--card))"}
                        stroke={isCritical ? "#ef4444" : "hsl(var(--border))"}
                        strokeWidth={isCritical ? "2" : "1.5"} />
                      <text x="40" y="20" textAnchor="middle"
                        style={{ fontSize: 10, fontFamily: "Tajawal, sans-serif", fill: "hsl(var(--foreground))" }}>
                        {ft(n.labelKey)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-red-500 inline-block" /> {ft("planning.criticalPath")}</div>
                <div className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-muted-foreground inline-block" /> {ft("planning.secondaryPath")}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
