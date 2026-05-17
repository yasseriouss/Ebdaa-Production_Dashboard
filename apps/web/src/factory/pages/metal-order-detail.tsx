import { useParams } from "wouter";
import { useState, useEffect } from "react";
import {
  useGetMetalOrder,
  useUpdateMetalStage,
  getGetMetalOrderQueryKey,
  getListMetalOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@factory/components/ui/card";
import { Button } from "@factory/components/ui/button";
import { Input } from "@factory/components/ui/input";
import { Progress } from "@factory/components/ui/progress";
import { Skeleton } from "@factory/components/ui/skeleton";
import { Link } from "wouter";
import { ArrowRight, Factory } from "lucide-react";
import { useToast } from "@factory/hooks/use-toast";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

const STATUS_COLORS: Record<string, string> = {
  "لم يتم البدء": "bg-muted text-muted-foreground",
  "تحت التصنيع": "bg-blue-500/20 text-blue-400",
  "في المخزن": "bg-yellow-500/20 text-yellow-400",
  "تم الانتهاء": "bg-green-500/20 text-green-400",
  "متوقف": "bg-destructive/20 text-destructive",
  "تم التسليم": "bg-primary/20 text-primary",
};

interface Stage {
  id: string | number;
  metalOrderId?: string | number;
  stageName: string;
  stageOrder: number;
  qtyTarget?: number | string | null;
  qtyDone?: number | string | null;
  status?: string | null;
}

function StageRow({ stage, orderId }: { stage: Stage; orderId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [qtyDone, setQtyDone] = useState(() => String(stage.qtyDone ?? "0"));
  const [status, setStatus] = useState(stage.status || "لم يتم البدء");

  useEffect(() => {
    if (editing) return;
    setQtyDone(String(stage.qtyDone ?? "0"));
    setStatus(stage.status || "لم يتم البدء");
  }, [editing, stage.id, stage.qtyDone, stage.status]);

  const resetFromStage = () => {
    setQtyDone(String(stage.qtyDone ?? "0"));
    setStatus(stage.status || "لم يتم البدء");
  };

  const update = useUpdateMetalStage({
    mutation: {
      onSuccess: async () => {
        setEditing(false);
        const key = getGetMetalOrderQueryKey(orderId as unknown as number);
        await qc.invalidateQueries({ queryKey: key });
        await qc.invalidateQueries({ queryKey: getListMetalOrdersQueryKey() });
        toast({ title: "تم تحديث المرحلة" });
      },
      onError: () => {
        toast({ title: "فشل تحديث المرحلة", variant: "destructive" });
      },
    },
  });

  const target = parseFloat(String(stage.qtyTarget ?? 0));
  const done = parseFloat(String(stage.qtyDone ?? 0));
  const pct = target > 0 ? Math.round((done / target) * 100) : 0;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
      data-testid={`stage-row-${stage.id}`}
    >
      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {stage.stageOrder}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{stage.stageName}</div>
        <div className="flex items-center gap-2 mt-1">
          <Progress value={pct} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="text-sm text-muted-foreground shrink-0">
        {stage.qtyDone || 0} / {stage.qtyTarget || 0}
      </div>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={qtyDone}
            onChange={e => setQtyDone(e.target.value)}
            className="w-20 h-7 text-xs"
            min="0"
            max={stage.qtyTarget || "9999"}
            data-testid={`input-stage-qty-${stage.id}`}
          />
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="h-7 text-xs bg-muted border border-border rounded px-1"
            data-testid={`select-stage-status-${stage.id}`}
          >
            {["لم يتم البدء", "تحت التصنيع", "تم الانتهاء"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={() => update.mutate({ id: stage.id as unknown as number, data: { qtyDone: parseFloat(String(qtyDone)), status } })}
            disabled={update.isPending}
            data-testid={`btn-save-stage-${stage.id}`}
          >
            حفظ
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { resetFromStage(); setEditing(false); }}>إلغاء</Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[stage.status || ""] || "bg-muted"}`}>
            {stage.status || "غير محدد"}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => { resetFromStage(); setEditing(true); }}
            data-testid={`btn-edit-stage-${stage.id}`}
          >
            تعديل
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MetalOrderDetail() {
  const { ft } = useFactoryTranslation();
  const params = useParams<{ id: string }>();
  const orderId = (params.id ?? "").trim();
  const idAsHook = orderId as unknown as number;

  const { data: order, isLoading } = useGetMetalOrder(idAsHook, {
    query: { enabled: !!orderId, queryKey: getGetMetalOrderQueryKey(idAsHook) },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Factory className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>{ft("orderDetail.notFound")}</p>
        <Link href="/orders/metal">
          <Button variant="link" className="mt-2">{ft("orderDetail.backToList")}</Button>
        </Link>
      </div>
    );
  }

  const stages = (order as typeof order & { stages?: Stage[] }).stages || [];
  const completionPct = parseFloat(String(order.completionPct ?? 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/orders/metal">
          <Button variant="ghost" size="sm" data-testid="btn-back">
            <ArrowRight className="h-4 w-4 ml-1" />
            {ft("orderDetail.back")}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-primary">{order.moNumber}</h1>
        <span className={`text-xs px-2 py-1 rounded font-medium ${STATUS_COLORS[order.status || ""] || "bg-muted"}`}>
          {order.status}
        </span>
      </div>

      {/* Order summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{ft("orderDetail.project")}</CardTitle></CardHeader>
          <CardContent><div className="font-semibold">{order.project || "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{ft("orderDetail.client")}</CardTitle></CardHeader>
          <CardContent><div className="font-semibold">{order.client || "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{ft("orderDetail.product")}</CardTitle></CardHeader>
          <CardContent><div className="font-semibold">{order.product}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{ft("orderDetail.qtyTotal")}</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{order.qty} <span className="text-sm text-muted-foreground">{order.unit}</span></div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المُسلَّم</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-400">{order.deliveredQty || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">المتأخرات</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${parseFloat(String(order.backlogQty ?? 0)) > 0 ? "text-destructive" : "text-green-400"}`}>
              {order.backlogQty || 0}
            </div>
            {order.backlogStatus && <p className="text-xs text-muted-foreground">{order.backlogStatus}</p>}
          </CardContent>
        </Card>
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">نسبة الإنجاز الإجمالية</span>
            <span className="text-2xl font-bold text-primary">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-3" />
          {order.notes && <p className="text-sm text-muted-foreground mt-3">ملاحظات: {order.notes}</p>}
        </CardContent>
      </Card>

      {/* Production stages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" />
            مراحل الإنتاج (17 مرحلة)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stages.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">لا توجد مراحل</p>
          ) : (
            stages.map(stage => <StageRow key={stage.id} stage={stage} orderId={orderId} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
