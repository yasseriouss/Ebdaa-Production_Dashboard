import { useListWoodenOrders, useListWoodenStages } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

const WOODEN_STAGE_NAMES = ["القطع", "التجميع", "التشطيب", "التغليف"];

function getHeatColor(wip: number, max: number): string {
  if (max === 0) return "bg-muted/30";
  const ratio = wip / max;
  if (ratio === 0) return "bg-muted/20 text-muted-foreground";
  if (ratio < 0.3) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (ratio < 0.6) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  if (ratio < 0.85) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-red-500/20 text-red-400 border border-red-500/30";
}

export default function WoodenProduction() {
  const { data: orders, isLoading } = useListWoodenOrders();

  const statusBuckets = (orders || []).reduce<Record<string, number>>(
    (acc, o) => {
      const s = o.status || "غير محدد";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    },
    {}
  );

  const totalOrders = (orders || []).length;
  const totalDone = (orders || []).reduce((s, o) => s + parseFloat(String(o.done ?? 0)), 0);
  const totalQty = (orders || []).reduce((s, o) => s + parseFloat(String(o.qty ?? 0)), 0);
  const overallPct = totalQty > 0 ? Math.round((totalDone / totalQty) * 100) : 0;

  const maxRem = Math.max(...(orders || []).map(o => parseFloat(String(o.rem ?? 0))), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإنتاج اليومي الخشبي</h1>
        <p className="text-muted-foreground mt-1">متابعة إنتاج المصنع الخشبي عبر مراحل التصنيع</p>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalOrders}</div>
            <div className="text-sm text-muted-foreground mt-1">إجمالي الأوامر</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-400">{statusBuckets["Delivered"] || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">مسلّمة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">{statusBuckets["Production"] || 0}</div>
            <div className="text-sm text-muted-foreground mt-1">تحت التصنيع</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-muted-foreground">الإنجاز الكلي</span>
              <span className="text-2xl font-bold text-primary">{overallPct}%</span>
            </div>
            <Progress value={overallPct} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Stage Summary Cards */}
      <Card>
        <CardHeader>
          <CardTitle>مراحل الإنتاج الخشبي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {WOODEN_STAGE_NAMES.map((name, idx) => (
              <div
                key={name}
                className="rounded-lg p-4 border border-border bg-card/60 text-center"
                data-testid={`wooden-stage-summary-${idx + 1}`}
              >
                <div className="text-xs font-bold text-muted-foreground mb-2">{name}</div>
                <div className="text-3xl font-bold text-blue-400">{idx + 1}</div>
                <div className="text-xs text-muted-foreground mt-1">المرحلة</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orders Table with progress per order */}
      <Card>
        <CardHeader>
          <CardTitle>حالة أوامر الإنتاج الخشبية</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse" dir="rtl" data-testid="wooden-production-grid">
                <thead>
                  <tr className="bg-muted/40 text-xs">
                    <th className="p-2 text-right border border-border">رقم الأمر</th>
                    <th className="p-2 text-right border border-border">المنتج</th>
                    <th className="p-2 text-right border border-border">العميل</th>
                    <th className="p-2 text-center border border-border">الكمية</th>
                    <th className="p-2 text-center border border-border">المنجز</th>
                    <th className="p-2 text-center border border-border">المتبقي</th>
                    <th className="p-2 text-center border border-border min-w-[120px]">التقدم</th>
                    <th className="p-2 text-center border border-border">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).map(order => {
                    const qty = parseFloat(String(order.qty ?? 0));
                    const done = parseFloat(String(order.done ?? 0));
                    const rem = parseFloat(String(order.rem ?? 0));
                    const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
                    const heatClass = getHeatColor(rem, maxRem);
                    const isDelivered = order.status === "Delivered";
                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/20 transition-colors"
                        data-testid={`wooden-order-row-${order.id}`}
                      >
                        <td className="p-2 border border-border font-mono text-xs text-primary">{order.orderNo}</td>
                        <td className="p-2 border border-border">{order.product}</td>
                        <td className="p-2 border border-border text-muted-foreground">{order.client || "—"}</td>
                        <td className="p-2 border border-border text-center font-bold">{qty}</td>
                        <td className="p-2 border border-border text-center text-green-400 font-semibold">{done}</td>
                        <td className={`p-2 border border-border text-center font-semibold ${heatClass}`}>{rem}</td>
                        <td className="p-2 border border-border">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground w-8 shrink-0">{pct}%</span>
                          </div>
                        </td>
                        <td className="p-2 border border-border text-center">
                          <Badge
                            variant="outline"
                            className={isDelivered
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                            }
                          >
                            {isDelivered ? "تم التسليم" : "تحت التصنيع"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
