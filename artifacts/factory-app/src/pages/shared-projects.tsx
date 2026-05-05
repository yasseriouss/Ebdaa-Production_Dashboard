import { useListSharedProjects } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Factory, Boxes, AlertTriangle, Link2 } from "lucide-react";
import { Link } from "wouter";

interface SharedProject {
  client: string;
  metalOrderCount: number;
  woodenOrderCount: number;
  metalCompletionPct: number;
  woodenCompletionPct: number;
  combinedCompletionPct: number;
  metalOrders?: {
    id: number;
    moNumber: string;
    product: string;
    qty: string;
    status?: string | null;
    completionPct?: string | null;
    backlogQty?: string | null;
  }[];
  woodenOrders?: {
    id: number;
    orderNo: string;
    product: string;
    qty: string;
    done?: string | null;
    rem?: string | null;
    status?: string | null;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  "تم الانتهاء": "bg-green-500/20 text-green-400",
  "تم التسليم": "bg-green-500/20 text-green-400",
  "تحت التصنيع": "bg-blue-500/20 text-blue-400",
  "لم يتم البدء": "bg-muted text-muted-foreground",
  "متوقف": "bg-destructive/20 text-destructive",
  "Delivered": "bg-green-500/20 text-green-400",
  "Production": "bg-blue-500/20 text-blue-400",
};

function ImpactAlert({ metalPct, woodenPct }: { metalPct: number; woodenPct: number }) {
  const gap = Math.abs(metalPct - woodenPct);
  if (gap <= 20) return null;
  const lagging = metalPct < woodenPct ? "المصنع المعدني" : "المصنع الخشبي";
  return (
    <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive mt-3" data-testid="impact-alert">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>تأثير: {lagging} متأخر بفارق {gap}% — قد يتأثر موعد التسليم النهائي للعميل</span>
    </div>
  );
}

function OrderTimeline({ pct, label, color }: { pct: number; label: string; color: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SharedProjects() {
  const { data: projects, isLoading } = useListSharedProjects();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">المشاريع المشتركة</h1>
        {[1, 2, 3].map(i => <Card key={i}><CardContent className="pt-6 h-48 animate-pulse bg-muted/20" /></Card>)}
      </div>
    );
  }

  const typedProjects = (projects || []) as SharedProject[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">المشاريع المشتركة</h1>
        <p className="text-muted-foreground mt-1">عملاء يمتلكون أوامر في المصنع المعدني والخشبي معاً</p>
      </div>

      {typedProjects.length === 0 && (
        <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg" data-testid="no-shared-projects">
          لا توجد مشاريع مشتركة حالياً
        </div>
      )}

      {typedProjects.map((project, idx) => (
        <Card key={idx} data-testid={`shared-project-${idx}`}>
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl text-primary">{project.client}</CardTitle>
              </div>
              <Badge
                variant="outline"
                className={project.combinedCompletionPct >= 80 ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}
              >
                إنجاز مشترك: {project.combinedCompletionPct}%
              </Badge>
            </div>

            {/* Combined Timeline */}
            <div className="grid gap-2 mt-3">
              <OrderTimeline pct={project.metalCompletionPct} label={`معدني (${project.metalOrderCount} أمر)`} color="bg-primary/70" />
              <OrderTimeline pct={project.woodenCompletionPct} label={`خشبي (${project.woodenOrderCount} أمر)`} color="bg-blue-500/70" />
            </div>

            <ImpactAlert metalPct={project.metalCompletionPct} woodenPct={project.woodenCompletionPct} />
          </CardHeader>

          <CardContent className="pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Metal Orders */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <Factory className="h-4 w-4 text-primary" />
                  <span>أوامر المصنع المعدني</span>
                </div>
                <div className="space-y-2">
                  {(project.metalOrders || []).slice(0, 5).map(mo => {
                    const pct = parseFloat(mo.completionPct || "0");
                    const backlog = parseFloat(mo.backlogQty || "0");
                    return (
                      <div key={mo.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors" data-testid={`metal-order-row-${mo.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/metal/orders/${mo.id}`} className="text-xs font-mono font-bold text-primary hover:underline truncate">
                              {mo.moNumber}
                            </Link>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[mo.status || ""] || "bg-muted text-muted-foreground"}`}>
                              {mo.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">{mo.product}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground shrink-0">{pct}%</span>
                          </div>
                        </div>
                        {backlog > 0 && (
                          <div className="text-[10px] text-destructive shrink-0 font-semibold">
                            -{backlog}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(project.metalOrders || []).length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      + {(project.metalOrders || []).length - 5} أوامر أخرى
                    </div>
                  )}
                  {(project.metalOrders || []).length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">لا توجد بيانات</div>
                  )}
                </div>
              </div>

              {/* Wooden Orders */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                  <Boxes className="h-4 w-4 text-blue-400" />
                  <span>أوامر المصنع الخشبي</span>
                </div>
                <div className="space-y-2">
                  {(project.woodenOrders || []).slice(0, 5).map(wo => {
                    const qty = parseFloat(String(wo.qty || "0"));
                    const done = parseFloat(String(wo.done || "0"));
                    const rem = parseFloat(String(wo.rem || "0"));
                    const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
                    return (
                      <div key={wo.id} className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors" data-testid={`wooden-order-row-${wo.id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/wooden/orders/${wo.id}`} className="text-xs font-mono font-bold text-blue-400 hover:underline truncate">
                              {wo.orderNo}
                            </Link>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[wo.status || ""] || "bg-muted text-muted-foreground"}`}>
                              {wo.status === "Delivered" ? "مسلّم" : wo.status === "Production" ? "تحت التصنيع" : wo.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">{wo.product}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="h-1 flex-1" />
                            <span className="text-[10px] text-muted-foreground shrink-0">{pct}%</span>
                          </div>
                        </div>
                        {rem > 0 && (
                          <div className="text-[10px] text-yellow-400 shrink-0 font-semibold">
                            -{rem}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {(project.woodenOrders || []).length > 5 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      + {(project.woodenOrders || []).length - 5} أوامر أخرى
                    </div>
                  )}
                  {(project.woodenOrders || []).length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">لا توجد بيانات</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
