import { useState } from "react";
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
import { Plus, Search, Pencil, Trash2, ExternalLink, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

const STATUS_COLORS: Record<string, string> = {
  "تحت التصنيع": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "تم التسليم": "bg-green-500/20 text-green-400 border-green-500/30",
  Production: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Delivered: "bg-green-500/20 text-green-400 border-green-500/30",
};

interface WoodenOrder {
  id: number;
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

function WoodenDialog({ open, onClose, order }: { open: boolean; onClose: () => void; order: WoodenOrder | null }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState(order ? {
    orderNo: order.orderNo,
    extension: order.extension || "",
    orderDate: order.orderDate || "",
    client: order.client || "",
    subProject: order.subProject || "",
    product: order.product,
    category: order.category || "",
    uom: order.uom || "قطعة",
    qty: parseFloat(String(order.qty)) || 0,
    done: parseFloat(String(order.done || 0)),
    rem: parseFloat(String(order.rem || 0)),
    status: order.status || "تحت التصنيع",
    prodDateStart: order.prodDateStart || "",
    prodDateEnd: order.prodDateEnd || "",
  } : EMPTY_FORM);

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
    if (order) update.mutate({ id: order.id, data: form });
    else create.mutate({ data: form });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader><DialogTitle>{order ? "تعديل أمر الشغل الخشبي" : "أمر شغل خشبي جديد"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1"><Label>رقم الأمر *</Label><Input value={form.orderNo} onChange={e => f("orderNo", e.target.value)} placeholder="WO-2025-XXX" data-testid="input-order-no" /></div>
          <div className="space-y-1"><Label>المنتج *</Label><Input value={form.product} onChange={e => f("product", e.target.value)} data-testid="input-wooden-product" /></div>
          <div className="space-y-1"><Label>العميل</Label><Input value={form.client} onChange={e => f("client", e.target.value)} data-testid="input-wooden-client" /></div>
          <div className="space-y-1"><Label>المشروع الفرعي</Label><Input value={form.subProject} onChange={e => f("subProject", e.target.value)} data-testid="input-wooden-sub-project" /></div>
          <div className="space-y-1"><Label>الكمية</Label><Input type="number" value={form.qty} onChange={e => f("qty", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-qty" /></div>
          <div className="space-y-1"><Label>المنجز</Label><Input type="number" value={form.done} onChange={e => f("done", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-done" /></div>
          <div className="space-y-1"><Label>المتبقي</Label><Input type="number" value={form.rem} onChange={e => f("rem", parseFloat(e.target.value) || 0)} min="0" data-testid="input-wooden-rem" /></div>
          <div className="space-y-1"><Label>الحالة</Label>
            <Select value={form.status} onValueChange={v => f("status", v)}>
              <SelectTrigger data-testid="select-wooden-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="تحت التصنيع">تحت التصنيع</SelectItem>
                <SelectItem value="تم التسليم">تم التسليم</SelectItem>
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

export default function WoodenOrders() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<WoodenOrder | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: orders, isLoading } = useListWoodenOrders({ search });

  const del = useDeleteWoodenOrder({
    mutation: {
      onSuccess: () => { qc.invalidateQueries({ queryKey: getListWoodenOrdersQueryKey() }); setDeleteId(null); toast({ title: "تم الحذف" }); },
      onError: () => toast({ title: "فشل الحذف", variant: "destructive" }),
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">أوامر المصنع الخشبي</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild data-testid="btn-export-wooden">
            <a href={`${API_BASE}/export/wooden-orders?format=xlsx`} download>
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              تصدير Excel
            </a>
          </Button>
          <Button onClick={() => { setEditOrder(null); setDialogOpen(true); }} data-testid="btn-new-wooden-order">
            <Plus className="ml-2 h-4 w-4" />
            أمر تشغيل جديد
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الأمر أو العميل..." className="pr-9" value={search} onChange={e => setSearch(e.target.value)} data-testid="input-wooden-search" />
        </div>
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
            ) : !orders?.length ? (
              <TableRow><TableCell colSpan={10} className="h-24 text-center text-muted-foreground">لا توجد أوامر</TableCell></TableRow>
            ) : (
              orders.map(order => {
                const qty = parseFloat(String(order.qty)) || 0;
                const done = parseFloat(String(order.done || 0));
                const pct = qty > 0 ? Math.round((done / qty) * 100) : 0;
                return (
                  <TableRow key={order.id} className="hover:bg-muted/20" data-testid={`wooden-order-row-${order.id}`}>
                    <TableCell className="font-medium text-blue-400">{order.orderNo}</TableCell>
                    <TableCell>{order.client || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{order.subProject || "—"}</TableCell>
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
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_COLORS[order.status || ""] || "bg-muted text-muted-foreground"}`}>
                        {order.status || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Link href={`/wooden/orders/${order.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7" data-testid={`btn-wooden-detail-${order.id}`}><ExternalLink className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditOrder(order as WoodenOrder); setDialogOpen(true); }} data-testid={`btn-wooden-edit-${order.id}`}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(order.id)} data-testid={`btn-wooden-delete-${order.id}`}><Trash2 className="h-3.5 w-3.5" /></Button>
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
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteId && del.mutate({ id: deleteId })} data-testid="btn-confirm-wooden-delete">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
