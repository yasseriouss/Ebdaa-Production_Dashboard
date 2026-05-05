import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useImportMetalOrders,
  useImportMetalDailyProduction,
  useImportWoodenOrders,
} from "@workspace/api-client-react";
import { Upload, Download, FileText, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
        <Button className="w-full" variant="ghost" disabled={busy} onClick={() => doExport("pdf")} data-testid={`btn-export-pdf-${filename}`}>
          <FileText className="ml-2 h-4 w-4" />
          تصدير تقرير
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ImportExport() {
  const { toast } = useToast();
  const [metalRes, setMetalRes] = useState<ImportResult | null>(null);
  const [dailyRes, setDailyRes] = useState<ImportResult | null>(null);
  const [woodenRes, setWoodenRes] = useState<ImportResult | null>(null);

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
    const fd = new FormData();
    fd.append("file", file);
    const body = { data: fd as unknown as { file: Blob } };
    if (type === "metal") metalMut.mutate(body);
    else if (type === "daily") dailyMut.mutate(body);
    else woodenMut.mutate(body);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الاستيراد والتصدير</h1>
        <p className="text-muted-foreground mt-1">رفع ملفات Excel واستيراد البيانات، أو تصدير التقارير</p>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          استيراد البيانات
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ImportCard title="أوامر المصنع المعدني" description="ملف Excel يحتوي على ورقة MO بأوامر الشغل المعدنية" testId="metal-orders" onImport={f => handle("metal", f)} isPending={metalMut.isPending} result={metalRes} />
          <ImportCard title="الإنتاج اليومي المعدني" description="ملف Excel يحتوي على 17 ورقة لكل مرحلة إنتاج" testId="metal-daily" onImport={f => handle("daily", f)} isPending={dailyMut.isPending} result={dailyRes} />
          <ImportCard title="أوامر المصنع الخشبي" description="ملف Excel لأوامر الشغل الخشبية مع بيانات العملاء" testId="wooden-orders" onImport={f => handle("wooden", f)} isPending={woodenMut.isPending} result={woodenRes} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          تصدير البيانات
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <ExportCard title="تصدير المصنع المعدني" endpoint="/export/metal-orders" filename="metal-orders" />
          <ExportCard title="تصدير المصنع الخشبي" endpoint="/export/wooden-orders" filename="wooden-orders" />
        </div>
      </section>
    </div>
  );
}
