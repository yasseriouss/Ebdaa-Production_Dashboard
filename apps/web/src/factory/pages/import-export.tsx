import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@factory/components/ui/card";
import { Button } from "@factory/components/ui/button";
import { Badge } from "@factory/components/ui/badge";
import {
  useImportMetalOrders,
  useImportMetalDailyProduction,
  useImportWoodenOrders,
  useImportSheetsTemplate,
} from "@workspace/api-client-react";
import { Upload, Download, FileText, CheckCircle2, XCircle, FileSpreadsheet, AlertTriangle } from "lucide-react";
import { useToast } from "@factory/hooks/use-toast";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

type ImportResult = { success: boolean; rowsImported: number; rowsSkipped: number; errors: string[] };

function ImportCard({
  title,
  description,
  testId,
  onImport,
  isPending,
  result,
}: {
  title: string;
  description: string;
  testId: string;
  onImport: (file: File) => void;
  isPending: boolean;
  result: ImportResult | null;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <input
          ref={ref}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          data-testid={`file-${testId}`}
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) { onImport(f); e.target.value = ""; }
          }}
        />
        <Button
          className="w-full"
          variant="outline"
          disabled={isPending}
          data-testid={`btn-import-${testId}`}
          onClick={() => ref.current?.click()}
        >
          {isPending ? "جاري الاستيراد..." : "اختر ملف Excel للاستيراد"}
        </Button>
        {result && (
          <div className={`rounded-lg p-3 text-sm space-y-2 ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"}`}>
            <div className="flex items-center gap-2 font-semibold">
              {result.success
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : <XCircle className="h-4 w-4 text-destructive" />}
              {result.success ? "اكتمل الاستيراد" : "فشل الاستيراد"}
            </div>
            <div className="flex gap-3 text-xs">
              <span>مستورد: <Badge variant="secondary">{result.rowsImported}</Badge></span>
              <span>متخطى: <Badge variant="outline">{result.rowsSkipped}</Badge></span>
            </div>
            {result.errors.length > 0 && (
              <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                {result.errors.slice(0, 5).map((e, i) => <div key={i} className="truncate">{e}</div>)}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExportCard({ title, endpoint, filename }: { title: string; endpoint: string; filename: string }) {
  const [busy, setBusy] = useState(false);
  const doExport = async (format: "xlsx" | "pdf") => {
    setBusy(true);
    try {
      const r = await fetch(`${BASE}${endpoint}?format=${format}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format === "xlsx" ? "xlsx" : "pdf"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">تصدير جميع البيانات إلى ملف</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" variant="outline" disabled={busy} onClick={() => doExport("xlsx")} data-testid={`btn-export-xlsx-${filename}`}>
          <FileText className="ml-2 h-4 w-4" />
          تصدير Excel (.xlsx)
        </Button>
        <Button className="w-full" variant="outline" disabled={busy} onClick={() => doExport("pdf")} data-testid={`btn-export-pdf-${filename}`}>
          <FileText className="ml-2 h-4 w-4" />
          تصدير PDF (.pdf)
        </Button>
      </CardContent>
    </Card>
  );
}

type SectionResult = { sheetFound: boolean; rowsImported: number; rowsSkipped: number; duplicates: string[]; errors?: string[] };
type StageLogSectionResult = { sheetFound: boolean; rowsImported: number; rowsSkipped: number; errors?: string[] };
type TemplateResult = { success: boolean; metal: SectionResult; wooden: SectionResult; stageLog: StageLogSectionResult; errors?: string[] };

function TemplateResultPanel({ res }: { res: TemplateResult }) {
  const renderSection = (label: string, s: SectionResult) => (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{label}</span>
        {s.sheetFound
          ? <Badge variant="secondary">{s.rowsImported} مستورد</Badge>
          : <Badge variant="outline" className="text-destructive">الورقة غير موجودة</Badge>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span>متخطى: <Badge variant="outline">{s.rowsSkipped}</Badge></span>
        <span>مكرر: <Badge variant="outline">{s.duplicates.length}</Badge></span>
      </div>
      {s.duplicates.length > 0 && (
        <div className="text-xs">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <AlertTriangle className="h-3 w-3" /> أرقام مكررة (تم تخطيها للمراجعة):
          </div>
          <div className="max-h-20 overflow-y-auto font-mono text-[11px] text-muted-foreground">
            {s.duplicates.slice(0, 20).join("، ")}
            {s.duplicates.length > 20 && ` … (+${s.duplicates.length - 20})`}
          </div>
        </div>
      )}
      {s.errors && s.errors.length > 0 && (
        <div className="text-[11px] text-destructive max-h-16 overflow-y-auto">
          {s.errors.slice(0, 3).map((e, i) => <div key={i} className="truncate">{e}</div>)}
        </div>
      )}
    </div>
  );
  return (
    <div className={`rounded-lg p-3 text-sm space-y-3 ${res.success ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"}`}>
      <div className="flex items-center gap-2 font-semibold">
        {res.success
          ? <CheckCircle2 className="h-4 w-4 text-green-500" />
          : <XCircle className="h-4 w-4 text-destructive" />}
        {res.success ? "اكتمل استيراد القالب" : "فشل استيراد القالب"}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {renderSection("معدني (أوامر معدني)", res.metal)}
        {renderSection("خشبي (أوامر خشبي)", res.wooden)}
        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">سجل المراحل (متابعة المراحل)</span>
            {res.stageLog.sheetFound
              ? <Badge variant="secondary">{res.stageLog.rowsImported} مستورد</Badge>
              : <Badge variant="outline" className="text-destructive">الورقة غير موجودة</Badge>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span>متخطى: <Badge variant="outline">{res.stageLog.rowsSkipped}</Badge></span>
          </div>
          {res.stageLog.errors && res.stageLog.errors.length > 0 && (
            <div className="text-[11px] text-destructive max-h-16 overflow-y-auto">
              {res.stageLog.errors.slice(0, 3).map((e, i) => <div key={i} className="truncate">{e}</div>)}
            </div>
          )}
        </div>
      </div>
      {res.errors && res.errors.length > 0 && (
        <div className="text-xs text-destructive">
          {res.errors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
    </div>
  );
}

export default function ImportExport() {
  const { ft } = useFactoryTranslation();
  const { toast } = useToast();
  const [metalRes, setMetalRes] = useState<ImportResult | null>(null);
  const [dailyRes, setDailyRes] = useState<ImportResult | null>(null);
  const [woodenRes, setWoodenRes] = useState<ImportResult | null>(null);
  const [templateRes, setTemplateRes] = useState<TemplateResult | null>(null);
  const templateRef = useRef<HTMLInputElement>(null);

  const templateMut = useImportSheetsTemplate({
    mutation: {
      onSuccess: d => {
        const r = d as TemplateResult;
        setTemplateRes(r);
        const total = r.metal.rowsImported + r.wooden.rowsImported + r.stageLog.rowsImported;
        const dups = r.metal.duplicates.length + r.wooden.duplicates.length;
        toast({
          title: r.success ? "تم استيراد قالب الشيتس" : "فشل استيراد القالب",
          description: `${total} صف مستورد (شامل سجل المراحل)، ${dups} مكرر`,
          variant: r.success ? "default" : "destructive",
        });
      },
      onError: () => toast({ title: "فشل استيراد القالب", variant: "destructive" }),
    },
  });

  const metalMut = useImportMetalOrders({
    mutation: {
      onSuccess: d => { setMetalRes(d as ImportResult); toast({ title: "تم استيراد الأوامر المعدنية" }); },
      onError: () => toast({ title: "فشل الاستيراد", variant: "destructive" }),
    },
  });
  const dailyMut = useImportMetalDailyProduction({
    mutation: {
      onSuccess: d => { setDailyRes(d as ImportResult); toast({ title: "تم استيراد الإنتاج اليومي" }); },
      onError: () => toast({ title: "فشل الاستيراد", variant: "destructive" }),
    },
  });
  const woodenMut = useImportWoodenOrders({
    mutation: {
      onSuccess: d => { setWoodenRes(d as ImportResult); toast({ title: "تم استيراد الأوامر الخشبية" }); },
      onError: () => toast({ title: "فشل الاستيراد", variant: "destructive" }),
    },
  });

  const handle = (type: "metal" | "daily" | "wooden", file: File) => {
    const data = { file: file as Blob };
    if (type === "metal") metalMut.mutate({ data });
    else if (type === "daily") dailyMut.mutate({ data });
    else woodenMut.mutate({ data });
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{ft("importExport.title")}</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">{ft("importExport.subtitle")}</p>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          {ft("importExport.importSection")}
        </h2>

        <Card className="mb-4 border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              {ft("importExport.templateTitle")}
            </CardTitle>
            <CardDescription className="text-xs">{ft("importExport.templateDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={templateRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              data-testid="file-sheets-template"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) { templateMut.mutate({ data: { file: f as Blob } }); e.target.value = ""; }
              }}
            />
            <Button
              className="w-full"
              disabled={templateMut.isPending}
              data-testid="btn-import-sheets-template"
              onClick={() => templateRef.current?.click()}
            >
              <Upload className="ml-2 h-4 w-4" />
              {templateMut.isPending ? ft("importExport.importing") : ft("importExport.chooseTemplate")}
            </Button>
            {templateRes && <TemplateResultPanel res={templateRes} />}
          </CardContent>
        </Card>

        <h3 className="text-sm font-semibold text-muted-foreground mb-3">{ft("importExport.advancedImport")}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <ImportCard title={ft("importExport.metalOrders")} description={ft("importExport.metalOrders")} testId="metal-orders" onImport={f => handle("metal", f)} isPending={metalMut.isPending} result={metalRes} />
          <ImportCard title={ft("importExport.metalDaily")} description={ft("importExport.metalDaily")} testId="metal-daily" onImport={f => handle("daily", f)} isPending={dailyMut.isPending} result={dailyRes} />
          <ImportCard title={ft("importExport.woodenOrders")} description={ft("importExport.woodenOrders")} testId="wooden-orders" onImport={f => handle("wooden", f)} isPending={woodenMut.isPending} result={woodenRes} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          {ft("importExport.exportSection")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ExportCard title={ft("importExport.exportMetal")} endpoint="/export/metal-orders" filename="metal-orders" />
          <ExportCard title={ft("importExport.exportWooden")} endpoint="/export/wooden-orders" filename="wooden-orders" />
        </div>
      </section>
    </div>
  );
}
