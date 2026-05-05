import { useGetCompletionTrend, useGetDashboardClients, useGetDashboardStats, useGetMetalStagesSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";

const PIE_COLORS = ["#22c55e", "#ef4444", "#f59e0b", "#6b7280"];

export default function Analytics() {
  const { data: trendData, isLoading: loadingTrend } = useGetCompletionTrend();
  const { data: clientsData, isLoading: loadingClients } = useGetDashboardClients();
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats();
  const { data: stagesSummary, isLoading: loadingStages } = useGetMetalStagesSummary();

  // On-time vs late ratio from stats (metal: متوقف = late, rest = on-time)
  const metalOnTimeLate = stats ? [
    { name: "في الموعد", value: (stats.metalTotalOrders || 0) - (stats.metalOverdueOrders || 0), fill: "#22c55e" },
    { name: "متأخر", value: stats.metalOverdueOrders || 0, fill: "#ef4444" },
  ] : [];

  // Wooden on-time vs late: Delivered = on-time, Production = in-progress (treat as on-time), assume no overdue for wooden
  const woodenOnTimeLate = stats ? [
    { name: "مسلّم", value: stats.woodenCompletedOrders || 0, fill: "#22c55e" },
    { name: "تحت التصنيع", value: stats.woodenActiveOrders || 0, fill: "#3b82f6" },
  ] : [];

  // Backlog trend: use metalStatusBreakdown as proxy
  const metalStatus = (stats?.metalStatusBreakdown || []) as { status: string; count: number }[];
  const woodenStatus = (stats?.woodenStatusBreakdown || []) as { status: string; count: number }[];

  // Bottleneck: stages sorted by WIP descending
  const stagesForChart = [...(stagesSummary || [])]
    .sort((a, b) => (b.totalWip || 0) - (a.totalWip || 0))
    .slice(0, 10)
    .map(s => ({ name: s.stageName, wip: s.totalWip || 0, done: s.totalDone || 0 }));

  // Top clients
  const topClients = (clientsData || []).slice(0, 10) as { client: string; totalOrders: number; metalOrders: number; woodenOrders: number; completionPct: number }[];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">الإحصائيات والتحليلات</h1>

      {/* KPI summary row */}
      <div className="grid gap-4 md:grid-cols-4">
        {loadingStats ? (
          [...Array(4)].map((_, i) => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>)
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
      <Card>
        <CardHeader><CardTitle>معدل الإنجاز بمرور الوقت</CardTitle></CardHeader>
        <CardContent>
          {loadingTrend ? <Skeleton className="h-64 w-full" /> : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [`${v}%`, name]}
                />
                <Legend />
                <Area type="monotone" dataKey="metalCompletionPct" name="معدني" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMetal)" />
                <Area type="monotone" dataKey="woodenCompletionPct" name="خشبي" stroke="#3b82f6" fillOpacity={1} fill="url(#colorWooden)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* On-time vs late + status distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>نسبة في الموعد مقابل متأخر (معدني)</CardTitle></CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-48 w-full" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={metalOnTimeLate} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`} labelLine={false}>
                      {metalOnTimeLate.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, "عدد الأوامر"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {metalStatus.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{item.status}</span>
                      <span className="font-bold text-sm">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>توزيع حالات الإنتاج الخشبي</CardTitle></CardHeader>
          <CardContent>
            {loadingStats ? <Skeleton className="h-48 w-full" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={180}>
                  <PieChart>
                    <Pie data={woodenOnTimeLate} dataKey="value" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${Math.round((percent || 0) * 100)}%`} labelLine={false}>
                      {woodenOnTimeLate.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v, "عدد الأوامر"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {woodenStatus.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{item.status === "Delivered" ? "مسلّم" : item.status === "Production" ? "تحت التصنيع" : item.status}</span>
                      <span className="font-bold text-sm">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottleneck heatmap (top WIP stages) */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل الاختناقات — أعلى مراحل في قيد التشغيل (WIP)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStages ? <Skeleton className="h-52 w-full" /> : stagesForChart.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stagesForChart} layout="vertical" margin={{ right: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [v, name === "wip" ? "WIP (قيد التشغيل)" : "منجز"]}
                />
                <Legend formatter={(v) => <span className="text-xs">{v === "wip" ? "WIP" : "منجز"}</span>} />
                <Bar dataKey="wip" name="wip" fill="#ef4444" radius={[0, 4, 4, 0]} />
                <Bar dataKey="done" name="done" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top clients performance */}
      <Card>
        <CardHeader><CardTitle>أداء التسليم للعملاء</CardTitle></CardHeader>
        <CardContent>
          {loadingClients ? <Skeleton className="h-52 w-full" /> : topClients.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topClients} margin={{ top: 5, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="client" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [v, name === "metalOrders" ? "معدني" : name === "woodenOrders" ? "خشبي" : name]}
                />
                <Legend formatter={(v) => <span className="text-xs">{v === "metalOrders" ? "معدني" : v === "woodenOrders" ? "خشبي" : v}</span>} />
                <Bar dataKey="metalOrders" name="metalOrders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="woodenOrders" name="woodenOrders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
