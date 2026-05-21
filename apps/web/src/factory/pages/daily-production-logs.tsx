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
  const { ft } = useFactoryTranslation();
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
      const endpoint = `/api/${factory === "wood" ? "wooden" : "metal"}/logs?logDate=${selectedDate}`;
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

      const response = await fetch(`/api/${factory === "wood" ? "wooden" : "metal"}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: ft("dailyLogs.logSavedSuccessfully"),
          description: `${orderNo} · ${selectedStage}`,
        });
        void fetchLogs();
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: ft("dailyLogs.saveFailed"),
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
          title: ft("dailyLogs.pdfExportFailed"),
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: ft("dailyLogs.exportCompleted"),
      description: `${selectedStage} · ${activeTasks.length} tasks`,
    });
  };

  const isLoading = (factory === "wood" ? loadingWood : loadingMetal) || loadingLogs;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Controls Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-none bg-card border border-border/80 shadow-lg">
        
        {/* Date Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {ft("dailyLogs.dailyReportDate")}
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-background/50 border-border focus:border-primary text-sm rounded-none"
          />
        </div>

        {/* Stage selection dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {ft("dailyLogs.productionStageDept")}
          </label>
          <div className="relative">
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full h-10 px-3 rounded-none border border-border bg-background/50 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none"
            >
              {stages.map((stage) => (
                <option key={stage} value={stage} className="bg-card text-foreground">
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prominent Export Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            {ft("dailyLogs.printExportTravelers")}
          </label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("xls")}
              className="flex-1 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10 text-xs font-bold rounded-none"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("print")}
              className="flex-1 text-amber-500 border-amber-500/20 hover:bg-amber-500/10 text-xs font-bold rounded-none"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              {ft("dailyLogs.print")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              className="flex-1 text-primary border-primary/20 hover:bg-primary/10 text-xs font-bold rounded-none"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              PDF
            </Button>
          </div>
        </div>

      </div>

      {/* Main Shift logs Interactive Grid */}
      <div className="rounded-none border border-border bg-card shadow-xl overflow-hidden">
        
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-4 w-12 text-center">#</th>
                <th className="px-4 py-4 text-start">{ft("dailyLogs.orderClient")}</th>
                <th className="px-4 py-4 text-start">{ft("dailyLogs.product")}</th>
                <th className="px-4 py-4 text-center w-20">{ft("dailyLogs.target")}</th>
                <th className="px-4 py-4 text-center w-24">{ft("dailyLogs.inputQty")}</th>
                <th className="px-4 py-4 text-center w-24">{ft("dailyLogs.outputQty")}</th>
                <th className="px-4 py-4 text-center w-24">{ft("dailyLogs.wasteQty")}</th>
                <th className="px-4 py-4 text-start w-32">{ft("dailyLogs.operator")}</th>
                <th className="px-4 py-4 text-start">{ft("dailyLogs.notes")}</th>
                <th className="px-4 py-4 w-20 text-center">{ft("dailyLogs.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {ft("dailyLogs.loadingShiftRecords")}
                    </span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-16 text-center text-muted-foreground text-xs">
                    {ft("dailyLogs.noActiveWorkOrders")}
                  </td>
                </tr>
              ) : (
                orders.map((order: FlatOrder, idx: number) => {
                  const localRow = localGrid[order.orderNo] || {};
                  return (
                    <tr key={order.id} className="hover:bg-muted/10 transition-colors duration-150">
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground font-mono">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-foreground text-xs sm:text-sm">{order.orderNo}</div>
                        <div className="text-[10px] text-muted-foreground font-medium">{order.client}</div>
                      </td>
                      <td className="px-4 py-3 text-xs max-w-xs truncate font-medium text-muted-foreground">
                        {order.product}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-xs text-primary font-mono">
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
                          className="h-8 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
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
                          className="h-8 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
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
                          className="h-8 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
                        />
                      </td>
                      {/* Operator Name */}
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          value={localRow.operator || ""}
                          placeholder={ft("dailyLogs.operator")}
                          onChange={(e) => handleInputChange(order.orderNo, "operator", e.target.value)}
                          className="h-8 text-xs rounded-none border-border bg-background focus:border-primary"
                        />
                      </td>
                      {/* Notes */}
                      <td className="px-2 py-2">
                        <Input
                          type="text"
                          value={localRow.notes || ""}
                          placeholder={ft("dailyLogs.notes")}
                          onChange={(e) => handleInputChange(order.orderNo, "notes", e.target.value)}
                          className="h-8 text-xs rounded-none border-border bg-background focus:border-primary"
                        />
                      </td>
                      {/* Save Button */}
                      <td className="px-4 py-2 text-center">
                        <Button
                          size="sm"
                          type="button"
                          onClick={() => saveLog(order.orderNo, order.id)}
                          disabled={savingLogs}
                          className="h-7 px-3 bg-primary hover:bg-primary/95 text-primary-foreground rounded-none text-xs font-bold transition-all"
                        >
                          {ft("dailyLogs.save")}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="block md:hidden divide-y divide-border bg-card">
          {isLoading ? (
            <div className="px-4 py-16 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <span className="text-xs text-muted-foreground mt-2 block">
                {ft("dailyLogs.loadingShiftRecords")}
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-16 text-center text-muted-foreground text-xs">
              {ft("dailyLogs.noActiveWorkOrders")}
            </div>
          ) : (
            orders.map((order: FlatOrder, idx: number) => {
              const localRow = localGrid[order.orderNo] || {};
              return (
                <div key={order.id} className="p-4 space-y-4 hover:bg-muted/5 transition-colors duration-150">
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-muted-foreground font-mono">#{idx + 1}</span>
                      <h4 className="font-bold text-foreground text-sm">{order.orderNo}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">{order.client}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        {ft("dailyLogs.target")}
                      </span>
                      <span className="font-bold text-sm text-primary font-mono">{order.targetQty}</span>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="text-xs text-muted-foreground font-medium bg-muted/20 p-2 rounded-none border border-border">
                    <span className="font-bold text-foreground block mb-0.5">{ft("dailyLogs.product")}:</span>
                    {order.product}
                  </div>

                  {/* Quantity Inputs */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground block">
                        {ft("dailyLogs.inputQty")}
                      </label>
                      <Input
                        type="number"
                        value={localRow.inputQty || ""}
                        placeholder="0"
                        min={0}
                        onChange={(e) => handleInputChange(order.orderNo, "inputQty", e.target.value)}
                        className="h-9 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground block">
                        {ft("dailyLogs.outputQty")}
                      </label>
                      <Input
                        type="number"
                        value={localRow.outputQty || ""}
                        placeholder="0"
                        min={0}
                        onChange={(e) => handleInputChange(order.orderNo, "outputQty", e.target.value)}
                        className="h-9 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground block">
                        {ft("dailyLogs.wasteQty")}
                      </label>
                      <Input
                        type="number"
                        value={localRow.wasteQty || ""}
                        placeholder="0"
                        min={0}
                        onChange={(e) => handleInputChange(order.orderNo, "wasteQty", e.target.value)}
                        className="h-9 text-center text-xs rounded-none border-border bg-background focus:border-primary font-mono"
                      />
                    </div>
                  </div>

                  {/* Operator & Notes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground block">
                        {ft("dailyLogs.operator")}
                      </label>
                      <Input
                        type="text"
                        value={localRow.operator || ""}
                        placeholder={ft("dailyLogs.operator")}
                        onChange={(e) => handleInputChange(order.orderNo, "operator", e.target.value)}
                        className="h-9 text-xs rounded-none border-border bg-background focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground block">
                        {ft("dailyLogs.notes")}
                      </label>
                      <Input
                        type="text"
                        value={localRow.notes || ""}
                        placeholder={ft("dailyLogs.notes")}
                        onChange={(e) => handleInputChange(order.orderNo, "notes", e.target.value)}
                        className="h-9 text-xs rounded-none border-border bg-background focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Mobile Large Save Button */}
                  <div>
                    <Button
                      type="button"
                      onClick={() => saveLog(order.orderNo, order.id)}
                      disabled={savingLogs}
                      className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground rounded-none text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {ft("dailyLogs.saveShiftRecord")}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Info banner / explanation */}
      <div className="p-6 rounded-none border border-dashed border-border bg-muted/10">
        <div className="flex items-center gap-3 mb-4">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            {ft("dailyLogs.guideTitle")}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-muted-foreground font-medium">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{ft("dailyLogs.guide1Title")}</h4>
            <p>{ft("dailyLogs.guide1Desc")}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{ft("dailyLogs.guide2Title")}</h4>
            <p>{ft("dailyLogs.guide2Desc")}</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground">{ft("dailyLogs.guide3Title")}</h4>
            <p>{ft("dailyLogs.guide3Desc")}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
