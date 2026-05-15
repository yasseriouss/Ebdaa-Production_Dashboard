import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Upload,
  Eye,
  Table2,
} from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { Select, TextField } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { factoryCapacityFixture } from "../data/fixtures";
import type { FactoryId } from "../data/types";
import { uid } from "../data/projectDraft";
import { analyzeUploadedFile } from "../lib/workOrderAnalysis/parseFile";
import type { AnalysisLineItem, AnalysisPart, WorkOrderAnalysisSession } from "../lib/workOrderAnalysis/types";
import {
  useDeleteFhAnalysisSession,
  useFhAnalysisSessions,
  useUpsertFhAnalysisSession,
} from "../lib/api/hooks/useFactoryHub";
import { downloadAnalysisSessionJson, parseWorkOrderAnalysisSessionJson } from "../lib/workOrderAnalysis/sessionFile";

function nowIso() {
  return new Date().toISOString();
}

function factoryModel(factory: FactoryId) {
  return factory === "WF-001"
    ? factoryCapacityFixture.woodworking_factory
    : factoryCapacityFixture.metal_factory;
}

export default function WorkOrderAnalysis() {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);
  const [factoryHint, setFactoryHint] = useState<FactoryId>("WF-001");
  const { data: savedList = [], refetch: refetchLibrary } = useFhAnalysisSessions([]);
  const upsertSession = useUpsertFhAnalysisSession();
  const deleteSession = useDeleteFhAnalysisSession();

  const [active, setActive] = useState<WorkOrderAnalysisSession | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<"file" | "table">("file");
  const [tablePreview, setTablePreview] = useState<string[][]>([]);
  const [analysisNote, setAnalysisNote] = useState("");
  const [busy, setBusy] = useState(false);

  const importSessionFromJson = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseWorkOrderAnalysisSessionJson(text);
      const ts = nowIso();
      const next: WorkOrderAnalysisSession = {
        ...parsed,
        updatedAt: ts,
        createdAt: parsed.createdAt || ts,
      };
      await upsertSession.mutateAsync(next);
      await refetchLibrary();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setTablePreview([]);
      setPreviewTab("file");
      setActive(next);
      setAnalysisNote("مستورد من ملف JSON — أعد رفع المستند الأصلي للمعاينة إن احتجت.");
      toast.success("تم استيراد الجلسة من JSON وحفظها في المكتبة.");
    } catch (e) {
      console.error(e);
      toast.error("ملف JSON غير صالح أو لا يتوافق مع جلسة التحليل.");
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const patchSession = useCallback((fn: (s: WorkOrderAnalysisSession) => WorkOrderAnalysisSession) => {
    setActive((prev) => (prev ? fn({ ...prev, updatedAt: nowIso() }) : null));
  }, []);

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewTab("file");
      const { session, message, tablePreview: tp } = await analyzeUploadedFile(file, factoryHint);
      const ts = nowIso();
      setActive({
        ...session,
        createdAt: ts,
        updatedAt: ts,
      });
      setTablePreview(tp);
      if (tp.length) setPreviewTab("table");
      setAnalysisNote(message);
      toast.success(`تمت معالجة الملف · ${message}`);
    } catch (e) {
      console.error(e);
      toast.error("تعذّر تحليل الملف — تأكد من الصيغة أو جرّب ملفاً أصغر.");
    } finally {
      setBusy(false);
    }
  };

  const saveToLibrary = async () => {
    if (!active) return;
    try {
      await upsertSession.mutateAsync(active);
      await refetchLibrary();
      toast.success("تم الحفظ في المكتبة — يمكنك الاستيراد من «مشروع جديد».");
    } catch {
      toast.error("تعذّر الحفظ على الخادم.");
    }
  };

  const loadSession = (s: WorkOrderAnalysisSession) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setTablePreview([]);
    setPreviewTab("file");
    setActive(s);
    setAnalysisNote("جلسة محفوظة — أعد رفع الملف لمعاينة أصلية إن لزم.");
  };

  const removeSaved = async (id: string) => {
    try {
      await deleteSession.mutateAsync(id);
      await refetchLibrary();
      if (active?.id === id) {
        setActive(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      toast.success("تم الحذف");
    } catch {
      toast.error("تعذّر الحذف من الخادم.");
    }
  };

  const showFilePreview = useMemo(() => {
    if (!active || !previewUrl) return false;
    const t = active.mimeType;
    return t === "application/pdf" || /^image\//i.test(t);
  }, [active, previewUrl]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-brand-wood" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-luxury">
              <ArabicText>تحليل أوامر الشغل</ArabicText>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-metal mt-1">
              Work Order Analysis
            </p>
          </div>
        </div>
        <p className="text-sm text-brand-metal mt-1">
          <ArabicText>رفع PDF أو Excel أو صور، استخراج القطع والخامات والاكسسوارات، تعيين القسم والماكينة، ثم الاستيراد من «مشروع جديد»</ArabicText>
        </p>
      </header>

      <aside
        role="note"
        className="border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-brand-luxury leading-relaxed"
      >
        <ArabicText className="font-medium text-amber-200/90 block">
          برجاء التأكد من أن البيانات التي تم استخراجها صحيحة قبل الاعتماد عليها في التشغيل أو التوريد. يُنصح بمراجعة
          الكميات والمواصفات يدوياً مع المستند الأصلي.
        </ArabicText>
      </aside>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-3 glass-panel p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">المكتبة</h3>
          <ArabicText className="text-[10px] text-brand-metal block mb-2">
            جلسات محفوظة في هذا المتصفح — يمكن نسخ ملفات JSON إلى مجلد المشروع: Data\Projects
          </ArabicText>
          <div className="flex flex-wrap gap-2">
            <input
              ref={jsonImportRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                void importSessionFromJson(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => jsonImportRef.current?.click()}
              className="flex-1 min-w-[100px] text-[10px] border border-brand-border px-2 py-1 hover:border-brand-wood/50"
            >
              <ArabicText>استيراد JSON</ArabicText>
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={() => active && downloadAnalysisSessionJson(active)}
              className="flex-1 min-w-[100px] text-[10px] border border-brand-border px-2 py-1 hover:border-brand-wood/50 disabled:opacity-30"
            >
              <Download className="inline w-3 h-3 me-1" />
              JSON
            </button>
          </div>
          <ul className="space-y-2">
            {savedList.map((s) => (
              <li key={s.id} className="border border-brand-border p-2 bg-brand-black/40 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => loadSession(s)}
                  className="text-start text-xs font-bold text-brand-luxury hover:underline"
                >
                  {s.projectName || s.fileName}
                </button>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9px] text-brand-metal">
                    {new Date(s.updatedAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSaved(s.id)}
                    className="text-brand-metal hover:text-brand-error p-0.5"
                    aria-label="حذف"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </li>
            ))}
            {savedList.length === 0 && (
              <p className="text-[10px] text-brand-metal">لا توجد جلسات بعد.</p>
            )}
          </ul>
        </section>

        <section className="xl:col-span-9 space-y-4">
          <div className="glass-panel p-4 flex flex-wrap items-end gap-4">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv,image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <Select
              label="افتراضي المصنع للاستخراج"
              value={factoryHint}
              onChange={(e) => setFactoryHint(e.target.value as FactoryId)}
            >
              <option value="WF-001">أخشاب WF-001</option>
              <option value="MF-001">معادن MF-001</option>
            </Select>
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="industrial-btn border-brand-wood/50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{busy ? "جارٍ التحليل…" : "رفع ملف"}</span>
            </button>
            <button
              type="button"
              disabled={!active}
              onClick={saveToLibrary}
              className="industrial-btn border-brand-success/50 text-brand-success"
            >
              <Save className="w-3.5 h-3.5" />
              <ArabicText>حفظ في المكتبة</ArabicText>
            </button>
          </div>

          {analysisNote && (
            <p className="text-[11px] text-brand-metal border-s-2 border-brand-wood/50 ps-3">{analysisNote}</p>
          )}

          {!active && (
            <div className="glass-panel p-12 text-center text-brand-metal text-sm">
              <ArabicText>ارفع مستند أمر شغل لبدء الاستخراج والتعديل.</ArabicText>
            </div>
          )}

          {active && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="glass-panel p-4 min-h-[280px] flex flex-col">
                  <div className="flex items-center gap-2 mb-3 border-b border-brand-border pb-2">
                    <Eye className="w-4 h-4 text-brand-wood" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">المعاينة</span>
                    {tablePreview.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreviewTab("file")}
                          className={`text-[9px] px-2 py-0.5 border ${previewTab === "file" ? "border-brand-luxury" : "border-brand-border"}`}
                        >
                          <FileText className="inline w-3 h-3 me-1" />
                          ملف
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab("table")}
                          className={`text-[9px] px-2 py-0.5 border ${previewTab === "table" ? "border-brand-luxury" : "border-brand-border"}`}
                        >
                          <Table2 className="inline w-3 h-3 me-1" />
                          جدول
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto rounded border border-brand-border bg-black/40 min-h-[200px]">
                    {previewTab === "table" && tablePreview.length > 0 ? (
                      <table className="w-full text-[10px] text-start">
                        <tbody>
                          {tablePreview.map((row, ri) => (
                            <tr key={ri} className={ri === 0 ? "bg-brand-wood/15 font-bold" : ""}>
                              {row.map((c, ci) => (
                                <td key={ci} className="border-e border-brand-border/50 px-2 py-1 whitespace-nowrap max-w-[140px] truncate">
                                  {c}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : showFilePreview && previewUrl ? (
                      active.mimeType === "application/pdf" ? (
                        <iframe title="معاينة PDF" src={previewUrl} className="w-full h-[320px] bg-white" />
                      ) : (
                        <img alt="معاينة" src={previewUrl} className="max-h-[320px] w-full object-contain" />
                      )
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-brand-metal py-16 text-[11px]">
                        {active.fileName.match(/\.xlsx?$/i) ? (
                          <FileSpreadsheet className="w-10 h-10 opacity-40" />
                        ) : active.mimeType.startsWith("image/") ? (
                          <ImageIcon className="w-10 h-10 opacity-40" />
                        ) : (
                          <FileText className="w-10 h-10 opacity-40" />
                        )}
                        <ArabicText>
                          {previewUrl ? "معاينة الملف غير متاحة لهذا النواع — استخدم تبويب الجدول لملفات Excel." : "أعد رفع الملف لمعاينة PDF أو صورة."}
                        </ArabicText>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-4 space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">بيانات أمر الشغل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <TextField
                      label="المشروع"
                      value={active.projectName}
                      onChange={(e) => patchSession((s) => ({ ...s, projectName: e.target.value }))}
                    />
                    <TextField
                      label="العميل"
                      value={active.client}
                      onChange={(e) => patchSession((s) => ({ ...s, client: e.target.value }))}
                    />
                    <TextField
                      label="مرجع / رقم أمر"
                      value={active.orderRef}
                      onChange={(e) => patchSession((s) => ({ ...s, orderRef: e.target.value }))}
                    />
                    <TextField
                      label="ملاحظات"
                      value={active.notes}
                      onChange={(e) => patchSession((s) => ({ ...s, notes: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <MaterialsBlock
                title="الخامات"
                items={active.materials}
                onChange={(materials) => patchSession((s) => ({ ...s, materials }))}
              />
              <MaterialsBlock
                title="الاكسسوارات"
                items={active.accessories}
                onChange={(accessories) => patchSession((s) => ({ ...s, accessories }))}
              />

              <section className="glass-panel p-4 space-y-3">
                <header className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">
                    <ArabicText>القطع المراد تشغيلها</ArabicText>
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      patchSession((s) => ({
                        ...s,
                        parts: [
                          ...s.parts,
                          {
                            id: uid(),
                            name: "",
                            qty: "1",
                            factory: factoryHint,
                            department_id:
                              factoryHint === "WF-001" ? "DEPT_PANEL_PROC" : "DEPT_PREP",
                            task_id: factoryHint === "WF-001" ? "PANEL_CUT" : "TASK_SHEAR",
                            optionalPlannedMinutes: null,
                            includeInWorkOrder: true,
                          },
                        ],
                      }))
                    }
                    className="industrial-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <ArabicText>إضافة قطعة</ArabicText>
                  </button>
                </header>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-[11px]">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-wider text-brand-metal border-b border-brand-border">
                        <th className="p-2 text-start">✓</th>
                        <th className="p-2 text-start">قطعة</th>
                        <th className="p-2 text-start">كمية</th>
                        <th className="p-2 text-start">مصنع</th>
                        <th className="p-2 text-start">قسم</th>
                        <th className="p-2 text-start">ماكينة</th>
                        <th className="p-2 text-start">وقت تقديري (دقيقة)</th>
                        <th className="p-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {active.parts.map((part) => (
                        <PartRow
                          key={part.id}
                          part={part}
                          onChange={(p) =>
                            patchSession((s) => ({
                              ...s,
                              parts: s.parts.map((x) => (x.id === part.id ? p : x)),
                            }))
                          }
                          onRemove={() =>
                            patchSession((s) => ({
                              ...s,
                              parts: s.parts.filter((x) => x.id !== part.id),
                            }))
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
                {active.parts.length === 0 && (
                  <p className="text-[11px] text-brand-metal text-center py-6">لا قطع بعد — أضف صفوفاً أو ارفع Excel.</p>
                )}
              </section>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function MaterialsBlock({
  title,
  items,
  onChange,
}: {
  title: string;
  items: AnalysisLineItem[];
  onChange: (next: AnalysisLineItem[]) => void;
}) {
  const add = () =>
    onChange([...items, { id: uid(), name: "", spec: "", qty: "", unit: "" }]);
  return (
    <section className="glass-panel p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">
          <ArabicText>{title}</ArabicText>
        </h3>
        <button type="button" onClick={add} className="industrial-btn">
          <Plus className="w-3 h-3" />
          <span className="text-[10px]">صف</span>
        </button>
      </header>
      <div className="grid gap-2">
        {items.map((row) => (
          <div key={row.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end border border-brand-border p-2 bg-brand-black/30">
            <div className="md:col-span-4">
              <TextField
                label="الاسم"
                value={row.name}
                onChange={(e) =>
                  onChange(items.map((x) => (x.id === row.id ? { ...x, name: e.target.value } : x)))
                }
              />
            </div>
            <div className="md:col-span-2">
              <TextField
                label="كمية"
                value={row.qty}
                onChange={(e) =>
                  onChange(items.map((x) => (x.id === row.id ? { ...x, qty: e.target.value } : x)))
                }
              />
            </div>
            <div className="md:col-span-2">
              <TextField
                label="وحدة"
                value={row.unit}
                onChange={(e) =>
                  onChange(items.map((x) => (x.id === row.id ? { ...x, unit: e.target.value } : x)))
                }
              />
            </div>
            <div className="md:col-span-3">
              <TextField
                label="مواصفة"
                value={row.spec}
                onChange={(e) =>
                  onChange(items.map((x) => (x.id === row.id ? { ...x, spec: e.target.value } : x)))
                }
              />
            </div>
            <div className="md:col-span-1 flex justify-end pb-1">
              <button
                type="button"
                onClick={() => onChange(items.filter((x) => x.id !== row.id))}
                className="text-brand-metal hover:text-brand-error"
                aria-label="حذف"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-brand-metal">لا صفوف.</p>}
      </div>
    </section>
  );
}

function PartRow({
  part,
  onChange,
  onRemove,
}: {
  part: AnalysisPart;
  onChange: (p: AnalysisPart) => void;
  onRemove: () => void;
}) {
  const factory = factoryModel(part.factory);
  const department =
    factory.departments.find((d) => d.id === part.department_id) ?? factory.departments[0];
  const task = department.tasks.find((t) => t.id === part.task_id) ?? department.tasks[0];

  return (
    <tr className="border-b border-brand-border/60 align-top">
      <td className="p-2">
        <input
          type="checkbox"
          checked={part.includeInWorkOrder}
          onChange={(e) => onChange({ ...part, includeInWorkOrder: e.target.checked })}
          className="accent-brand-wood"
        />
      </td>
      <td className="p-2">
        <input
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[11px]"
          value={part.name}
          onChange={(e) => onChange({ ...part, name: e.target.value })}
        />
      </td>
      <td className="p-2">
        <input
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[11px]"
          value={part.qty}
          onChange={(e) => onChange({ ...part, qty: e.target.value })}
        />
      </td>
      <td className="p-2">
        <select
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[11px]"
          value={part.factory}
          onChange={(e) => {
            const f = e.target.value as FactoryId;
            const fac = factoryModel(f);
            const dep0 = fac.departments[0];
            const tk0 = dep0.tasks[0];
            onChange({
              ...part,
              factory: f,
              department_id: dep0.id,
              task_id: tk0.id,
            });
          }}
        >
          <option value="WF-001">أخشاب</option>
          <option value="MF-001">معادن</option>
        </select>
      </td>
      <td className="p-2">
        <select
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[10px]"
          value={part.department_id}
          onChange={(e) => {
            const dept = factory.departments.find((d) => d.id === e.target.value) ?? factory.departments[0];
            const tk0 = dept.tasks[0];
            onChange({
              ...part,
              department_id: dept.id,
              task_id: tk0.id,
            });
          }}
        >
          {factory.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name.slice(0, 28)}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <select
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[10px]"
          value={task.id}
          onChange={(e) => onChange({ ...part, task_id: e.target.value })}
        >
          {department.tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </td>
      <td className="p-2">
        <input
          type="number"
          min={0}
          placeholder="—"
          className="w-full bg-brand-black border border-brand-border px-2 py-1 text-[11px]"
          value={part.optionalPlannedMinutes ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") onChange({ ...part, optionalPlannedMinutes: null });
            else {
              const n = Number(v);
              onChange({ ...part, optionalPlannedMinutes: Number.isFinite(n) ? n : null });
            }
          }}
        />
      </td>
      <td className="p-2 text-end">
        <button type="button" onClick={onRemove} className="text-brand-metal hover:text-brand-error">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
