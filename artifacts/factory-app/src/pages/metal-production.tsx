import { useState } from "react";
import { useGetMetalStagesSummary, useListMetalOrders, useListMetalStages, useUpdateMetalStage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STAGE_NAMES = [
  "الليزر","المقص","الكويل","البانش","مكابس و تكويع","المثقاب","التخليع","التنايات",
  "لحام CO2","تجليخ","لحام بنطة","لحام نحاس","لحام أرجون استالنس","تشطيب استالنس","الدهان","التجميع","التسليم",
];

const STATUSES = ["لم يتم البدء", "تحت التصنيع", "تم الانتهاء", "متوقف"];

function getHeatColor(wip: number, max: number): string {
  if (max === 0) return "bg-muted/30";
  const ratio = wip / max;
  if (ratio === 0) return "bg-muted/20 text-muted-foreground";
  if (ratio < 0.3) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (ratio < 0.6) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  if (ratio < 0.85) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-red-500/20 text-red-400 border border-red-500/30";
}

function getStageBg(status: string | null | undefined): string {
  switch (status) {
    case "تم الانتهاء": return "bg-green-500/20 text-green-300";
    case "تحت التصنيع": return "bg-blue-500/20 text-blue-300";
    case "متوقف": return "bg-destructive/20 text-destructive";
    default: return "bg-muted/20 text-muted-foreground";
  }
}

interface InlineStageCellProps {
  stageId: number | undefined;
  qtyDone: string | number | null | undefined;
  status: string | null | undefined;
  onSave: (id: number, qty: number, status: string) => void;
}

function InlineStageCell({ stageId, qtyDone, status, onSave }: InlineStageCellProps) {
  const [editQty, setEditQty] = useState(String(qtyDone ?? "0"));
  const [editStatus, setEditStatus] = useState(status || "لم يتم البدء");

  if (!stageId) {
    return (
      <td className="p-1 text-center border border-border text-muted-foreground text-xs">—</td>
    );
  }

  return (
    <td className={`p-1 border border-border ${getStageBg(editStatus)}`} style={{ minWidth: 80 }}>
      <div className="flex flex-col gap-0.5">
        <Input
          value={editQty}
          onChange={e => setEditQty(e.target.value)}
          onBlur={() => onSave(stageId, parseFloat(editQty) || 0, editStatus)}
          className="h-5 text-[10px] px-1 bg-transparent border-0 border-b border-border/50 rounded-none focus-visible:ring-0 text-center"
          type="number"
          min={0}
          data-testid={`metal-stage-qty-${stageId}`}
        />
        <Select
          value={editStatus}
          onValueChange={v => {
            setEditStatus(v);
            onSave(stageId, parseFloat(editQty) || 0, v);
          }}
        >
          <SelectTrigger
            className="h-5 text-[9px] px-0.5 bg-transparent border-0 rounded-none focus:ring-0 [&>svg]:hidden"
            data-testid={`metal-stage-status-${stageId}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </td>
  );
}

function OrderRow({ orderId, moNumber }: { orderId: number; moNumber: string }) {
  const queryClient = useQueryClient();
  const { data: stages } = useListMetalStages(
    { moNumber },
    { query: { queryKey: ["metal-stages", moNumber] } }
  );
  const { mutate: updateStage } = useUpdateMetalStage();

  const handleSave = (id: number, qtyDone: number, status: string) => {
    updateStage(
      { id, data: { qtyDone, status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["metal-stages", moNumber] }) }
    );
  };

  return (
    <tr className="hover:bg-muted/10 transition-colors" data-testid={`order-row-${orderId}`}>
      <td className="p-2 font-medium border border-border sticky right-0 bg-card z-10 text-primary text-xs whitespace-nowrap">
        {moNumber}
      </td>
      {STAGE_NAMES.map(stageName => {
        const stage = (stages || []).find(s => s.stageName === stageName);
        return (
          <InlineStageCell
            key={stageName}
            stageId={stage?.id}
            qtyDone={stage?.qtyDone}
            status={stage?.status}
            onSave={handleSave}
          />
        );
      })}
    </tr>
  );
}

export default function MetalProduction() {
  const { data: summary, isLoading: loadingSummary } = useGetMetalStagesSummary();
  const { data: orders, isLoading: loadingOrders } = useListMetalOrders();

  const maxWip = Math.max(...(summary || []).map(s => s.totalWip || 0), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الإنتاج اليومي المعدني</h1>
        <p className="text-muted-foreground mt-1">مراقبة وتحديث الإنتاج عبر 17 مرحلة — تعديل مباشر في الخلايا</p>
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
              {(summary || []).map(stage => (
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
          <div className="flex gap-4 mt-4 text-xs flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/20 inline-block" /> لا يوجد WIP</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30 inline-block" /> منخفض</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30 inline-block" /> متوسط</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30 inline-block" /> مرتفع</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30 inline-block" /> اختناق</div>
          </div>
        </CardContent>
      </Card>

      {/* Orders × Stages editable grid */}
      <Card>
        <CardHeader>
          <CardTitle>شبكة الأوامر × المراحل — تعديل مباشر في الخلايا</CardTitle>
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
                    <th key={i} className="p-1 text-center border border-border font-medium min-w-[80px]">
                      <div className="text-[10px] leading-tight">{s}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders || []).map(order => (
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
