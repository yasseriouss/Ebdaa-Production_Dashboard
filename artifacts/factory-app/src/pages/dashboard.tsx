import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDashboardStats, useGetDashboardClients } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Factory, Boxes, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const METAL_STATUS_COLORS: Record<string, string> = {
  "تم الانتهاء": "#22c55e",
  "تم التسليم": "#16a34a",
  "تحت التصنيع": "#3b82f6",
  "في المخزن": "#8b5cf6",
  "لم يتم البدء": "#6b7280",
  "متوقف": "#ef4444",
};

const WOODEN_STATUS_COLORS: Record<string, string> = {
  "تم التسليم": "#22c55e",
  "تحت التصنيع": "#3b82f6",
  "Delivered": "#22c55e",
  "Production": "#3b82f6",
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();
  const { data: clients, isLoading: loadingClients } = useGetDashboardClients();

  const metalStatusData = (stats?.metalStatusBreakdown || []).map(
    (item: { status: string; count: number }) => ({ name: item.status, value: item.count, fill: METAL_STATUS_COLORS[item.status] || "#6b7280" })
  );
  const woodenStatusData = (stats?.woodenStatusBreakdown || []).map(
    (item: { status: string; count: number }) => ({ name: (item.status === "Delivered" || item.status === "تم التسليم") ? "تم التسليم" : (item.status === "Production" || item.status === "تحت التصنيع") ? "تحت التصنيع" : item.status, value: item.count, fill: WOODEN_STATUS_COLORS[item.status] || "#6b7280" })
  );
  const topClients = (clients || []).slice(0, 8).map((c: { client: string; totalOrders: number; completionPct: number }) => ({
    client: c.client.length > 14 ? c.client.slice(0, 14) + "…" : c.client,
    totalOrders: c.totalOrders,
    completionPct: c.completionPct,
  }));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent><Skeleton className="h-8 w-[60px]" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">لوحة التحكم</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">أوامر المصنع المعدني</CardTitle>
            <Factory className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.metalTotalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              إنجاز {stats?.metalAvgCompletionPct || 0}% · نشط {stats?.metalActiveOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">أوامر المصنع الخشبي</CardTitle>
            <Boxes className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.woodenTotalOrders || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              إنجاز {stats?.woodenAvgCompletionPct || 0}% · نشط {stats?.woodenActiveOrders || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">متأخرات معدني</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.metalBacklogTotal || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">متوقف: {stats?.metalOverdueOrders || 0} أمر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">مشاريع مشتركة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.sharedProjectsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">عميل في المصنعين</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع حالات المصنع المعدني</CardTitle>
          </CardHeader>
          <CardContent>
            {metalStatusData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={metalStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {metalStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill || PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "عدد الأوامر"]} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">توزيع حالات المصنع الخشبي</CardTitle>
          </CardHeader>
          <CardContent>
            {woodenStatusData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={woodenStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {woodenStatusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill || PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "عدد الأوامر"]} />
                  <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">أكبر العملاء (إجمالي الأوامر)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingClients ? (
            <Skeleton className="h-52 w-full" />
          ) : topClients.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">لا توجد بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topClients} layout="vertical" margin={{ right: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="client" tick={{ fontSize: 11 }} width={90} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [v, name === "totalOrders" ? "إجمالي الأوامر" : "نسبة الإنجاز %"]}
                />
                <Bar dataKey="totalOrders" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="totalOrders" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Throughput / Completion summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{stats?.metalCompletedOrders || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">أوامر معدنية منجزة</div>
              <div className="text-xs text-muted-foreground mt-0.5">من {stats?.metalTotalOrders || 0} إجمالي</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">{stats?.woodenCompletedOrders || 0}</div>
              <div className="text-sm text-muted-foreground mt-1">أوامر خشبية مسلّمة</div>
              <div className="text-xs text-muted-foreground mt-0.5">من {stats?.woodenTotalOrders || 0} إجمالي</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400">
                {Math.round(((stats?.metalCompletedOrders || 0) + (stats?.woodenCompletedOrders || 0)) /
                  Math.max(1, (stats?.metalTotalOrders || 0) + (stats?.woodenTotalOrders || 0)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">معدل الإنجاز الكلي</div>
              <div className="text-xs text-muted-foreground mt-0.5">معدني + خشبي</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
