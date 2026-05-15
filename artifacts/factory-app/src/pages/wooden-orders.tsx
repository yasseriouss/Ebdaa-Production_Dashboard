import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import {
  useListWoodenOrders,
  useCreateWoodenOrder,
  useUpdateWoodenOrder,
  useDeleteWoodenOrder,
  getListWoodenOrdersQueryKey,
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
import { Search, Pencil, Trash2, ExternalLink, FileSpreadsheet, FileText, SquarePen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WOODEN_ORDER_STATUSES, getWoodenStatusBadgeClass } from "@/data/woodenOrderStatuses";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export type WoodenOrdersHandle = { openNewOrder: () => void };

function buildWoodenExportUrl(
  format: "xlsx" | "pdf",
  filters: { search: string; statusFilter: string; dateFrom: string; dateTo: string },
) {
  const params = new URLSearchParams({ format });
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.statusFilter !== "all") params.set("status", filters.statusFilter);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  return `${API_BASE}/export/wooden-orders?${params.toString()}`;
}

interface WoodenOrder {
  id: string | number;
  orderNo: string;
  extension?: string | null;
  orderDate?: string | null;
  client?: string | null;
  subProject?: string | null;
  product: string;
  category?: string | null;
  uom?: string | null;
  qty: string | number;
  done?: string | number | null;
  rem?: string | number | null;
  status?: string | null;
  prodDateStart?: string | null;
  prodDateEnd?: string | null;
}

const EMPTY_FORM = {
  orderNo: "", extension: "", orderDate: "", client: "", subProject: "",
  product: "", category: "", uom: "قطعة", qty: 0, done: 0, rem: 0,
  status: "تحت التصنيع", prodDateStart: "", prodDateEnd: "",
};

function dateInputSlice(d: string | null | undefined) {
  if (!d) return "";
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function buildWoodenQuickUpdateBody(
  order: WoodenOrder,
  draft: { subProject: string; status: string; client: string },
) {
  return {
    orderNo: order.orderNo,
    extension: order.extension || "",
    orderDate: dateInputSlice(order.orderDate) || "",
    client: draft.client,
    subProject: draft.subProject,
    product: order.product,
    category: order.category || "",
    uom: order.uom || "قطعة",
    qty: parseFloat(String(order.qty)) || 0,
    done: parseFloat(String(order.done || 0)),
    rem: parseFloat(String(order.rem || 0)),
    status: draft.status,
    prodDateStart: dateInputSlice(order.prodDateStart),
    prodDateEnd: dateInputSlice(order.prodDateEnd),
  };
}

function woodenOrderToForm(order: WoodenOrder) {
  return {
    orderNo: order.orderNo,
    extension: order.extension || "",
    orderDate: dateInputSlice(order.orderDate),
    client: order.client || "",
    subProject: order.subProject || "",
    product: order.product,
    category: order.category || "",
    uom: order.uom || "قطعة",
    qty: parseFloat(String(order.qty)) || 0,
    done: parseFloat(String(order.done || 0)),
    rem: parseFloat(String(order.rem || 0)),
    status: order.status || "تحت التصنيع",
    prodDateStart: dateInputSlice(order.prodDateStart),
    prodDateEnd: dateInputSlice(order.prodDateEnd),
  };
}

function WoodenDialog({ open, onClose, order }: { open: boolean; onClose: () => void; order: WoodenOrder | null }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(() => (order ? woodenOrderToForm(order) : { ...EMPTY_FORM }));

  useEffect(() => {
    if (!open) return;
    setForm(order ? woodenOrderToForm(order) : { ...EMPTY_FORM });
  }, [open, order]);

  const create = useCreateWoodenOrder({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() }); toast({ title: "تم إنشاء الأمر" }); onClose(); },
      onError: () => toast({ title: "فشل الإنشاء", variant: "destructive" }),
    },
  });
  const update = useUpdateWoodenOrder({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() }); toast({ title: "تم التحديث" }); onClose(); },
      onError: () => toast({ title: "فشل التحديث", variant: "destructive" }),
    },
  });

  const f = (k: keyof typeof EMPTY_FORM, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));
  const save = () => {
    if (!form.orderNo || !form.product) { toast({ title: "يرجى ملء الحقول المطلوبة", variant: "destructive" }); return; }
    if (order) update.mutate({ id: order.id as unknown as number, data: form });
    else create.mutate({ data: form });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>{order ? "تعديل أمر الشغل الخشبي" : "أمر شغل خشبي جديد"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1"><Label>رقم الأمر *</Label><Input value={form.orderNo} onChange={e => f("orderNo", e.target.value)} placeholder="WO-2025-XXX" data-testid="input-order-no" /></div>
          <div className="space-y-1"><Label>الامتداد</Label><Input value={form.extension} onChange={e => f("extension", e.target.value)} data-testid="input-wooden-extension" /></div>
          <div className="space-y-1"><Label>تاريخ الأمر</Label><Input type="date" value={form.orderDate} onChange={e => f("orderDate", e.target.value)} data-testid="input-wooden-order-date" /></div>
          <div className="space-y-1"><Label>المنتج *</Label><Input value={form.product} onChange={e => f("product", e.target.value)} data-testid="input-wooden-product" /></div>
          <div className="space-y-1"><Label>التصنيف</Label><Input value={form.category} onChange={e => f("category", e.target.value)} data-testid="input-wooden-category" /></div>
          <div className="space-y-1"><Label>الوحدة</Label><Input value={form.uom} onChange={e => f("uom", e.target.value)} data-testid="input-wooden-uom" /></div>
          <div className="space-y-1"><Label>العميل</Label><Input value={form.client} onChange={e => f("client", e.target.value)} data-testid="input-wooden-client" /></div>
          <div className="space-y-1"><Label>المشروع الفرعي</Label><Input value={form.subProject} onChange={e => f("subProject", e.target.value)} data-testid="input-wooden-sub-project" /></div>
          <div className="space-y-1"><Label>الكمية</Label><Input type="number" value={form.qty} onChange={e => f("qty", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-qty" /></div>
          <div className="space-y-1"><Label>المنجز</Label><Input type="number" value={form.done} onChange={e => f("done", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-done" /></div>
          <div className="space-y-1"><Label>المتبقي</Label><Input type="number" value={form.rem} onChange={e => f("rem", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-rem" /></div>
          <div className="space-y-1"><Label>الحالة</Label>
            <Select value={form.status} onValueChange={v => f("status", v)}>
              <SelectTrigger data-testid="select-wooden-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WOODEN_ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label>تاريخ البداية</Label><Input type="date" value={form.prodDateStart} onChange={e => f("prodDateStart", e.target.value)} data-testid="input-wooden-start-date" /></div>
          <div className="space-y-1"><Label>تاريخ النهاية</Label><Input type="date" value={form.prodDateEnd} onChange={e => f("prodDateEnd", e.target.value)} data-testid="input-wooden-end-date" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>إلغاء</Button>
          <Button onClick={save} disabled={create.isPending || update.isPending} data-testid="btn-save-wooden-order">
            {create.isPending || update.isPending ? "جاري الحفظ..." : "حفظ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const WoodenOrders = forwardRef<WoodenOrdersHandle, object>(function WoodenOrders(_props, ref) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<WoodenOrder | null>(null);
  const [deleteId, setDeleteId] = useState<string | number | null>(null);
  const [tableEditMode, setTableEditMode] = useState(false);
  const [rowDrafts, setRowDrafts] = useState<
    Record<string, { subProject: string; status: string; client: string }>
  >({});

  useImperativeHandle(ref, () => ({
    openNewOrder: () => {
      setEditOrder(null);
      setDialogOpen(true);
    },
  }));

  const { data: orders, isLoading } = useListWoodenOrders({
    search,
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  });

  const excelExportUrl = buildWoodenExportUrl("xlsx", { search, statusFilter, dateFrom, dateTo });
  const pdfExportUrl = buildWoodenExportUrl("pdf", { search, statusFilter, dateFrom, dateTo });

  const WOODEN_STATUS_OPTIONS = [...WOODEN_ORDER_STATUSES];

  const quickRowUpdate = useUpdateWoodenOrder({
    mutation: {
      onSuccess: () => {
        void qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() });
        toast({ title: "تم حفظ التعديلات" });
      },
      onError: () => toast({ title: "فشل حفظ الصف", variant: "destructive" }),
    },
  });

  useEffect(() => {
    if (!tableEditMode || !Array.isArray(orders)) return;
    setRowDrafts((prev) => {
      const next = { ...prev };
      for (const o of orders) {
        const k = String(o.id);
        if (!(k in next)) {
          next[k] = {
            subProject: o.subProject || "",
            status: o.status || "تحت التصنيع",
            client: o.client || "",
          };
        }
      }
      return next;
    });
  }, [tableEditMode, orders]);

  const del = useDeleteWoodenOrder({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() }); setDeleteId(null); toast({ title: "تم الحذف" }); },
      onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">أوامر المصنع الخشبي</h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            كل أمر شغل يتبع مشروعاً (المشروع الفرعي في الجدول). العميل قد يملك عدة مشاريع، وكل مشروع عدة أوامر شغل.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" asChild data-testid="btn-export-wooden">
            <a href={excelExportUrl} download>
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              تصدير Excel
            </a>
          </Button>
          <Button variant="outline" asChild data-testid="btn-export-wooden-pdf">
            <a href={pdfExportUrl} download>
              <FileText className="ml-2 h-4 w-4" />
              تصدير PDF
            </a>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-auto sm:max-w-[220px]">
          <Label className="mb-1 block text-xs text-muted-foreground">وضع التعديل</Label>
          <Button
            type="button"
            variant={tableEditMode ? "default" : "outline"}
            className="w-full sm:w-auto gap-2"
            onClick={() => {
              setTableEditMode((prev) => {
                if (prev) {
                  setRowDrafts({});
                  return false;
                }
                if (Array.isArray(orders)) {
                  const init: Record<string, { subProject: string; status: string; client: string }> = {};
                  for (const o of orders) {
                    init[String(o.id)] = {
                      subProject: o.subProject || "",
                      status: o.status || "تحت التصنيع",
                      client: o.client || "",
                    };
                  }
                  setRowDrafts(init);
                }
                return true;
              });
            }}
            data-testid="btn-wooden-table-edit-mode"
          >
            <SquarePen className="h-4 w-4 shrink-0" />
            {tableEditMode ? "إيقاف التعديل في الجدول" : "تعديل في الجدول"}
          </Button>
        </div>
        <div className="relative w-full sm:w-72">
          <Label className="mb-1 block text-xs text-muted-foreground">بحث</Label>
          <Search className="absolute right-2.5 top-[34px] h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الأمر أو العميل..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-wooden-search" />
        </div>
        <div className="w-44">
          <Label className="mb-1 block text-xs text-muted-foreground">الحالة</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="select-wooden-status-filter"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {WOODEN_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label className="mb-1 block text-xs text-muted-foreground">من تاريخ (للتصدير)</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} data-testid="input-wooden-date-from" />
        </div>
        <div className="w-40">
          <Label className="mb-1 block text-xs text-muted-foreground">إلى تاريخ (للتصدير)</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} data-testid="input-wooden-date-to" />
        </div>
        {(search || statusFilter !== "all" || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setStatusFilter("all"); setDateFrom(""); setDateTo(""); }}
            data-testid="btn-wooden-clear-filters"
          >
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div className="rounded-md border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-right">رقم الأمر</TableHead>
              <TableHead className="text-right">العميل</TableHead>
              <TableHead className="text-right">المشروع</TableHead>
              <TableHead className="text-right">المنتج</TableHead>
              <TableHead className="text-right">الكمية</TableHead>
              <TableHead className="text-right">المنجز</TableHead>
              <TableHead className="text-right min-w-[140px]">نسبة الإنجاز</TableHead>
              <TableHead className="text-right">المتبقي</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">جاري التحميل...</TableCell></TableRow>
            ) : !Array.isArray(orders) || !orders.length ? (
              <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">لا توجد أوامر</TableCell></TableRow>
            ) : (
              orders.map(order => {
                const qty = parseFloat(String(order.qty)) || 0;
                const done = parseFloat(String(order.done || 0));
                const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
                const rowKey = String(order.id);
                const draft = rowDrafts[rowKey] ?? {
                  subProject: order.subProject || "",
                  status: order.status || "تحت التصنيع",
                  client: order.client || "",
                };
                return (
                  <TableRow key={order.id} className="hover:bg-muted/20" data-testid={`wooden-order-row-${order.id}`}>
                    <TableCell className="font-medium text-blue-400">{order.orderNo}</TableCell>
                    <TableCell className="min-w-[120px]">
                      {tableEditMode ? (
                        <Input
                          className="h-8 text-xs"
                          value={draft.client}
                          onChange={(e) =>
                            setRowDrafts((p) => ({
                              ...p,
                              [rowKey]: { ...draft, client: e.target.value },
                            }))
                          }
                          data-testid={`input-wooden-row-client-${rowKey}`}
                        />
                      ) : (
                        order.client || "—"
                      )}
                    </TableCell>
                    <TableCell className="min-w-[140px] text-muted-foreground">
                      {tableEditMode ? (
                        <Input
                          className="h-8 text-xs"
                          value={draft.subProject}
                          onChange={(e) =>
                            setRowDrafts((p) => ({
                              ...p,
                              [rowKey]: { ...draft, subProject: e.target.value },
                            }))
                          }
                          data-testid={`input-wooden-row-subproject-${rowKey}`}
                          placeholder="المشروع الفرعي"
                        />
                      ) : (
                        order.subProject || "—"
                      )}
                    </TableCell>
                    <TableCell>{order.product}</TableCell>
                    <TableCell>{order.qty}</TableCell>
                    <TableCell className="text-green-400">{order.done || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className={Number(order.rem) > 0 ? "text-yellow-400" : "text-green-400"}>{order.rem || 0}</TableCell>
                    <TableCell className="min-w-[150px]">
                      {tableEditMode ? (
                        <Select
                          value={draft.status}
                          onValueChange={(v) =>
                            setRowDrafts((p) => ({
                              ...p,
                              [rowKey]: { ...draft, status: v },
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 text-xs" data-testid={`select-wooden-row-status-${rowKey}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WOODEN_ORDER_STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className={`text-xs border ${getWoodenStatusBadgeClass(order.status)}`}>
                          {order.status || "—"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:justify-end">
                        {tableEditMode && (
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 text-xs shrink-0"
                            disabled={quickRowUpdate.isPending}
                            onClick={() => {
                              quickRowUpdate.mutate({
                                id: order.id as unknown as number,
                                data: buildWoodenQuickUpdateBody(order, draft),
                              });
                            }}
                            data-testid={`btn-wooden-row-save-${rowKey}`}
                          >
                            حفظ الصف
                          </Button>
                        )}
                        <div className="flex items-center gap-1 justify-end">
                          <Link href={`/wooden/orders/${order.id}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`btn-wooden-detail-${order.id}`}><ExternalLink className="h-3.5 w-3.5" /></Button>
                          </Link>
                          {!tableEditMode && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditOrder(order as WoodenOrder); setDialogOpen(true); }} data-testid={`btn-wooden-edit-${order.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)} data-testid={`btn-wooden-delete-${order.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <WoodenDialog open={dialogOpen} onClose={() => setDialogOpen(false)} order={editOrder} />

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا الأمر؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteId != null && del.mutate({ id: deleteId as unknown as number })} data-testid="btn-confirm-wooden-delete">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default WoodenOrders;
