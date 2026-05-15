import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  useListMetalOrders,
  useCreateMetalOrder,
  useUpdateMetalOrder,
  useDeleteMetalOrder,
  getListMetalOrdersQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { Search, Pencil, Trash2, ExternalLink, FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export type MetalOrdersHandle = { openNewOrder: () => void };

function buildMetalExportUrl(
  format: "xlsx" | "pdf",
  filters: { search: string; statusFilter: string; dateFrom: string; dateTo: string },
) {
  const params = new URLSearchParams({ format });
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.statusFilter !== "all") params.set("status", filters.statusFilter);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return `${API_BASE}/export/metal-orders?${params.toString()}`;
}

const STATUS_OPTIONS = ["لم يتم البدء", "تحت التصنيع", "في المخزن", "تم الانتهاء", "متوقف", "تم التسليم"];

const STATUS_COLORS: Record<string, string> = {
  "لم يتم البدء": "bg-muted text-muted-foreground",
  "تحت التصنيع": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "في المخزن": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "تم الانتهاء": "bg-green-500/20 text-green-400 border-green-500/30",
  "متوقف": "bg-destructive/20 text-destructive border-destructive/30",
  "تم التسليم": "bg-primary/20 text-primary border-primary/30",
};

interface MetalOrder {
  id: number;
  moNumber: string;
  project?: string | null;
  client?: string | null;
  product: string;
  qty: string | number;
  unit?: string | null;
  deliveredQty?: string | number | null;
  completionPct?: string | number | null;
  backlogQty?: string | number | null;
  backlogStatus?: string | null;
  notes?: string | null;
  status?: string | null;
}

const EMPTY_FORM = {
  moNumber: "", project: "", client: "", product: "", qty: 0, unit: "قطعة",
  deliveredQty: 0, completionPct: 0, backlogQty: 0, backlogStatus: "", notes: "", status: "لم يتم البدء",
};

function metalOrderToForm(order: MetalOrder) {
  return {
    moNumber: order.moNumber,
    project: order.project || "",
    client: order.client || "",
    product: order.product,
    qty: parseFloat(String(order.qty)) || 0,
    unit: order.unit || "قطعة",
    deliveredQty: parseFloat(String(order.deliveredQty || 0)),
    completionPct: parseFloat(String(order.completionPct || 0)),
    backlogQty: parseFloat(String(order.backlogQty || 0)),
    backlogStatus: order.backlogStatus || "",
    notes: order.notes || "",
    status: order.status || "لم يتم البدء",
  };
}

function OrderDialog({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: MetalOrder | null;
}) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(() => (order ? metalOrderToForm(order) : { ...EMPTY_FORM }));

  useEffect(() => {
    if (!open) return;
    setForm(order ? metalOrderToForm(order) : { ...EMPTY_FORM });
  }, [open, order]);
  const create = useCreateMetalOrder({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMetalOrdersQueryKey() });
        toast({ title: "تم إنشاء الأمر بنجاح" });
        onClose();
      },
      onError: () => toast({ title: "فشل إنشاء الأمر", variant: "destructive" }),
    },
  });

  const update = useUpdateMetalOrder({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMetalOrdersQueryKey() });
        toast({ title: "تم تحديث الأمر" });
        onClose();
      },
      onError: () => toast({ title: "فشل تحديث الأمر", variant: "destructive" }),
    },
  });

  const handleSave = () => {
    if (!form.moNumber || !form.product) {
      toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" });
      return;
    }
    if (order) {
      update.mutate({ id: order.id, data: form });
    } else {
      create.mutate({ data: form });
    }
  };

  const f = (k: keyof typeof EMPTY_FORM, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle>{order ? "تعديل أمر الشغل" : "أمر شغل جديد"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="moNumber">رقم MO *</Label>
            <Input id="moNumber" value={form.moNumber} onChange={e => f("moNumber", e.target.value)} placeholder="MO-2025-XXX" data-testid="input-mo-number" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="product">المنتج *</Label>
            <Input id="product" value={form.product} onChange={e => f("product", e.target.value)} data-testid="input-product" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="client">العميل</Label>
            <Input id="client" value={form.client} onChange={e => f("client", e.target.value)} data-testid="input-client" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="project">المشروع</Label>
            <Input id="project" value={form.project} onChange={e => f("project", e.target.value)} data-testid="input-project" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="qty">الكمية</Label>
            <Input id="qty" type="number" value={form.qty} onChange={e => f("qty", parseFloat(e.target.value) || 0)} min="0" data-testid="input-qty" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="unit">الوحدة</Label>
            <Input id="unit" value={form.unit} onChange={e => f("unit", e.target.value)} data-testid="input-unit" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deliveredQty">المُسلَّم</Label>
            <Input id="deliveredQty" type="number" value={form.deliveredQty} onChange={e => f("deliveredQty", parseFloat(e.target.value) || 0)} min="0" data-testid="input-delivered-qty" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="completionPct">نسبة الإنجاز %</Label>
            <Input id="completionPct" type="number" value={form.completionPct} onChange={e => f("completionPct", parseFloat(e.target.value) || 0)} min="0" max="100" data-testid="input-completion-pct" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="backlogQty">المتأخرات</Label>
            <Input id="backlogQty" type="number" value={form.backlogQty} onChange={e => f("backlogQty", parseFloat(e.target.value) || 0)} min="0" data-testid="input-backlog-qty" />
          </div>
          <div className="space-y-1">
            <Label>الحالة</Label>
            <Select value={form.status} onValueChange={v => f("status", v)}>
              <SelectTrigger data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="backlogStatus">حالة المتأخرات</Label>
            <Input
              id="backlogStatus"
              value={form.backlogStatus}
              onChange={e => f("backlogStatus", e.target.value)}
              data-testid="input-backlog-status"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label htmlFor="notes">ملاحظات</Label>
            <Input id="notes" value={form.notes} onChange={e => f("notes", e.target.value)} data-testid="input-notes" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={handleSave} disabled={isPending} data-testid="btn-save-order">
            {isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const MetalOrders = forwardRef<MetalOrdersHandle, object>(function MetalOrders(_props, ref) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<MetalOrder | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useImperativeHandle(ref, () => ({
    openNewOrder: () => {
      setEditOrder(null);
      setDialogOpen(true);
    },
  }));

  const { data: orders, isLoading } = useListMetalOrders({
    search,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  });

  const excelExportUrl = buildMetalExportUrl("xlsx", { search, statusFilter, dateFrom, dateTo });
  const pdfExportUrl = buildMetalExportUrl("pdf", { search, statusFilter, dateFrom, dateTo });

  const del = useDeleteMetalOrder({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListMetalOrdersQueryKey() });
        setDeleteId(null);
        toast({ title: "تم حذف الأمر" });
      },
      onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">أوامر المصنع المعدني</h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            كل أمر شغل يتبع مشروعاً (حقل المشروع). العميل قد يملك عدة مشاريع، وكل مشروع عدة أوامر شغل.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild data-testid="btn-export-metal">
            <a href={excelExportUrl} download>
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              تصدير Excel
            </a>
          </Button>
          <Button variant="outline" asChild data-testid="btn-export-metal-pdf">
            <a href={pdfExportUrl} download>
              <FileText className="ml-2 h-4 w-4" />
              تصدير PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="relative w-full sm:w-72">
          <Label className="mb-1 block text-xs text-muted-foreground">بحث</Label>
          <Search className="absolute right-2.5 top-[34px] h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الأمر أو العميل..."
            className="pr-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            data-testid="input-search"
          />
        </div>
        <div className="w-44">
          <Label className="mb-1 block text-xs text-muted-foreground">الحالة</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="select-status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label className="mb-1 block text-xs text-muted-foreground">من تاريخ (للتصدير)</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} data-testid="input-date-from" />
        </div>
        <div className="w-40">
          <Label className="mb-1 block text-xs text-muted-foreground">إلى تاريخ (للتصدير)</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} data-testid="input-date-to" />
        </div>
        {(search || statusFilter !== "all" || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
            data-testid="btn-clear-filters"
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right">MO رقم</TableHead>
              <TableHead className="text-right">مشروع</TableHead>
              <TableHead className="text-right">عميل</TableHead>
              <TableHead className="text-right">منتج</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">المُسلَّم</TableHead>
              <TableHead className="text-right min-w-[140px]">نسبة الإنجاز</TableHead>
              <TableHead className="text-right">المتأخرات</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">جاري التحميل...</TableCell>
              </TableRow>
            ) : !Array.isArray(orders) || !orders.length ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">لا توجد أوامر</TableCell>
              </TableRow>
            ) : (
              orders.map(order => (
                <TableRow key={order.id} className="hover:bg-muted/20" data-testid={`order-row-${order.id}`}>
                  <TableCell className="font-medium text-primary">{order.moNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{order.project || "—"}</TableCell>
                  <TableCell>{order.client || "—"}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.qty}</TableCell>
                  <TableCell className="text-green-400">{order.deliveredQty || 0}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={Number(order.completionPct) || 0} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground shrink-0">{order.completionPct || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {Number(order.backlogQty) > 0
                      ? <span className="text-destructive font-medium text-sm">{order.backlogQty}</span>
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${STATUS_COLORS[order.status || ""] || "bg-muted"}`}>
                      {order.status || "جديد"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={`/metal/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`btn-detail-${order.id}`}>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditOrder(order as MetalOrder); setDialogOpen(true); }} data-testid={`btn-edit-${order.id}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)} data-testid={`btn-delete-${order.id}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <OrderDialog open={dialogOpen} onClose={() => setDialogOpen(false)} order={editOrder} />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && del.mutate({ id: deleteId })}
              data-testid="btn-confirm-delete"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default MetalOrders;
