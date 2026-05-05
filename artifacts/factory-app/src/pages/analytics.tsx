import { useGetCompletionTrend, useGetDashboardClients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function Analytics() {
  const { data: trendData, isLoading: loadingTrend } = useGetCompletionTrend();
  const { data: clientsData, isLoading: loadingClients } = useGetDashboardClients();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">الإحصائيات والتحليلات</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>معدل الإنجاز بمرور الوقت</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loadingTrend ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">جاري التحميل...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMetal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorWooden" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="metalCompletionPct" name="معدني" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMetal)" />
                    <Area type="monotone" dataKey="woodenCompletionPct" name="خشبي" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorWooden)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أداء التسليم للعملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {loadingClients ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">جاري التحميل...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientsData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="client" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                      cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    />
                    <Legend />
                    <Bar dataKey="metalOrders" name="معدني" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="woodenOrders" name="خشبي" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
