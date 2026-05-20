import { useState, useEffect, useMemo } from "react";
import { useListWoodenOrders, useListMetalOrders } from "@workspace/api-client-react";
import { Input } from "@factory/components/ui/input";
import { Button } from "@factory/components/ui/button";
import { useToast } from "@factory/hooks/use-toast";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import { FileSpreadsheet, Printer, Download, ClipboardCheck, Loader2 } from "lucide-react";
import {
  downloadDailySheetHtml,
  downloadDailySheetXls,
  openDailySheetPrint,
  type DailySheetRow,
} from "../../lib/dailySheet";
import { downloadDailySheetPdf } from "../../lib/pdf";

interface DailyProductionLogsProps {
  factory: "wood" | "metal";
}

interface StageLog {
  id?: string;
  orderNo: string;
  stageName: string;
  logDate: string;
  inputQty: string;
  outputQty: string;
  wasteQty: string;
  operator: string | null;
  notes: string | null;
  woodenOrderId?: string;
  metalOrderId?: string;
}

const WOOD_STAGES = ["القطع", "التجميع", "التشطيب", "التغليف"];
const METAL_STAGES = [
  "الليزر", "المقص", "الكويل", "البانش", "مكابس و تكويع", "المثقاب", "التخليع", "التنايات",
  "لحام CO2", "تجليخ", "لحام بنطة", "لحام نحاس", "لحام أرجون استالنس", "تشطيب استالنس", "الدهان", "التجميع", "التسليم"
];

interface FlatOrder {
  id: string;
  orderNo: string;
  client: string;
  product: string;
  targetQty: number;
}

export default function DailyProductionLogs({ factory }: DailyProductionLogsProps) {
  const { locale } = useFactoryTranslation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  
  const stages = factory === "wood" ? WOOD_STAGES : METAL_STAGES;
  const [selectedStage, setSelectedStage] = useState<string>(stages[0]);

  // Load orders using React Query
  const { data: woodOrdersRaw, isLoading: loadingWood } = useListWoodenOrders();
  const { data: metalOrdersRaw, isLoading: loadingMetal } = useListMetalOrders();

  const orders = useMemo<FlatOrder[]>(() => {
    if (factory === "wood") {
      const list = woodOrdersRaw || [];
      return list.map((o: any) => ({
        id: String(o.id),
        orderNo: o.orderNo,
        client: o.client || "---",
        product: o.product,
        targetQty: parseFloat(String(o.qty || 0)),
      }));
    } else {
      const list = metalOrdersRaw || [];
      return list.map((o: any) => ({
        id: String(o.id),
        orderNo: o.moNumber,
        client: o.client || "---",
        product: o.product,
        targetQty: parseFloat(String(o.qty || 0)),
      }));
    }
  }, [factory, woodOrdersRaw, metalOrdersRaw]);

  // Daily Shift Logs state from database
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingLogs, setSavingLogs] = useState(false);
  const [localGrid, setLocalGrid] = useState<Record<string, Partial<StageLog>>>({});

  // Fetch stage logs for the chosen date
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const endpoint = `/api/${factory}/logs?logDate=${selectedDate}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        // Build initial local input values mapping orderNo
        const grid: Record<string, Partial<StageLog>> = {};
        data.forEach((log: StageLog) => {
          if (log.stageName === selectedStage) {
            grid[log.orderNo] = log;
          }
        });
        setLocalGrid(grid);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
  }, [factory, selectedDate, selectedStage, orders]);

  // Keep track of edited inputs
  const handleInputChange = (orderNo: string, field: keyof StageLog, value: string) => {
    setLocalGrid((prev) => {
      const existing = prev[orderNo] || {
        orderNo,
        stageName: selectedStage,
        logDate: selectedDate,
        inputQty: "0",
        outputQty: "0",
        wasteQty: "0",
        operator: "",
        notes: "",
      };
      return {
        ...prev,
        [orderNo]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  // Submit log row to backend API
  const saveLog = async (orderNo: string, orderId: string) => {
    setSavingLogs(true);
    try {
      const payload = {
        ...(factory === "wood" ? { woodenOrderId: orderId } : { metalOrderId: orderId }),
        orderNo,
        logDate: selectedDate,
        stageName: selectedStage,
        inputQty: localGrid[orderNo]?.inputQty || "0",
        outputQty: localGrid[orderNo]?.outputQty || "0",
        wasteQty: localGrid[orderNo]?.wasteQty || "0",
        operator: localGrid[orderNo]?.operator || null,
        notes: localGrid[orderNo]?.notes || null,
      };

      const response = await fetch(`/api/${factory}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: locale === "ar" ? "تم الحفظ بنجاح" : "Log Saved Successfully",
          description: `${orderNo} · ${selectedStage}`,
        });
        void fetchLogs();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: locale === "ar" ? "فشل الحفظ" : "Save Failed",
        variant: "destructive",
      });
    } finally {
      setSavingLogs(false);
    }
  };

  // Exporters trigger
  const handleExport = async (format: "html" | "xls" | "print" | "pdf") => {
    const activeTasks: DailySheetRow[] = orders.map((o: FlatOrder) => ({
      order_id: `${o.orderNo} · ${selectedStage}`,
      project: o.client,
      product: o.product,
      target_qty: o.targetQty,
    }));

    const params = {
      factory_id: factory === "wood" ? "WF-001" : "MF-001",
      factory_name: factory === "wood" ? "مصنع الأخشاب" : "مصنع المعادن",
      department_id: selectedStage,
      department_name: selectedStage,
      rows: activeTasks,
      date: selectedDate,
    };

    if (format === "html") downloadDailySheetHtml(params);
    if (format === "xls") downloadDailySheetXls(params);
    if (format === "print") openDailySheetPrint(params);
    if (format === "pdf") {
      try {
        await downloadDailySheetPdf(params);
      } catch (err) {
        toast({
          title: locale === "ar" ? "فشل تصدير PDF" : "PDF Export Failed",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: locale === "ar" ? "تم التصدير بنجاح" : "Export Completed",
      description: `${selectedStage} · ${activeTasks.length} tasks`,
    });
  };

  const isLoading = (factory === "wood" ? loadingWood : loadingMetal) || loadingLogs;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Controls Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-white border border-sand/40 shadow-sm">
        
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {locale === "ar" ? "تاريخ التقرير اليومي" : "Daily Report Date"}
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-sand/40 focus:border-accent text-sm"
          />
        </div>

        {/* Stage selection dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {locale === "ar" ? "المرحلة / القسم الإنتاجي" : "Production Stage / Dept"}
          </label>
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-sand/40 bg-white text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none appearance-none"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prominent Export Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {locale === "ar" ? "تصدير وطباعة المسيرات الورقية" : "Print & Export Travelers"}
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("xls")}
              className="flex-1 text-emerald-600 border-emerald-500/20 hover:bg-emerald-50 text-xs font-bold rounded-xl"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("print")}
              className="flex-1 text-bronze border-bronze/20 hover:bg-bronze/5 text-xs font-bold rounded-xl"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              {locale === "ar" ? "طباعة" : "Print"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="flex-1 text-accent border-accent/20 hover:bg-accent/5 text-xs font-bold rounded-xl"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              PDF
            </Button>
          </div>
        </div>

      </div>

      {/* Main Shift logs Interactive Grid */}
      <div className="rounded-2xl border border-sand/30 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand/10 border-b border-sand/30 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-4 w-12 text-center">#</th>
                <th className="px-4 py-4">{locale === "ar" ? "رقم الأمر / العميل" : "Order / Client"}</th>
                <th className="px-4 py-4">{locale === "ar" ? "المنتج" : "Product"}</th>
                <th className="px-4 py-4 text-center w-20">{locale === "ar" ? "المطلوب" : "Target"}</th>
                <th className="px-4 py-4 text-center w-24">{locale === "ar" ? "الوارد" : "Input Qty"}</th>
                <th className="px-4 py-4 text-center w-24">{locale === "ar" ? "المنفذ" : "Output Qty"}</th>
                <th className="px-4 py-4 text-center w-24">{locale === "ar" ? "الهالك" : "Waste Qty"}</th>
                <th className="px-4 py-4 w-32">{locale === "ar" ? "اسم الفني" : "Operator"}</th>
                <th className="px-4 py-4">{locale === "ar" ? "الملاحظات" : "Notes"}</th>
                <th className="px-4 py-4 w-20 text-center">{locale === "ar" ? "العمليات" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/20 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-bronze" />
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {locale === "ar" ? "جاري تحميل سجلات الوردية..." : "Loading shift records..."}
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted-foreground text-xs">
                    {locale === "ar" ? "لا توجد أوامر تشغيل نشطة لعرضها" : "No active work orders found"}
                  </td>
                </tr>
              ) : (
                orders.map((order: FlatOrder, idx: number) => {
                  const localRow = localGrid[order.orderNo] || {};
                  return (
                    <tr key={order.id} className="hover:bg-sand/5 transition-colors duration-150">
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground text-xs sm:text-sm">{order.orderNo}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{order.client}</div>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate font-medium text-muted-foreground">
                        {order.product}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-xs text-bronze">
                        {order.targetQty}
                      </td>
                      {/* Input Qty */}
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={localRow.inputQty || ""}
                          placeholder="0"
                          min={0}
                          onChange={(e) => handleInputChange(order.orderNo, "inputQty", e.target.value)}
                          className="h-8 text-center text-xs rounded-lg border-sand/40 focus:border-bronze"
                        />
                      </td>
                      {/* Output Qty */}
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={localRow.outputQty || ""}
                          placeholder="0"
                          min={0}
                          onChange={(e) => handleInputChange(order.orderNo, "outputQty", e.target.value)}
                          className="h-8 text-center text-xs rounded-lg border-sand/40 focus:border-bronze"
                        />
                      </td>
                      {/* Waste Qty */}
                      <td className="px-2 py-2">
                        <Input
                          type="number"
                          value={localRow.wasteQty || ""}
                          placeholder="0"
                          min={0}
                          onChange={(e) => handleInputChange(order.orderNo, "wasteQty", e.target.value)}
                          className="h-8 text-center text-xs rounded-lg border-sand/40 focus:border-bronze"
                        />
                      </td>
                      {/* Operator Name */}
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          value={localRow.operator || ""}
                          placeholder={locale === "ar" ? "اسم الفني" : "Technician"}
                          onChange={(e) => handleInputChange(order.orderNo, "operator", e.target.value)}
                          className="h-8 text-xs rounded-lg border-sand/40 focus:border-bronze"
                        />
                      </td>
                      {/* Notes */}
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          value={localRow.notes || ""}
                          placeholder={locale === "ar" ? "ملاحظات..." : "Notes..."}
                          onChange={(e) => handleInputChange(order.orderNo, "notes", e.target.value)}
                          className="h-8 text-xs rounded-lg border-sand/40 focus:border-bronze"
                        />
                      </td>
                      {/* Save Button */}
                      <td className="px-4 py-2 text-center">
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => saveLog(order.orderNo, order.id)}
                          disabled={savingLogs}
                          className="h-7 px-3 bg-bronze hover:bg-bronze/90 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          {locale === "ar" ? "حفظ" : "Save"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info banner / explanation */}
      <div className="p-6 rounded-2xl border border-dashed border-sand/40 bg-sand/5">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardCheck className="w-5 h-5 text-bronze" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {locale === "ar" ? "دليل تسجيل الوردية وإدارة ترحيل الإنتاج" : "Shift Logging & Production Handoff Playbook"}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-muted-foreground font-medium">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{locale === "ar" ? "١. الترحيل الفوري للمخزون" : "1. Real-time Count Tracking"}</h4>
            <p>{locale === "ar" ? "يقوم مشرف الوردية بإدخال الكمية المستلمة، السليمة، والهالك لكل أمر تشغيل مباشرة بعد انقضاء الوردية لتجنب تراكم الفوارق." : "Record exact input, completed outputs, and scrap units at shift completion to ensure full sequence transparency."}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{locale === "ar" ? "٢. ربط المشغلين والكفاءة" : "2. Technician Assignments"}</h4>
            <p>{locale === "ar" ? "تحديد اسم الفني يتيح للنظام قياس معدلات الإنتاجية الفردية ورصد مكامن الخلل والأداء وتكلفة تشغيل كل خط انتاجي." : "Associate shop floor operators to unlock fine-grained capacity & scrap analytics."}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{locale === "ar" ? "٣. المزامنة السحابية وقاعدة Turso" : "3. Cloud Syncing"}</h4>
            <p>{locale === "ar" ? "تُحفظ كافة السجلات بنظام الحماية ضد التعارض مباشرة في قاعدة بيانات Turso السحابية وتبقى متوفرة محلياً عند انقطاع الاتصال." : "Transactions instantly sync to the cloud database and reconcile automatically when returning online, preserving floor continuity."}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
