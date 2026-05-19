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
import {
  Upload, Download, FileText, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { useToast } from "@factory/hooks/use-toast";
import { useFactoryTranslation } from "../../lib/useFactoryTranslation";
import { downloadPdfFromApiExport } from "../../lib/pdf/apiExport";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

type ImportResult = {
  success: boolean;
  rowsImported: number;
  rowsSkipped: number;
  errors: string[];
};

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
  const { ft } = useFactoryTranslation();
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
          {isPending ? ft("importExport.importing") : ft("importExport.chooseExcel")}
        </Button>
        {result && (
          <div className={`rounded-lg p-3 text-sm space-y-2 ${result.success ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"}`}>
            <div className="flex items-center gap-2 font-semibold">
              {result.success
                ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                : <XCircle className="h-4 w-4 text-destructive" />}
              {result.success ? ft("importExport.importDone") : ft("importExport.importFailed")}
            </div>
            <div className="flex gap-3 text-xs">
              <span>{ft("importExport.imported")}: <Badge variant="secondary">{result.rowsImported}</Badge></span>
              <span>{ft("importExport.skipped")}: <Badge variant="outline">{result.rowsSkipped}</Badge></span>
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
  const { ft } = useFactoryTranslation();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const doExportXlsx = async () => {
    setBusy(true);
    try {
      const r = await fetch(`${BASE}${endpoint}?format=xlsx`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  const doExportPdf = async () => {
    setPdfBusy(true);
    try {
      await downloadPdfFromApiExport({
        endpoint,
        title,
        filename,
      });
      toast({ title: ft("orders.toastPdfExported") });
    } catch {
      toast({ title: ft("orders.toastPdfFailed"), variant: "destructive" });
    } finally {
      setPdfBusy(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Download className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
        <CardDescription className="text-xs">{ft("importExport.exportAll")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full" variant="outline" disabled={busy} onClick={() => void doExportXlsx()} data-testid={`btn-export-xlsx-${filename}`}>
          <FileText className="ml-2 h-4 w-4" />
          {ft("importExport.exportExcel")}
        </Button>
        <Button className="w-full" variant="outline" disabled={pdfBusy} onClick={() => void doExportPdf()} data-testid={`btn-export-pdf-${filename}`}>
          <FileText className="ml-2 h-4 w-4" />
          {ft("importExport.exportPdf")}
        </Button>
      </CardContent>
    </Card>
  );
}

type SectionResult = { sheetFound: boolean; rowsImported: number; rowsSkipped: number; duplicates: string[]; errors?: string[] };
type StageLogSectionResult = { sheetFound: boolean; rowsImported: number; rowsSkipped: number; errors?: string[] };
type TemplateResult = { success: boolean; metal: SectionResult; wooden: SectionResult; stageLog: StageLogSectionResult; errors?: string[] };

function TemplateResultPanel({ res }: { res: TemplateResult }) {
  const { ft } = useFactoryTranslation();
  const renderSection = (label: string, s: SectionResult) => (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{label}</span>
        {s.sheetFound
          ? <Badge variant="secondary">{s.rowsImported} {ft("importExport.imported")}</Badge>
          : <Badge variant="outline" className="text-destructive">{ft("importExport.sheetNotFound")}</Badge>}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span>{ft("importExport.skipped")}: <Badge variant="outline">{s.rowsSkipped}</Badge></span>
        <span>{ft("importExport.duplicated")}: <Badge variant="outline">{s.duplicates.length}</Badge></span>
      </div>
      {s.duplicates.length > 0 && (
        <div className="text-xs">
          <div className="flex items-center gap-1 text-amber-600 mb-1">
            <AlertTriangle className="h-3 w-3" /> {ft("importExport.duplicateAlert")}
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
        {res.success ? ft("importExport.templateImportDone") : ft("importExport.templateImportFailed")}
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {renderSection(ft("importExport.templateMetal"), res.metal)}
        {renderSection(ft("importExport.templateWooden"), res.wooden)}
        <div className="rounded-md border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{ft("importExport.templateStageLog")}</span>
            {res.stageLog.sheetFound
              ? <Badge variant="secondary">{res.stageLog.rowsImported} {ft("importExport.imported")}</Badge>
              : <Badge variant="outline" className="text-destructive">{ft("importExport.sheetNotFound")}</Badge>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span>{ft("importExport.skipped")}: <Badge variant="outline">{res.stageLog.rowsSkipped}</Badge></span>
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
          title: r.success ? ft("importExport.templateImportDone") : ft("importExport.templateImportFailed"),
          description: ft("importExport.importDoneDesc", { total: String(total), dups: String(dups) }),
          variant: r.success ? "default" : "destructive",
        });
      },
      onError: () => toast({ title: ft("importExport.templateImportFailed"), variant: "destructive" }),
    },
  });

  const metalMut = useImportMetalOrders({
    mutation: {
      onSuccess: d => { setMetalRes(d as ImportResult); toast({ title: ft("orders.toastUpdated") }); },
      onError: () => toast({ title: ft("importExport.importFailed"), variant: "destructive" }),
    },
  });
  const dailyMut = useImportMetalDailyProduction({
    mutation: {
      onSuccess: d => { setDailyRes(d as ImportResult); toast({ title: ft("orders.toastUpdated") }); },
      onError: () => toast({ title: ft("importExport.importFailed"), variant: "destructive" }),
    },
  });
  const woodenMut = useImportWoodenOrders({
    mutation: {
      onSuccess: d => { setWoodenRes(d as ImportResult); toast({ title: ft("orders.toastUpdated") }); },
      onError: () => toast({ title: ft("importExport.importFailed"), variant: "destructive" }),
    },
  });

  const handle = (type: "metal" | "daily" | "wooden", file: File) => {
    const data = { file: file as Blob };
    if (type === "metal") metalMut.mutate({ data });
    else if (type === "daily") dailyMut.mutate({ data });
    else woodenMut.mutate({ data });
  };

  return (
    <div className="p-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">{ft("importExport.title")}</h1>
        <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
          {ft("importExport.subtitle")}
        </p>
      </header>

      {/* Template Import */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{ft("importExport.templateTitle")}</h2>
        </div>
        <Card className="border-primary/20 bg-primary/[0.02]">
          <CardHeader>
            <CardDescription>{ft("importExport.templateDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={templateRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) {
                  templateMut.mutate({ data: { file: f as Blob } });
                  e.target.value = "";
                }
              }}
            />
            <Button
              className="w-full h-12 text-lg"
              disabled={templateMut.isPending}
              onClick={() => templateRef.current?.click()}
            >
              <FileText className="ml-2 h-5 w-5" />
              {templateMut.isPending ? ft("importExport.importing") : ft("importExport.chooseTemplate")}
            </Button>

            {templateRes && <TemplateResultPanel res={templateRes} />}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold">{ft("importExport.importSection")}</h2>
        <p className="text-sm text-muted-foreground">{ft("importExport.advancedImport")}</p>
        <div className="grid gap-6 md:grid-cols-3">
          <ImportCard
            title={ft("importExport.metalOrders")}
            description="Metal_orders_*.xlsx"
            testId="metal"
            onImport={f => handle("metal", f)}
            isPending={metalMut.isPending}
            result={metalRes}
          />
          <ImportCard
            title={ft("importExport.metalDaily")}
            description="Metal_daily_Production_*.xlsx"
            testId="daily"
            onImport={f => handle("daily", f)}
            isPending={dailyMut.isPending}
            result={dailyRes}
          />
          <ImportCard
            title={ft("importExport.woodenOrders")}
            description="wooden_orders_*.xlsx"
            testId="wooden"
            onImport={f => handle("wooden", f)}
            isPending={woodenMut.isPending}
            result={woodenRes}
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold">{ft("importExport.exportSection")}</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ExportCard title={ft("importExport.exportMetal")} endpoint="/export/metal-orders" filename="metal-orders" />
          <ExportCard title={ft("importExport.exportWooden")} endpoint="/export/wooden-orders" filename="wooden-orders" />
        </div>
      </section>
    </div>
  );
}
