import { useListSharedProjects, useListWoodenOrders, useListMetalOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@factory/components/ui/card";
import { Progress } from "@factory/components/ui/progress";
import { Badge } from "@factory/components/ui/badge";
import { Factory, Boxes, AlertTriangle, Link2, Cpu, ClipboardCheck } from "lucide-react";
import { Link } from "wouter";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

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
};

function ImpactAlert({
  metalPct,
  woodenPct,
  ft,
}: {
  metalPct: number;
  woodenPct: number;
  ft: (key: string, params?: Record<string, string | number | undefined>) => string;
}) {
  const gap = Math.abs(metalPct - woodenPct);
  if (gap <= 20) return null;
  const lagging = metalPct < woodenPct ? ft("sharedProjects.metalPlant") : ft("sharedProjects.woodPlant");
  return (
    <div className="flex items-start gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive mt-3" data-testid="impact-alert">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      <span>{ft("sharedProjects.impactAlert", { plant: lagging, gap: String(gap) })}</span>
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
  const { ft, locale } = useFactoryTranslation();
  const { data: projects, isLoading: loadingProjects } = useListSharedProjects();
  const { data: woodOrdersRaw, isLoading: loadingWood } = useListWoodenOrders();
  const { data: metalOrdersRaw, isLoading: loadingMetal } = useListMetalOrders();

  const isLoading = loadingProjects || loadingWood || loadingMetal;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{ft("sharedProjects.title")}</h1>
        {[1, 2, 3].map(i => <Card key={i}><CardContent className="pt-6 h-48 animate-pulse bg-muted/20" /></Card>)}
      </div>
    );
  }

  const typedProjects = (projects || []) as SharedProject[];

  // Calculate advanced joint executive metrics
  const woodCount = woodOrdersRaw?.length || 0;
  const woodTotalQty = woodOrdersRaw?.reduce((sum, o: any) => sum + (parseFloat(String(o.qty || 0)) || 0), 0) || 0;
  const woodDoneQty = woodOrdersRaw?.reduce((sum, o: any) => sum + (parseFloat(String(o.done || 0)) || 0), 0) || 0;
  const woodPct = woodTotalQty > 0 ? Math.round((woodDoneQty / woodTotalQty) * 100) : 0;

  const metalCount = metalOrdersRaw?.length || 0;
  const metalTotalQty = metalOrdersRaw?.reduce((sum, o: any) => sum + (parseFloat(String(o.qty || 0)) || 0), 0) || 0;
  const metalDoneQty = metalOrdersRaw?.reduce((sum, o: any) => {
    const qty = parseFloat(String(o.qty || 0)) || 0;
    const pct = parseFloat(String(o.completionPct || 0)) / 100;
    return sum + (qty * pct);
  }, 0) || 0;
  const metalPct = metalTotalQty > 0 ? Math.round((metalDoneQty / metalTotalQty) * 100) : 0;

  const totalJointProjects = typedProjects.length;
  const combinedPct = Math.round((woodPct + metalPct) / 2);

  // Bottlenecks & Critical alerts detection
  const gapCritical = Math.abs(woodPct - metalPct) > 15;
  const laggingPlant = woodPct < metalPct ? (locale === "ar" ? "مصنع الخشب" : "Wood Factory") : (locale === "ar" ? "مصنع المعادن" : "Metal Factory");

  return (
    <div className="space-y-8">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{ft("sharedProjects.title")}</h1>
        <p className="text-muted-foreground mt-1 max-w-3xl leading-relaxed">{ft("sharedProjects.subtitle")}</p>
      </div>

      {/* Majestic Executive Command Deck */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Wood Factory Command Card */}
        <Card className="border border-sand/30 bg-white hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Boxes className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-100">
                {locale === "ar" ? "نشط" : "Active"}
              </Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{woodCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                {locale === "ar" ? "أوامر مصنع الخشب" : "Wood Factory Orders"}
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{locale === "ar" ? "الإنجاز الكلي للمصنع" : "Overall Plant Progress"}</span>
                <span className="text-blue-600">{woodPct}%</span>
              </div>
              <Progress value={woodPct} className="h-1.5 bg-blue-100/50" />
            </div>
          </CardContent>
        </Card>

        {/* Metal Factory Command Card */}
        <Card className="border border-sand/30 bg-white hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Factory className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="bg-amber-50/50 text-amber-600 border-amber-100">
                {locale === "ar" ? "نشط" : "Active"}
              </Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{metalCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                {locale === "ar" ? "أوامر مصنع المعادن" : "Metal Factory Orders"}
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{locale === "ar" ? "الإنجاز الكلي للمصنع" : "Overall Plant Progress"}</span>
                <span className="text-amber-600">{metalPct}%</span>
              </div>
              <Progress value={metalPct} className="h-1.5 bg-amber-100/50" />
            </div>
          </CardContent>
        </Card>

        {/* Joint Command Deck Combined Stats */}
        <Card className="border border-sand/50 bg-foreground/[0.02] hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl" />
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                <Cpu className="h-6 w-6" />
              </div>
              <Badge className="bg-accent text-white font-bold">
                {locale === "ar" ? "تنسيق كامل" : "Fully Synced"}
              </Badge>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalJointProjects}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5">
                {locale === "ar" ? "مشاريع العملاء المشتركة" : "Shared Client Projects"}
              </div>
            </div>
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{locale === "ar" ? "معدل الإنجاز المشترك" : "Combined Progress Rate"}</span>
                <span className="text-accent">{combinedPct}%</span>
              </div>
              <Progress value={combinedPct} className="h-1.5 bg-accent/15" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical bottleneck notification system */}
      {gapCritical && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 text-sm">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-amber-900 leading-snug">
              {locale === "ar" ? "فجوة إنتاجية حرجة مكتشفة!" : "Critical Production Gap Detected!"}
            </h4>
            <p className="text-xs text-amber-700/90 font-medium mt-0.5 leading-relaxed">
              {locale === "ar"
                ? `هناك فجوة أداء تتجاوز 15% بين المصنعين. يتأخر حالياً ${laggingPlant} بالمقارنة مع الآخر، مما قد يعطل تسليم المشاريع المشتركة. يُرجى مراجعة الموارد وتوجيه المهام.`
                : `A performance gap of over 15% exists between plants. The ${laggingPlant} is currently lagging behind, which may delay shared client project handovers. Please review scheduling resources.`}
            </p>
          </div>
        </div>
      )}

      {/* Projects List Header */}
      <div className="pt-2 border-t border-sand/30">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-accent" />
          {locale === "ar" ? "تفاصيل المشاريع المشتركة قيد التنفيذ" : "Active Shared Projects Breakdown"}
        </h2>
      </div>

      {typedProjects.length === 0 && (
        <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg" data-testid="no-shared-projects">
          {ft("sharedProjects.empty")}
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

            <ImpactAlert metalPct={project.metalCompletionPct} woodenPct={project.woodenCompletionPct} ft={ft} />
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
                            <Link href={`/orders/metal/${mo.id}`} className="text-xs font-mono font-bold text-primary hover:underline truncate">
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
                            <Link href={`/orders/wood/${wo.id}`} className="text-xs font-mono font-bold text-blue-400 hover:underline truncate">
                              {wo.orderNo}
                            </Link>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[wo.status || ""] || "bg-muted text-muted-foreground"}`}>
                              {(wo.status === "Delivered" || wo.status === "تم التسليم") ? "تم التسليم" : (wo.status === "Production" || wo.status === "تحت التصنيع") ? "تحت التصنيع" : wo.status}
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
