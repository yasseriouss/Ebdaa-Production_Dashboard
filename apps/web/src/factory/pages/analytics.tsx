import { useMemo, useSyncExternalStore } from "react";
import { useGetCompletionTrend, useGetDashboardClients, useGetDashboardStats, useGetMetalStagesSummary } from "@workspace/api-client-react";
import { PieBulletLegend } from "@factory/components/PieBulletLegend";
import { LoadPressureCard } from "@factory/components/LoadPressureCard";
import { Card, CardContent, CardHeader, CardTitle } from "@factory/components/ui/card";
import { Skeleton } from "@factory/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DashboardOperationalAnalytics } from "../../components/DashboardOperationalAnalytics";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

const PIE_TOOLTIP_STYLE = {
  background: "oklch(99% 0.008 70)",
  border: "none",
  borderRadius: "12px",
  fontSize: "12px",
} as const;

function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => (typeof window !== "undefined" ? window.matchMedia(query).matches : false),
    () => false,
  );
}

export default function Analytics() {
  const { ft } = useFactoryTranslation();
  const { data: trendData, isLoading: loadingTrend } = useGetCompletionTrend();
  const { data: clientsData, isLoading: loadingClients } = useGetDashboardClients();
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: stagesSummary, isLoading: loadingStages } = useGetMetalStagesSummary();
  const isLg = useMediaQuery("(min-width: 1024px)");
  const isSm = useMediaQuery("(min-width: 640px)");

  const statusPieOuterR = isLg ? 88 : isSm ? 80 : 72;
  const statusPieInnerR = isLg ? 54 : isSm ? 48 : 42;

  // On-time vs late ratio from stats (metal: متوقف = late, rest = on-time)
  const metalOnTimeLate = stats
    ? [
        {
          name: "في الموعد",
          value: (stats.metalTotalOrders || 0) - (stats.metalOverdueOrders || 0),
          fill: "oklch(65% 0.15 140)",
        },
        { name: "متأخر", value: stats.metalOverdueOrders || 0, fill: "oklch(60% 0.15 30)" },
      ]
    : [];

  // Wooden on-time vs late: Delivered = on-time, Production = in-progress (treat as on-time), assume no overdue for wooden
  const woodenOnTimeLate = stats
    ? [
        { name: "مسلّم", value: stats.woodenCompletedOrders || 0, fill: "oklch(65% 0.15 140)" },
        { name: "تحت التصنيع", value: stats.woodenActiveOrders || 0, fill: "oklch(65% 0.15 250)" },
      ]
    : [];

  // Backlog trend: use metalStatusBreakdown as proxy
  const metalStatus = (stats?.metalStatusBreakdown || []) as { status: string; count: number }[];
  const woodenStatus = (stats?.woodenStatusBreakdown || []) as { status: string; count: number }[];

  // Bottleneck: stages sorted by WIP descending (مصنع معدني)
  const stagesForChart = [...(stagesSummary || [])]
    .sort((a, b) => (b.totalWip || 0) - (a.totalWip || 0))
    .slice(0, 10)
    .map((s) => ({ name: s.stageName, wip: s.totalWip || 0, done: s.totalDone || 0 }));

  // Top clients
  const topClients = useMemo(() => {
    const list = (clientsData || []).slice(0, 10) as {
      client: string;
      totalOrders: number;
      metalOrders: number;
      woodenOrders: number;
      completionPct: number;
    }[];
    return list.map((c) => {
      const full = String(c.client ?? "").trim();
      return {
        clientFull: full || "—",
        totalOrders: c.totalOrders ?? 0,
        metalOrders: c.metalOrders ?? 0,
        woodenOrders: c.woodenOrders ?? 0,
        completionPct: c.completionPct,
      };
    });
  }, [clientsData]);

  const topClientsMaxOrders = useMemo(
    () => Math.max(1, ...topClients.map((c) => c.totalOrders)),
    [topClients],
  );

  return (
    <div
      className="space-y-6 max-w-(--breakpoint-2xl) mx-auto w-full min-w-0"
      dir="rtl"
      lang="ar"
    >
      <h1 className="text-3xl font-bold tracking-tight text-start">{ft("analytics.title")}</h1>

      <DashboardOperationalAnalytics />

      {/* KPI summary row */}
      <div className="grid gap-4 md:grid-cols-4">
        {loadingStats ? (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary">{stats?.metalAvgCompletionPct || 0}%</div>
                <div className="text-xs text-muted-foreground mt-1">متوسط إنجاز المعدني</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-blue-400">{stats?.woodenAvgCompletionPct || 0}%</div>
                <div className="text-xs text-muted-foreground mt-1">متوسط إنجاز الخشبي</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-destructive">{stats?.metalOverdueOrders || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">أوامر متوقفة (معدني)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats?.metalBacklogTotal || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">إجمالي المتأخرات المعدنية</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Completion trend over time */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>معدل الإنجاز بمرور الوقت</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {loadingTrend ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-[260px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData || []} margin={{ top: 10, right: 16, left: 16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMetal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWooden" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="period" reversed tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis orientation="right" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      direction: "rtl",
                      textAlign: "right",
                    }}
                    formatter={(v, name) => [`${Number(v ?? 0)}%`, String(name)]}
                  />
                  <Legend wrapperStyle={{ direction: "rtl" }} layout="horizontal" align="center" />
                  <Area
                    type="monotone"
                    dataKey="metalCompletionPct"
                    name="معدني"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorMetal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="woodenCompletionPct"
                    name="خشبي"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorWooden)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* On-time vs late + status distribution */}
      <div className="grid gap-6 md:grid-cols-2 min-w-0">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>نسبة في الموعد مقابل متأخر (معدني)</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {loadingStats ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <div className="h-[220px] sm:h-[250px] relative w-full min-w-0 sm:w-[55%] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metalOnTimeLate}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={statusPieOuterR}
                        innerRadius={statusPieInnerR}
                        paddingAngle={4}
                        stroke="none"
                        label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                        labelLine={false}
                      >
                        {metalOnTimeLate.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [Number(v ?? 0), "عدد الأوامر"]} contentStyle={{ ...PIE_TOOLTIP_STYLE, direction: "rtl", textAlign: "right" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-bold tabular-nums">{stats?.metalTotalOrders ?? 0}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      إجمالي
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  {metalStatus.map((item, i) => (
                    <div key={i} className="flex justify-between items-center gap-2 text-xs min-w-0">
                      <span className="text-muted-foreground break-words min-w-0">{item.status}</span>
                      <span className="font-bold text-sm tabular-nums shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loadingStats && metalOnTimeLate.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <PieBulletLegend items={metalOnTimeLate.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>توزيع حالات الإنتاج الخشبي</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0">
            {loadingStats ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 min-w-0">
                <div className="h-[220px] sm:h-[250px] relative w-full min-w-0 sm:w-[55%] shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={woodenOnTimeLate}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={statusPieOuterR}
                        innerRadius={statusPieInnerR}
                        paddingAngle={4}
                        stroke="none"
                        label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`}
                        labelLine={false}
                      >
                        {woodenOnTimeLate.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [Number(v ?? 0), "عدد الأوامر"]} contentStyle={{ ...PIE_TOOLTIP_STYLE, direction: "rtl", textAlign: "right" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-bold tabular-nums">{stats?.woodenTotalOrders ?? 0}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-widest">
                      إجمالي
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3 min-w-0">
                  {woodenStatus.map((item, i) => (
                    <div key={i} className="flex justify-between items-center gap-2 text-xs min-w-0">
                      <span className="text-muted-foreground break-words min-w-0">
                        {item.status === "Delivered" || item.status === "تم التسليم"
                          ? "تم التسليم"
                          : item.status === "Production" || item.status === "تحت التصنيع"
                            ? "تحت التصنيع"
                            : item.status}
                      </span>
                      <span className="font-bold text-sm tabular-nums shrink-0">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loadingStats && woodenOnTimeLate.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <PieBulletLegend items={woodenOnTimeLate.map(({ name, fill, value }) => ({ name, fill, value }))} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottleneck — نفس قائمة ضغط العمل من لوحة التحكم */}
      <LoadPressureCard
        title="تحليل الاختناقات — أعلى مراحل في قيد التشغيل (WIP)"
        subtitle="مراحل أوامر الشغل المعدنية مرتبة حسب ضغط قيد التشغيل (الأعلى أولاً). الطول الكامل لكل اسم مرحلة دون قصّ."
        rows={stagesForChart}
        isLoading={loadingStages}
        barColor="oklch(58% 0.14 28)"
      />

      {/* Top clients performance — قائمة شريطية قابلة للتمرير */}
      <div className="double-bezel-outer min-w-0">
        <div className="double-bezel-inner p-4 sm:p-6 lg:p-8 min-w-0">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 sm:mb-6">
            أداء التسليم للعملاء
          </h3>
          {loadingClients ? (
            <Skeleton className="h-52 w-full" />
          ) : topClients.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">لا توجد بيانات</p>
          ) : (
            <div className="w-full min-w-0 max-h-[min(52vh,440px)] overflow-y-auto overflow-x-hidden pe-1 -me-1">
              <ul className="space-y-5 sm:space-y-6 pb-1">
                {topClients.map((row, idx) => {
                  const widthPct = (row.totalOrders / topClientsMaxOrders) * 100;
                  return (
                    <li key={`${row.clientFull}-${idx}`} className="min-w-0 list-none space-y-2.5 sm:space-y-3">
                      <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-4">
                        <p className="text-sm font-medium text-foreground leading-relaxed break-words min-w-0 order-1">
                          {row.clientFull}
                        </p>
                        <div className="shrink-0 text-xs text-muted-foreground tabular-nums order-2 sm:text-end space-y-0.5 sm:space-y-0">
                          <div>
                            <span className="font-semibold text-foreground">{row.totalOrders}</span>
                            {" أمر"}
                            {typeof row.completionPct === "number" && (
                              <span className="ms-2 opacity-90">إنجاز {Math.round(row.completionPct)}%</span>
                            )}
                          </div>
                          <div className="text-[11px] opacity-85">
                            معدني <span className="font-medium text-foreground">{row.metalOrders}</span>
                            <span className="mx-1.5 opacity-60">·</span>
                            خشبي <span className="font-medium text-foreground">{row.woodenOrders}</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className="h-3 sm:h-3.5 w-full rounded-full bg-muted/45 ring-1 ring-border/35 overflow-hidden"
                        dir="rtl"
                        aria-hidden
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-500 ease-out"
                          style={{
                            width: `${widthPct}%`,
                            background: "oklch(64% 0.13 28)",
                            minWidth: row.totalOrders > 0 ? "6px" : undefined,
                          }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
