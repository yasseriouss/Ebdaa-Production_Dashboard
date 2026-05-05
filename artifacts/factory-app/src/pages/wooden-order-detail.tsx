import { useParams } from "wouter";
import { useState } from "react";
import {
  useGetWoodenOrder,
  useUpdateWoodenStage,
  getGetWoodenOrderQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Boxes } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WoodenStage {
  id: number;
  stageName: string;
  stageOrder: number;
  qtyDone?: number | string | null;
  status?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  "لم يتم البدء": "bg-muted text-muted-foreground",
  "تحت التصنيع": "bg-blue-500/20 text-blue-400",
  "تم الانتهاء": "bg-green-500/20 text-green-400",
};

function WoodenStageRow({ stage, totalQty, orderId }: { stage: WoodenStage; totalQty: number; orderId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [qtyDone, setQtyDone] = useState(stage.qtyDone || "0");
  const [status, setStatus] = useState(stage.status || "لم يتم البدء");

  const update = useUpdateWoodenStage({
    mutation: {
      onSuccess: () => {
        setEditing(false);
        qc.invalidateQueries({ queryKey: getGetWoodenOrderQueryKey(orderId) });
        toast({ title: "تم تحديث المرحلة" });
      },
    },
  });

  const done = parseFloat(String(stage.qtyDone ?? 0));
  const pct = totalQty > 0 ? Math.round((done / totalQty) * 100) : 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors" data-testid={`wooden-stage-row-${stage.id}`}>
      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-400 shrink-0">
        {stage.stageOrder}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{stage.stageName}</div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground shrink-0">{stage.qtyDone || 0} / {totalQty}</div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input type="number" value={qtyDone} onChange={e => setQtyDone(e.target.value)} className="w-20 h-7 text-xs" min="0" data-testid={`input-wooden-stage-qty-${stage.id}`} />
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-7 text-xs bg-muted border border-border rounded px-1" data-testid={`select-wooden-stage-status-${stage.id}`}>
            {["لم يتم البدء", "تحت التصنيع", "تم الانتهاء"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button size="sm" className="h-7 text-xs" onClick={() => update.mutate({ id: stage.id, data: { qtyDone: parseFloat(String(qtyDone)), status } })} disabled={update.isPending} data-testid={`btn-save-wooden-stage-${stage.id}`}>حفظ</Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditing(false)}>إلغاء</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[stage.status || ""] || "bg-muted"}`}>{stage.status || "غير محدد"}</span>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(true)} data-testid={`btn-edit-wooden-stage-${stage.id}`}>تعديل</Button>
        </div>
      )}
    </div>
  );
}

export default function WoodenOrderDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");

  const { data: order, isLoading } = useGetWoodenOrder(id, {
    query: { enabled: !!id, queryKey: getGetWoodenOrderQueryKey(id) },
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Boxes className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>لم يتم العثور على الأمر</p>
        <Link href="/wooden/orders"><Button variant="link" className="mt-2">العودة للقائمة</Button></Link>
      </div>
    );
  }

  const stages = (order as typeof order & { stages?: WoodenStage[] }).stages || [];
  const total = parseFloat(String(order.qty ?? 0));
  const done = parseFloat(String(order.done ?? 0));
  const rem = parseFloat(String(order.rem ?? 0));
  const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
  const statusColor = order.status === "Delivered" ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/wooden/orders">
          <Button variant="ghost" size="sm" data-testid="btn-back-wooden"><ArrowRight className="h-4 w-4 ml-1" />الرجوع</Button>
        </Link>
        <h1 className="text-2xl font-bold text-blue-400">{order.orderNo}</h1>
        {order.extension && <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">{order.extension}</span>}
        <span className={`text-xs px-2 py-1 rounded font-medium ${statusColor}`}>{order.status}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">العميل</CardTitle></CardHeader><CardContent><div className="font-semibold">{order.client || "—"}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المشروع الفرعي</CardTitle></CardHeader><CardContent><div className="font-semibold">{order.subProject || "—"}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المنتج</CardTitle></CardHeader><CardContent><div className="font-semibold">{order.product}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">الكمية الإجمالية</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{order.qty} <span className="text-sm text-muted-foreground">{order.uom}</span></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المنجز</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-400">{order.done || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المتبقي</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${rem > 0 ? "text-yellow-400" : "text-green-400"}`}>{rem}</div></CardContent></Card>
      </div>

      {(order.prodDateStart || order.prodDateEnd) && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-6 text-sm flex-wrap">
              {order.prodDateStart && <div><span className="text-muted-foreground">بداية الإنتاج: </span><span className="font-medium">{order.prodDateStart}</span></div>}
              {order.prodDateEnd && <div><span className="text-muted-foreground">نهاية الإنتاج: </span><span className="font-medium">{order.prodDateEnd}</span></div>}
              {order.prodDateFinished && <div><span className="text-muted-foreground">تاريخ الانتهاء: </span><span className="font-medium text-green-400">{order.prodDateFinished}</span></div>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">نسبة الإنجاز</span>
            <span className="text-2xl font-bold text-blue-400">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-blue-400" />
            مراحل الإنتاج الخشبي (4 مراحل)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">لا توجد مراحل</p>
          ) : (
            stages.map(stage => <WoodenStageRow key={stage.id} stage={stage} totalQty={total} orderId={id} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
