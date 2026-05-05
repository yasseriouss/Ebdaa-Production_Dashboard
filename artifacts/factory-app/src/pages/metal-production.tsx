import { useGetMetalStagesSummary, useListMetalOrders, useListMetalStages } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STAGE_NAMES = [
  "الليزر","المقص","الكويل","البانش","مكابس و تكويع","المثقاب","التخليع","التنايات",
  "لحام CO2","تجليخ","لحام بنطة","لحام نحاس","لحام أرجون استالنس","تشطيب استالنس","الدهان","التجميع","التسليم",
];

function getHeatColor(wip: number, max: number): string {
  if (max === 0) return "bg-muted/30";
  const ratio = wip / max;
  if (ratio === 0) return "bg-muted/20 text-muted-foreground";
  if (ratio < 0.3) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (ratio < 0.6) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  if (ratio < 0.85) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-red-500/20 text-red-400 border border-red-500/30";
}

export default function MetalProduction() {
  const { data: summary, isLoading: loadingSummary } = useGetMetalStagesSummary();
  const { data: orders, isLoading: loadingOrders } = useListMetalOrders();

  const maxWip = Math.max(...(summary || []).map(s => s.totalWip || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإنتاج اليومي المعدني</h1>
        <p className="text-muted-foreground mt-1">مراقبة الإنتاج عبر 17 مرحلة تصنيع</p>
      </div>

      {/* Stage bottleneck heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>خريطة الاختناقات عبر مراحل الإنتاج</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSummary ? (
            <div className="grid grid-cols-4 gap-2">
              {[...Array(17)].map((_, i) => <Skeleton key={i} className="h-20 rounded" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {(summary || []).map((stage) => (
                <div
                  key={stage.stageName}
                  data-testid={`stage-card-${stage.stageOrder}`}
                  className={`rounded-lg p-3 text-center ${getHeatColor(stage.totalWip || 0, maxWip)}`}
                >
                  <div className="text-xs font-bold mb-1 leading-tight">{stage.stageName}</div>
                  <div className="text-2xl font-bold">{stage.totalWip || 0}</div>
                  <div className="text-xs opacity-75">WIP</div>
                  <div className="text-xs mt-1 opacity-60">منجز: {stage.totalDone || 0}</div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex gap-4 mt-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/20 inline-block" /> لا يوجد WIP</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30 inline-block" /> منخفض</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30 inline-block" /> متوسط</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30 inline-block" /> مرتفع</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30 inline-block" /> اختناق</div>
          </div>
        </CardContent>
      </Card>

      {/* Orders × Stages grid */}
      <Card>
        <CardHeader>
          <CardTitle>حالة كل أمر عبر المراحل</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loadingOrders ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <table className="w-full text-xs border-collapse" dir="rtl" data-testid="production-grid">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-2 text-right font-semibold border border-border sticky right-0 bg-card z-10 min-w-[100px]">أمر الشغل</th>
                  {STAGE_NAMES.map((s, i) => (
                    <th key={i} className="p-1 text-center border border-border font-medium min-w-[60px] whitespace-nowrap">
                      <div className="writing-mode-vertical">{s}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((order) => (
                  <OrderRow key={order.id} orderId={order.id} moNumber={order.moNumber} />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderRow({ orderId, moNumber }: { orderId: number; moNumber: string }) {
  const { data: stages } = useListMetalStages(
    { moNumber },
    { query: { queryKey: ["metal-stages", moNumber] } }
  );

  const getStatusBg = (status: string | null | undefined) => {
    switch (status) {
      case "تم الانتهاء": return "bg-green-500/30 text-green-300";
      case "تحت التصنيع": return "bg-blue-500/30 text-blue-300";
      case "لم يتم البدء": return "bg-muted/30 text-muted-foreground";
      default: return "bg-muted/20";
    }
  };

  return (
    <tr className="hover:bg-muted/20 transition-colors" data-testid={`order-row-${orderId}`}>
      <td className="p-2 font-medium border border-border sticky right-0 bg-card z-10 text-primary">{moNumber}</td>
      {STAGE_NAMES.map((stageName, i) => {
        const stage = (stages || []).find(s => s.stageName === stageName);
        return (
          <td key={i} className={`p-1 text-center border border-border ${getStatusBg(stage?.status)}`}>
            {stage ? (
              <div className="text-xs">{stage.qtyDone || 0}</div>
            ) : (
              <div className="text-xs text-muted-foreground">—</div>
            )}
          </td>
        );
      })}
    </tr>
  );
}
