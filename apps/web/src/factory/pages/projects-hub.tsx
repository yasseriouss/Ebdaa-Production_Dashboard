import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@factory/lib/utils";
import {
  useListMetalOrders, useListWoodenOrders,
  useCreateMetalOrder, useCreateWoodenOrder,
  getListMetalOrdersQueryKey, getListWoodenOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@factory/components/ui/badge";
import { Progress } from "@factory/components/ui/progress";
import { Button } from "@factory/components/ui/button";
import { Checkbox } from "@factory/components/ui/checkbox";
import { Input } from "@factory/components/ui/input";
import { Label } from "@factory/components/ui/label";
import { Textarea } from "@factory/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@factory/components/ui/select";
import { PieBulletLegend } from "@factory/components/PieBulletLegend";
import { Skeleton } from "@factory/components/ui/skeleton";
import { Link } from "wouter";
import {
  Search, Plus, ChevronDown, ChevronUp, Factory, Boxes,
  AlertTriangle, BarChart3,
  Trash2, FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@factory/hooks/use-toast";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import {
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  type CutlistPart,
  DEPARTMENT_OPTIONS,
  WORKFLOW_OPTIONS,
  parseCutlistCsv,
  formatCutlistForOrderNotes,
  type WorkflowStatus,
} from "@factory/lib/cutlist-csv";

const executiveTransition = { type: "spring" as const, damping: 30, stiffness: 200, mass: 1 };

const STATUS_COLORS: Record<string, string> = {
  "تم الانتهاء": "bg-green-500/20 text-green-400",
  "تم التسليم": "bg-green-500/20 text-green-400",
  "Delivered": "bg-green-500/20 text-green-400",
  "تحت التصنيع": "bg-blue-500/20 text-blue-400",
  "Production": "bg-blue-500/20 text-blue-400",
  "في المخزن": "bg-yellow-500/20 text-yellow-400",
  "لم يتم البدء": "bg-muted text-muted-foreground",
  "متوقف": "bg-destructive/20 text-destructive",
};

const PIE_COLORS = [
  "oklch(65% 0.15 140)", "oklch(65% 0.15 250)", "oklch(75% 0.15 80)",
  "oklch(60% 0.15 30)", "oklch(60% 0.15 280)",
];

type ViewTab = "browse" | "new";

interface ProjectGroup {
  name: string;
  client: string;
  metalOrders: any[];
  woodenOrders: any[];
  totalOrders: number;
  totalQty: number;
  totalDone: number;
  totalRemaining: number;
  completionPct: number;
  statuses: Record<string, number>;
}

function groupProjects(metalOrders: any[], woodenOrders: any[]): ProjectGroup[] {
  const map = new Map<string, ProjectGroup>();

  for (const o of metalOrders) {
    const key = (o.project || o.client || "غير محدد").trim();
    if (!map.has(key)) {
      map.set(key, {
        name: key, client: o.client || "", metalOrders: [], woodenOrders: [],
        totalOrders: 0, totalQty: 0, totalDone: 0, totalRemaining: 0, completionPct: 0, statuses: {},
      });
    }
    const g = map.get(key)!;
    g.metalOrders.push(o);
    g.totalOrders++;
    const qty = parseFloat(String(o.qty || 0));
    const pct = parseFloat(String(o.completionPct || 0));
    const done = qty * pct / 100;
    g.totalQty += qty;
    g.totalDone += done;
    g.totalRemaining += parseFloat(String(o.backlogQty || 0));
    const st = o.status || "لم يتم البدء";
    g.statuses[st] = (g.statuses[st] || 0) + 1;
    if (!g.client && o.client) g.client = o.client;
  }

  for (const o of woodenOrders) {
    const key = (o.subProject || o.client || "غير محدد").trim();
    if (!map.has(key)) {
      map.set(key, {
        name: key, client: o.client || "", metalOrders: [], woodenOrders: [],
        totalOrders: 0, totalQty: 0, totalDone: 0, totalRemaining: 0, completionPct: 0, statuses: {},
      });
    }
    const g = map.get(key)!;
    g.woodenOrders.push(o);
    g.totalOrders++;
    const qty = parseFloat(String(o.qty || 0));
    const done = parseFloat(String(o.done || 0));
    g.totalQty += qty;
    g.totalDone += done;
    g.totalRemaining += parseFloat(String(o.rem || 0));
    const st = o.status || "لم يتم البدء";
    g.statuses[st] = (g.statuses[st] || 0) + 1;
    if (!g.client && o.client) g.client = o.client;
  }

  for (const g of map.values()) {
    g.completionPct = g.totalQty > 0 ? Math.round((g.totalDone / g.totalQty) * 100) : 0;
  }

  return Array.from(map.values()).sort((a, b) => b.totalOrders - a.totalOrders);
}

function ProjectDetail({ project }: { project: ProjectGroup }) {
  const statusData = Object.entries(project.statuses).map(([name, value], i) => ({
    name, value, fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-6 space-y-6 border-t border-foreground/5">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 rounded-2xl bg-foreground/[0.03]">
            <div className="text-2xl font-bold tabular-nums">{project.totalOrders}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">إجمالي الأوامر</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-foreground/[0.03]">
            <div className="text-2xl font-bold tabular-nums text-green-500">{Math.round(project.totalDone)}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">المنجز</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-foreground/[0.03]">
            <div className="text-2xl font-bold tabular-nums text-yellow-500">{Math.round(project.totalRemaining)}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">المتبقي</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-foreground/[0.03]">
            <div className="text-2xl font-bold tabular-nums text-blue-400">{project.metalOrders.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">أوامر معدني</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-foreground/[0.03]">
            <div className="text-2xl font-bold tabular-nums text-amber-500">{project.woodenOrders.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">أوامر خشبي</div>
          </div>
        </div>

        {/* Status pie */}
        {statusData.length > 0 && (
          <div className="space-y-3">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} paddingAngle={3} stroke="none">
                    {statusData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(99% 0.008 70)", border: "none", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieBulletLegend items={statusData.map(({ name, fill, value }) => ({ name, fill, value }))} />
          </div>
        )}

        {/* Orders list */}
        <div className="grid md:grid-cols-2 gap-6">
          {project.metalOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-bold"><Factory className="h-4 w-4 text-blue-400" />أوامر المصنع المعدني</div>
              <div className="space-y-2">
                {project.metalOrders.map((o: any) => (
                  <Link key={o.id} href={`/orders/metal/${o.id}`} className="block p-3 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors border border-foreground/5">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-blue-400">{o.moNumber}</span>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[o.status || ""] || "bg-muted"}`}>{o.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{o.product}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={Number(o.completionPct) || 0} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground">{o.completionPct || 0}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {project.woodenOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-bold"><Boxes className="h-4 w-4 text-amber-500" />أوامر المصنع الخشبي</div>
              <div className="space-y-2">
                {project.woodenOrders.map((o: any) => {
                  const qty = parseFloat(String(o.qty || 0));
                  const done = parseFloat(String(o.done || 0));
                  const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
                  return (
                    <Link key={o.id} href={`/orders/wood/${o.id}`} className="block p-3 rounded-xl bg-foreground/[0.02] hover:bg-foreground/[0.05] transition-colors border border-foreground/5">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-xs font-bold text-amber-500">{o.orderNo}</span>
                        <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[o.status || ""] || "bg-muted"}`}>{o.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{o.product}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={pct} className="h-1.5 flex-1" />
                        <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

type ProductLine = {
  id: string;
  product: string;
  qty: number;
  unit: string;
  lineFactory: "metal" | "wooden";
  department: string;
  cutlist: CutlistPart[];
};

function padOrderSeq(n: number) {
  return String(n).padStart(2, "0");
}

function departmentsForFactory(ff: "metal" | "wooden") {
  const k = ff === "metal" ? "metal" : "wood";
  return DEPARTMENT_OPTIONS.filter(d => d.factories.includes(k));
}

function newProductLine(defaultFactory: "metal" | "wooden"): ProductLine {
  return {
    id: crypto.randomUUID(),
    product: "",
    qty: 1,
    unit: "قطعة",
    lineFactory: defaultFactory,
    department: "UNASSIGNED",
    cutlist: [],
  };
}

function NewProjectForm() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvTargetLineId, setCsvTargetLineId] = useState<string | null>(null);
  const [factoryWood, setFactoryWood] = useState(true);
  const [factoryMetal, setFactoryMetal] = useState(true);
  const [cutlistOpen, setCutlistOpen] = useState<Record<string, boolean>>({});

  const [header, setHeader] = useState({
    orderPrefix: "",
    project: "",
    client: "",
    subProject: "",
    orderDate: new Date().toISOString().split("T")[0],
    status: "لم يتم البدء",
    notesGlobal: "",
  });

  const defaultLineFactory: "metal" | "wooden" =
    factoryMetal && !factoryWood ? "metal" : "wooden";

  const [lines, setLines] = useState<ProductLine[]>(() => [newProductLine("wooden")]);

  useEffect(() => {
    if (factoryMetal && !factoryWood) {
      setLines(prev => prev.map(l => ({ ...l, lineFactory: "metal" })));
    } else if (!factoryMetal && factoryWood) {
      setLines(prev => prev.map(l => ({ ...l, lineFactory: "wooden" })));
    }
  }, [factoryMetal, factoryWood]);

  const createMetal = useCreateMetalOrder();
  const createWooden = useCreateWoodenOrder();

  function resetForm() {
    setHeader({
      orderPrefix: "",
      project: "",
      client: "",
      subProject: "",
      orderDate: new Date().toISOString().split("T")[0],
      status: "لم يتم البدء",
      notesGlobal: "",
    });
    setLines([newProductLine(defaultLineFactory)]);
    setCutlistOpen({});
  }

  function resolveLineFactory(line: ProductLine): "metal" | "wooden" | null {
    if (!factoryMetal && !factoryWood) return null;
    if (factoryMetal && !factoryWood) return "metal";
    if (!factoryMetal && factoryWood) return "wooden";
    return line.lineFactory;
  }

  function updateLine(id: string, patch: Partial<ProductLine>) {
    setLines(prev => prev.map(l => (l.id === id ? { ...l, ...patch } : l)));
  }

  function updateCutlistPart(lineId: string, partId: string, patch: Partial<CutlistPart>) {
    setLines(prev =>
      prev.map(l => {
        if (l.id !== lineId) return l;
        return {
          ...l,
          cutlist: l.cutlist.map(p => (p.id === partId ? { ...p, ...patch } : p)),
        };
      }),
    );
  }

  function removeCutlistPart(lineId: string, partId: string) {
    setLines(prev =>
      prev.map(l =>
        l.id !== lineId ? l : { ...l, cutlist: l.cutlist.filter(p => p.id !== partId) },
      ),
    );
  }

  function addEmptyCutlistPart(lineId: string) {
    const blank: CutlistPart = {
      id: crypto.randomUUID(),
      partCode: "",
      description: "",
      qty: 1,
      dimensions: "",
      department: "UNASSIGNED",
      workflowStatus: "لم يبدأ",
    };
    setLines(prev =>
      prev.map(l => (l.id !== lineId ? l : { ...l, cutlist: [...l.cutlist, blank] })),
    );
  }

  function triggerCsvForLine(lineId: string) {
    setCsvTargetLineId(lineId);
    requestAnimationFrame(() => csvInputRef.current?.click());
  }

  async function onCsvSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const lineId = csvTargetLineId;
    e.target.value = "";
    if (!file || !lineId) return;

    const lower = file.name.toLowerCase();
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      toast({
        title: "استخدم CSV من Excel",
        description:
          "في Excel: ملف ← حفظ باسم ← CSV UTF-8 (*.csv). ثم استورد الملف هنا (دعم .xlsx مباشر يتطلب تثبيت الحزمة xlsx على البيئة).",
        variant: "destructive",
      });
      return;
    }
    if (!lower.endsWith(".csv") && !lower.endsWith(".txt")) {
      toast({
        title: "امتداد غير مدعوم",
        description: "يُقبل ملف .csv أو .txt (جدول مفصول بفواصل أو تابات).",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCutlistCsv(text);
      if (!parsed.length) {
        toast({
          title: "لم يُعثر على صفوف",
          description: "تأكد من وجود صف عناوين يحتوي كمية أو وصف أو كود قطعة.",
          variant: "destructive",
        });
        return;
      }
      setLines(prev =>
        prev.map(l => (l.id === lineId ? { ...l, cutlist: parsed } : l)),
      );
      toast({ title: `تم استيراد ${parsed.length} صف من القطع` });
    } catch {
      toast({ title: "فشل قراءة الملف", variant: "destructive" });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factoryMetal && !factoryWood) {
      toast({ title: "حدد مصنعاً واحداً على الأقل (خشبي و/أو معدني)", variant: "destructive" });
      return;
    }
    if (!header.orderPrefix.trim()) {
      toast({ title: "أدخل بادئة رقم الأمر", variant: "destructive" });
      return;
    }
    const validLines = lines.filter(l => l.product.trim() && l.qty > 0);
    if (!validLines.length) {
      toast({ title: "أضف سطر منتج واحد على الأقل مع اسم وكمية", variant: "destructive" });
      return;
    }

    for (const line of validLines) {
      const rf = resolveLineFactory(line);
      if (!rf) {
        toast({ title: "تعارض في اختيار المصنع", variant: "destructive" });
        return;
      }
    }

    let mi = 0;
    let wi = 0;
    const prefix = header.orderPrefix.trim();

    try {
      for (const line of validLines) {
        const rf = resolveLineFactory(line)!;
        const label = line.product.trim();
        const cutlistBlock = formatCutlistForOrderNotes(label, line.department, line.cutlist);

        if (rf === "metal") {
          mi += 1;
          const moNumber = `${prefix}-M${padOrderSeq(mi)}`;
          const notes = [header.notesGlobal.trim(), cutlistBlock].filter(Boolean).join("\n\n");
          await createMetal.mutateAsync({
            data: {
              moNumber,
              project: header.project,
              client: header.client,
              product: label,
              qty: line.qty,
              unit: line.unit,
              status: header.status,
              notes,
            },
          });
        } else {
          wi += 1;
          const orderNo = `${prefix}-W${padOrderSeq(wi)}`;
          const extensionParts = [header.notesGlobal.trim(), cutlistBlock].filter(Boolean);
          await createWooden.mutateAsync({
            data: {
              orderNo,
              client: header.client || "—",
              subProject: header.subProject.trim() || header.project,
              product: label,
              qty: line.qty,
              status: header.status,
              orderDate: header.orderDate,
              extension: extensionParts.join("\n\n"),
            },
          });
        }
      }

      await qc.invalidateQueries({ queryKey: getListMetalOrdersQueryKey() });
      await qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() });
      toast({
        title: "تم إنشاء أوامر الشغل",
        description: `معدني: ${mi} | خشبي: ${wi}`,
      });
      resetForm();
    } catch {
      toast({
        title: "توقف الحفظ قبل اكتمال جميع الأسطر",
        description: "راجع أرقام الأوامر (بادئة فريدة) أو اتصال الخادم.",
        variant: "destructive",
      });
    }
  }

  const isPending = createMetal.isPending || createWooden.isPending;
  const showLineFactory = factoryMetal && factoryWood;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv,text/plain"
        className="hidden"
        onChange={onCsvSelected}
      />

      <div className="double-bezel-outer">
        <div className="double-bezel-inner p-8 space-y-6">
          <h3 className="text-lg font-bold">إدخال مشروع / أوامر شغل جديدة</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            حدد ارتباط المشروع بالمصنعين (يمكن اختيار الاثنين). أضف عدة منتجات بكميات مختلفة. لكل سطر يمكن
            استيراد قائمة قطع (Cutlist) من ملف CSV مُصدَّر من Excel، ثم إسناد كل قطعة لقسم وتتبع حالة سير العمل
            ضمن الملاحظات المحفوظة مع الأمر.
          </p>

          <div className="rounded-2xl border border-foreground/10 p-5 space-y-4 bg-foreground/[0.02]">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              المشروع يتبع أي مصنع؟
            </Label>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium">
                <Checkbox
                  checked={factoryWood}
                  onCheckedChange={v => setFactoryWood(!!v)}
                />
                <Boxes className="h-4 w-4 text-amber-500" />
                المصنع الخشبي
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium">
                <Checkbox
                  checked={factoryMetal}
                  onCheckedChange={v => setFactoryMetal(!!v)}
                />
                <Factory className="h-4 w-4 text-blue-400" />
                المصنع المعدني
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                بادئة رقم الأمر * (يُضاف لاحقاً -M01 / -W02 لكل سطر)
              </Label>
              <Input
                value={header.orderPrefix}
                onChange={e => setHeader(h => ({ ...h, orderPrefix: e.target.value }))}
                placeholder="مثال: PRJ-2025-042"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</Label>
              <Select
                value={header.status}
                onValueChange={v => setHeader(h => ({ ...h, status: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="لم يتم البدء">لم يتم البدء</SelectItem>
                  <SelectItem value="تحت التصنيع">تحت التصنيع</SelectItem>
                  <SelectItem value="تم الانتهاء">تم الانتهاء</SelectItem>
                  <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                  <SelectItem value="متوقف">متوقف</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">العميل</Label>
              <Input
                value={header.client}
                onChange={e => setHeader(h => ({ ...h, client: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">المشروع</Label>
              <Input
                value={header.project}
                onChange={e => setHeader(h => ({ ...h, project: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">المشروع الفرعي (خشبي)</Label>
              <Input
                value={header.subProject}
                onChange={e => setHeader(h => ({ ...h, subProject: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">تاريخ الأمر (خشبي)</Label>
              <Input
                type="date"
                value={header.orderDate}
                onChange={e => setHeader(h => ({ ...h, orderDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 md:col-span-3">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ملاحظات عامة (تُنسخ لكل أمر)</Label>
              <Textarea
                value={header.notesGlobal}
                onChange={e => setHeader(h => ({ ...h, notesGlobal: e.target.value }))}
                rows={2}
                className="resize-y min-h-[72px]"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-bold">المنتجات و أوامر الشغل</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setLines(prev => [...prev, newProductLine(defaultLineFactory)])
                }
              >
                <Plus className="ml-1.5 h-4 w-4" />
                سطر منتج
              </Button>
            </div>

            <div className="space-y-4">
              {lines.map((line, idx) => {
                const rf = resolveLineFactory(line);
                const deptChoices = rf ? departmentsForFactory(rf) : DEPARTMENT_OPTIONS;
                const open = cutlistOpen[line.id] ?? false;

                return (
                  <div
                    key={line.id}
                    className="rounded-2xl border border-foreground/10 p-4 md:p-5 space-y-4 bg-foreground/[0.02]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        سطر {idx + 1}
                      </span>
                      {lines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          حذف السطر
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">المنتج *</Label>
                        <Input
                          value={line.product}
                          onChange={e => updateLine(line.id, { product: e.target.value })}
                          placeholder="اسم المنتج"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">الكمية *</Label>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={line.qty}
                          onChange={e =>
                            updateLine(line.id, { qty: parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">الوحدة</Label>
                        <Input
                          value={line.unit}
                          onChange={e => updateLine(line.id, { unit: e.target.value })}
                          disabled={!factoryMetal || rf === "wooden"}
                        />
                      </div>
                      {showLineFactory && (
                        <div className="space-y-1.5 md:col-span-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase">المصنع للسطر *</Label>
                          <Select
                            value={line.lineFactory}
                            onValueChange={v =>
                              updateLine(line.id, { lineFactory: v as "metal" | "wooden" })
                            }
                          >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wooden">خشبي</SelectItem>
                              <SelectItem value="metal">معدني</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase">قسم الإسناد الرئيسي</Label>
                        <Select
                          value={line.department}
                          onValueChange={v => updateLine(line.id, { department: v })}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {deptChoices.map(d => (
                              <SelectItem key={d.value} value={d.value}>
                                {d.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => triggerCsvForLine(line.id)}
                      >
                        <FileSpreadsheet className="ml-1.5 h-4 w-4" />
                        استيراد Cutlist (CSV)
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() => addEmptyCutlistPart(line.id)}
                      >
                        + قطعة يدوياً
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-xl"
                        onClick={() =>
                          setCutlistOpen(o => ({ ...o, [line.id]: !open }))
                        }
                      >
                        {open ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
                        القطع ({line.cutlist.length})
                      </Button>
                    </div>

                    {open && (
                      <div className="overflow-x-auto rounded-xl border border-foreground/10">
                        <table className="w-full text-sm min-w-[720px]">
                          <thead>
                            <tr className="border-b border-foreground/10 bg-foreground/[0.03] text-[10px] uppercase text-muted-foreground">
                              <th className="text-right p-2 font-bold">كود</th>
                              <th className="text-right p-2 font-bold">وصف</th>
                              <th className="text-right p-2 font-bold w-20">كمية</th>
                              <th className="text-right p-2 font-bold">أبعاد</th>
                              <th className="text-right p-2 font-bold">قسم القطعة</th>
                              <th className="text-right p-2 font-bold">سير العمل</th>
                              <th className="w-10" />
                            </tr>
                          </thead>
                          <tbody>
                            {line.cutlist.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="p-6 text-center text-muted-foreground text-xs">
                                  لا توجد قطع بعد — استورد CSV أو أضف يدوياً
                                </td>
                              </tr>
                            ) : (
                              line.cutlist.map(part => (
                                <tr key={part.id} className="border-b border-foreground/5">
                                  <td className="p-1.5">
                                    <Input
                                      className="h-8 text-xs"
                                      value={part.partCode}
                                      onChange={e =>
                                        updateCutlistPart(line.id, part.id, {
                                          partCode: e.target.value,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <Input
                                      className="h-8 text-xs"
                                      value={part.description}
                                      onChange={e =>
                                        updateCutlistPart(line.id, part.id, {
                                          description: e.target.value,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <Input
                                      type="number"
                                      min={0}
                                      step="any"
                                      className="h-8 text-xs"
                                      value={part.qty}
                                      onChange={e =>
                                        updateCutlistPart(line.id, part.id, {
                                          qty: parseFloat(e.target.value) || 0,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <Input
                                      className="h-8 text-xs"
                                      value={part.dimensions}
                                      onChange={e =>
                                        updateCutlistPart(line.id, part.id, {
                                          dimensions: e.target.value,
                                        })
                                      }
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <Input
                                      className="h-8 text-xs"
                                      value={part.department}
                                      onChange={e =>
                                        updateCutlistPart(line.id, part.id, {
                                          department: e.target.value,
                                        })
                                      }
                                      placeholder="كود أو اسم القسم"
                                    />
                                  </td>
                                  <td className="p-1.5">
                                    <Select
                                      value={part.workflowStatus}
                                      onValueChange={v =>
                                        updateCutlistPart(line.id, part.id, {
                                          workflowStatus: v as WorkflowStatus,
                                        })
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                        {WORKFLOW_OPTIONS.map(w => (
                                          <SelectItem key={w} value={w}>{w}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive"
                                      onClick={() => removeCutlistPart(line.id, part.id)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto px-12 h-12 rounded-2xl text-sm font-bold"
          >
            <Plus className="ml-2 h-4 w-4" />
            {isPending ? "جاري الحفظ..." : "إنشاء كل أوامر الشغل"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default function ProjectsHub() {
  const { ft } = useFactoryTranslation();
  const [viewTab, setViewTab] = useState<ViewTab>("browse");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [factoryFilter, setFactoryFilter] = useState("all");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const { data: metalOrders, isLoading: loadingMetal } = useListMetalOrders();
  const { data: woodenOrders, isLoading: loadingWooden } = useListWoodenOrders();

  const projects = useMemo(() => {
    return groupProjects(
      Array.isArray(metalOrders) ? metalOrders : [],
      Array.isArray(woodenOrders) ? woodenOrders : []
    );
  }, [metalOrders, woodenOrders]);

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.client.toLowerCase().includes(q)) return false;
      }
      if (statusFilter !== "all") {
        if (!p.statuses[statusFilter]) return false;
      }
      if (factoryFilter === "metal" && p.metalOrders.length === 0) return false;
      if (factoryFilter === "wooden" && p.woodenOrders.length === 0) return false;
      if (factoryFilter === "both" && (p.metalOrders.length === 0 || p.woodenOrders.length === 0)) return false;
      return true;
    });
  }, [projects, search, statusFilter, factoryFilter]);

  const isLoading = loadingMetal || loadingWooden;

  const allStatuses = useMemo(() => {
    const s = new Set<string>();
    projects.forEach(p => Object.keys(p.statuses).forEach(st => s.add(st)));
    return Array.from(s).sort();
  }, [projects]);

  return (
    <motion.div
      className="p-4 sm:p-6 lg:p-12 space-y-6 sm:space-y-8 w-full min-w-0 max-w-full mx-auto overflow-x-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={executiveTransition}
    >
      <header className="space-y-2 min-w-0">
        <h1 className="text-2xl sm:text-4xl font-bold text-foreground">{ft("projectsHub.title")}</h1>
        <p className="text-muted-foreground font-medium max-w-3xl leading-relaxed text-sm sm:text-base">
          {ft("projectsHub.subtitle")}
        </p>
      </header>

      {/* View tabs */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setViewTab("browse")}
          className={cn("flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
            viewTab === "browse" ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-foreground/5 text-foreground hover:bg-foreground/10")}>
          <BarChart3 className="h-4 w-4 shrink-0" />
          {ft("projectsHub.tabBrowse")}
        </button>
        <button onClick={() => setViewTab("new")}
          className={cn("flex items-center gap-2 px-4 sm:px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300",
            viewTab === "new" ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-foreground/5 text-foreground hover:bg-foreground/10")}>
          <Plus className="h-4 w-4 shrink-0" />
          {ft("projectsHub.tabNew")}
        </button>
      </div>

      {viewTab === "new" && <NewProjectForm />}

      {viewTab === "browse" && (
        <motion.div
          key="browse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Filters */}
          <div className="double-bezel-outer">
            <div className="double-bezel-inner p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex flex-col gap-1.5 min-w-[200px] flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">بحث</label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="اسم المشروع أو العميل..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">الحالة</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      {allStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5 min-w-[150px]">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">المصنع</label>
                  <Select value={factoryFilter} onValueChange={setFactoryFilter}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="metal">المعدني فقط</SelectItem>
                      <SelectItem value="wooden">الخشبي فقط</SelectItem>
                      <SelectItem value="both">المشترك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 text-center">
                <div className="text-3xl font-bold tabular-nums">{filtered.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">مشاريع</div>
              </div>
            </div>
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 text-center">
                <div className="text-3xl font-bold tabular-nums text-blue-400">{filtered.reduce((s, p) => s + p.metalOrders.length, 0)}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">أوامر معدني</div>
              </div>
            </div>
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 text-center">
                <div className="text-3xl font-bold tabular-nums text-amber-500">{filtered.reduce((s, p) => s + p.woodenOrders.length, 0)}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">أوامر خشبي</div>
              </div>
            </div>
            <div className="double-bezel-outer">
              <div className="double-bezel-inner p-5 text-center">
                <div className="text-3xl font-bold tabular-nums text-green-500">
                  {filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.completionPct, 0) / filtered.length) : 0}%
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">متوسط الإنجاز</div>
              </div>
            </div>
          </div>

          {/* Project cards */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-3xl" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border border-dashed rounded-2xl">لا توجد مشاريع مطابقة</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(project => {
                const isExpanded = expandedProject === project.name;
                return (
                  <div key={project.name} className="double-bezel-outer">
                    <div className="double-bezel-inner">
                      <button
                        onClick={() => setExpandedProject(isExpanded ? null : project.name)}
                        className="w-full p-5 flex items-center gap-4 text-right hover:bg-foreground/[0.02] transition-colors rounded-[inherit]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="font-bold text-lg truncate">{project.name}</h3>
                            {project.client && project.client !== project.name && (
                              <span className="text-xs text-muted-foreground">({project.client})</span>
                            )}
                            <div className="flex gap-1.5">
                              {project.metalOrders.length > 0 && <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20"><Factory className="h-3 w-3 ml-1" />{project.metalOrders.length}</Badge>}
                              {project.woodenOrders.length > 0 && <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/20"><Boxes className="h-3 w-3 ml-1" />{project.woodenOrders.length}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <Progress value={project.completionPct} className="h-2 flex-1 max-w-xs" />
                            <span className="text-sm font-bold tabular-nums text-muted-foreground">{project.completionPct}%</span>
                            {project.totalRemaining > 0 && (
                              <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />متبقي: {Math.round(project.totalRemaining)}
                              </span>
                            )}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />}
                      </button>
                      {isExpanded && <ProjectDetail project={project} />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
