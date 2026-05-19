import { useState, useEffect } from "react";
import { useListWoodenOrders, useListWoodenStages, useUpdateWoodenStage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@factory/components/ui/card";
import { Progress } from "@factory/components/ui/progress";
import { Skeleton } from "@factory/components/ui/skeleton";
import { Input } from "@factory/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@factory/components/ui/select";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

const WOODEN_STAGE_NAMES = ["القطع", "التجميع", "التشطيب", "التغليف"];

const STATUSES = ["لم يتم البدء", "تحت التصنيع", "تم الانتهاء"];

function getHeatColor(wip: number, max: number): string {
  if (max === 0) return "bg-muted/30";
  const ratio = wip / max;
  if (ratio === 0) return "bg-muted/20 text-muted-foreground";
  if (ratio < 0.3) return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (ratio < 0.6) return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
  if (ratio < 0.85) return "bg-orange-500/20 text-orange-400 border border-orange-500/30";
  return "bg-red-500/20 text-red-400 border border-red-500/30";
}

function getStatusBg(status: string | null | undefined): string {
  switch (status) {
    case "تم الانتهاء": return "bg-green-500/20 text-green-300";
    case "تحت التصنيع": return "bg-blue-500/20 text-blue-300";
    default: return "bg-muted/20 text-muted-foreground";
  }
}

interface StageCellProps {
  stageId: number | undefined;
  qtyDone: string | number | undefined;
  status: string | null | undefined;
  onSave: (id: number, qty: number, status: string) => void;
}

function StageCell({ stageId, qtyDone, status, onSave }: StageCellProps) {
  const [editQty, setEditQty] = useState(String(qtyDone ?? "0"));
  const [editStatus, setEditStatus] = useState(status || "لم يتم البدء");

  useEffect(() => {
    setEditQty(String(qtyDone ?? "0"));
    setEditStatus(status || "لم يتم البدء");
  }, [stageId, qtyDone, status]);

  if (!stageId) {
    return <td className="p-1 border border-border text-center text-muted-foreground text-xs">—</td>;
  }

  return (
    <td className={`p-1 border border-border ${getStatusBg(editStatus)}`} style={{ minWidth: 100 }}>
      <div className="flex flex-col gap-1">
        <Input
          value={editQty}
          onChange={e => setEditQty(e.target.value)}
          onBlur={() => onSave(stageId, parseFloat(editQty) || 0, editStatus)}
          className="h-6 text-xs px-1 bg-transparent border-0 border-b border-border/50 rounded-none focus-visible:ring-0"
          data-testid={`wooden-stage-qty-${stageId}`}
          type="number"
          min={0}
        />
        <Select
          value={editStatus}
          onValueChange={v => {
            setEditStatus(v);
            onSave(stageId, parseFloat(editQty) || 0, v);
          }}
        >
          <SelectTrigger className="h-6 text-[10px] px-1 bg-transparent border-0 rounded-none focus:ring-0 [&>svg]:hidden" data-testid={`wooden-stage-status-${stageId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </td>
  );
}

interface WoodenOrderRowProps {
  orderId: number;
  orderNo: string;
  product: string;
  client: string;
  qty: number;
  done: number;
  rem: number;
  maxRem: number;
}

function WoodenOrderRow({ orderId, orderNo, product, client, qty, done, rem, maxRem }: WoodenOrderRowProps) {
  const queryClient = useQueryClient();
  const { data: stages } = useListWoodenStages(
    { orderId },
    { query: { queryKey: ["wooden-stages", orderId] } }
  );
  const { mutate: updateStage } = useUpdateWoodenStage();

  const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
  const heatClass = getHeatColor(rem, maxRem);

  const handleSave = (id: number, qtyDone: number, status: string) => {
    updateStage(
      { id, data: { qtyDone, status } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wooden-stages", orderId] }) }
    );
  };

  return (
    <tr className="hover:bg-muted/10 transition-colors" data-testid={`wooden-order-row-${orderId}`}>
      <td className="p-2 border border-border font-mono text-xs text-primary sticky right-0 bg-card z-10 whitespace-nowrap">
        {orderNo}
      </td>
      <td className="p-2 border border-border text-xs max-w-[150px] truncate">{product}</td>
      <td className="p-2 border border-border text-xs text-muted-foreground">{client || "—"}</td>
      <td className="p-2 border border-border text-center text-xs font-bold">{qty}</td>
      <td className="p-2 border border-border text-center text-xs text-green-400 font-semibold">{done}</td>
      <td className={`p-2 border border-border text-center text-xs font-semibold ${heatClass}`}>{rem}</td>
      <td className="p-2 border border-border" style={{ minWidth: 100 }}>
        <div className="flex items-center gap-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-[10px] w-8 shrink-0">{pct}%</span>
        </div>
      </td>
      {WOODEN_STAGE_NAMES.map(stageName => {
        const stage = (stages || []).find(s => s.stageName === stageName);
        return (
          <StageCell
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

export default function WoodenProduction() {
  const { data: orders, isLoading } = useListWoodenOrders();
  const { data: allStages } = useListWoodenStages(undefined, { query: { queryKey: ["wooden-stages-all"] } });

  // Per-stage summary from real stage data
  const stageSummary = WOODEN_STAGE_NAMES.map(name => {
    const stagesForName = (allStages || []).filter(s => s.stageName === name);
    const wip = stagesForName.filter(s => s.status === "تحت التصنيع").length;
    const done = stagesForName.filter(s => s.status === "تم الانتهاء").length;
    const notStarted = stagesForName.filter(s => !s.status || s.status === "لم يتم البدء").length;
    return { name, wip, done, notStarted, total: stagesForName.length };
  });

  const totalOrders = (orders || []).length;
  const totalDone = (orders || []).reduce((s, o) => s + parseFloat(String(o.done ?? 0)), 0);
  const totalQty = (orders || []).reduce((s, o) => s + parseFloat(String(o.qty ?? 0)), 0);
  const overallPct = totalQty > 0 ? Math.round((totalDone / totalQty) * 100) : 0;
  const deliveredCount = (orders || []).filter(o => o.status === "تم التسليم" || o.status === "Delivered").length;
  const productionCount = (orders || []).filter(o => o.status !== "تم التسليم" && o.status !== "Delivered").length;

  const maxRem = Math.max(...(orders || []).map(o => parseFloat(String(o.rem ?? 0))), 1);
  const maxWip = Math.max(...stageSummary.map(s => s.wip), 1);

  const { ft } = useFactoryTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{ft("production.woodTitle")}</h1>
        <p className="text-muted-foreground mt-1">{ft("production.woodSubtitle")}</p>
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
            <div className="text-2xl font-bold text-green-400">{deliveredCount}</div>
            <div className="text-sm text-muted-foreground mt-1">مسلّمة</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-400">{productionCount}</div>
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

      {/* Stage Summary Cards - real data from wooden stages */}
      <Card>
        <CardHeader>
          <CardTitle>خريطة الاختناقات — مراحل الإنتاج الخشبي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stageSummary.map((stage) => (
              <div
                key={stage.name}
                className={`rounded-lg p-4 text-center border ${getHeatColor(stage.wip, maxWip)}`}
                data-testid={`wooden-stage-summary-${stage.name}`}
              >
                <div className="text-xs font-bold mb-2 leading-tight">{stage.name}</div>
                <div className="text-3xl font-bold">{stage.wip}</div>
                <div className="text-xs opacity-75">WIP</div>
                <div className="flex justify-between mt-2 text-[10px] opacity-70">
                  <span>منجز: {stage.done}</span>
                  <span>لم يبدأ: {stage.notStarted}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted/20 inline-block" /> لا يوجد WIP</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30 inline-block" /> منخفض</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30 inline-block" /> متوسط</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/30 inline-block" /> مرتفع</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 border border-red-500/30 inline-block" /> اختناق</div>
          </div>
        </CardContent>
      </Card>

      {/* Stage × Orders grid — fully editable */}
      <Card>
        <CardHeader>
          <CardTitle>شبكة الأوامر × المراحل — تعديل مباشر</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <table className="w-full text-xs border-collapse" dir="rtl" data-testid="wooden-production-grid">
              <thead>
                <tr className="bg-muted/40">
                  <th className="p-2 text-right font-semibold border border-border sticky right-0 bg-card z-10 min-w-[90px]">أمر الشغل</th>
                  <th className="p-2 text-right font-semibold border border-border min-w-[120px]">المنتج</th>
                  <th className="p-2 text-right font-semibold border border-border min-w-[80px]">العميل</th>
                  <th className="p-2 text-center font-semibold border border-border">الكمية</th>
                  <th className="p-2 text-center font-semibold border border-border">المنجز</th>
                  <th className="p-2 text-center font-semibold border border-border">المتبقي</th>
                  <th className="p-2 text-center font-semibold border border-border min-w-[100px]">التقدم</th>
                  {WOODEN_STAGE_NAMES.map(name => (
                    <th key={name} className="p-2 text-center font-semibold border border-border min-w-[100px] text-blue-400">
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(orders || []).map(order => (
                  <WoodenOrderRow
                    key={order.id}
                    orderId={order.id}
                    orderNo={order.orderNo}
                    product={order.product}
                    client={order.client || ""}
                    qty={parseFloat(String(order.qty ?? 0))}
                    done={parseFloat(String(order.done ?? 0))}
                    rem={parseFloat(String(order.rem ?? 0))}
                    maxRem={maxRem}
                  />
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
