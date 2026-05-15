import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileSpreadsheet,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { Dialog } from "../components/ui/Dialog";
import { Select, TextField } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { factoryCapacityFixture } from "../data/fixtures";
import {
  uid,
  initialProjectDraft,
  type NewProjectStep,
  type PartDraft,
  type ProductDraft,
  type ProjectDraft,
} from "../data/projectDraft";
import type { FactoryId } from "../data/types";
import { assessDuplicates, describeDuplicateReason } from "../lib/workOrderAnalysis/duplicateCheck";
import { appendImportLog } from "../lib/workOrderAnalysis/storage";
import {
  useFhAnalysisSessions,
  useFhNewProjectAutosave,
  usePutFhNewProjectAutosave,
  useUpsertFhAnalysisSession,
} from "../lib/api/hooks/useFactoryHub";
import { mergeProjectDrafts, sessionToProjectDraft } from "../lib/workOrderAnalysis/toProjectDraft";

const STEP_LABELS: Array<{ title: string; arabic: string }> = [
  { title: "Project Info", arabic: "تفاصيل المشروع" },
  { title: "Products", arabic: "المنتجات" },
  { title: "Parts & Routing", arabic: "الأجزاء والمسار" },
  { title: "Review", arabic: "المراجعة" },
];

export default function NewProject() {
  const toast = useToast();
  const { data: remoteAutosave, isFetched: autosaveFetched } = useFhNewProjectAutosave();
  const putAutosave = usePutFhNewProjectAutosave();
  const { data: analysisSessions = [] } = useFhAnalysisSessions([]);
  const upsertSessionApi = useUpsertFhAnalysisSession();

  const [step, setStep] = useState<NewProjectStep>(0);
  const [draft, setDraft] = useState<ProjectDraft>(initialProjectDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!autosaveFetched || hydrated) return;
    if (remoteAutosave) {
      setDraft(remoteAutosave.draft);
      setStep(remoteAutosave.step);
    }
    setHydrated(true);
  }, [remoteAutosave, autosaveFetched, hydrated]);
  const [importOpen, setImportOpen] = useState(false);
  const [selSessionId, setSelSessionId] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [mergeFromAutosave, setMergeFromAutosave] = useState(false);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      putAutosave.mutate({ draft, step, updatedAt: new Date().toISOString() });
    }, 450);
    return () => window.clearTimeout(t);
  }, [draft, step, putAutosave, hydrated]);

  const canNext = useMemo(() => {
    if (step === 0) return draft.name.trim().length > 0;
    if (step === 1) return draft.products.length > 0 && draft.products.every((p) => p.name.trim());
    if (step === 2)
      return draft.products.every((product) =>
        product.parts.every((part) => part.name.trim() && part.routing.length > 0),
      );
    return true;
  }, [draft, step]);

  const handleAddProduct = () => {
    setDraft((d) => ({
      ...d,
      products: [
        ...d.products,
        { id: uid(), name: "", description: "", parts: [] },
      ],
    }));
  };

  const handleSubmit = () => {
    toast.success(`Project "${draft.name}" drafted with ${draft.products.length} products.`);
    putAutosave.mutate({ draft: initialProjectDraft, step: 0, updatedAt: new Date().toISOString() });
    setDraft(initialProjectDraft);
    setStep(0);
  };

  const sessions = importOpen ? analysisSessions : [];
  const selectedSession = selSessionId ? sessions.find((s) => s.id === selSessionId) : undefined;
  const autosaveSnap = remoteAutosave ?? null;
  const dupAssessment = selectedSession
    ? assessDuplicates(selectedSession, autosaveSnap ?? null, {
        importMode,
        mergeFromAutosave,
        currentDraft: draft,
      })
    : null;
  const needsDuplicateAck = !!dupAssessment &&
    (dupAssessment.reusedImport ||
      dupAssessment.fixtureMatches.length > 0 ||
      dupAssessment.draftPartOverlaps.length > 0 ||
      (importMode === "merge" &&
        mergeFromAutosave &&
        !!dupAssessment.incompleteAutosave));

  const applyImport = useCallback(() => {
    if (!selectedSession) {
      toast.error("اختر جلسة تحليل من القائمة.");
      return;
    }
    const assessment = assessDuplicates(selectedSession, remoteAutosave ?? null, {
      importMode,
      mergeFromAutosave,
      currentDraft: draft,
    });
    const risk =
      assessment.reusedImport ||
      assessment.fixtureMatches.length > 0 ||
      assessment.draftPartOverlaps.length > 0 ||
      (importMode === "merge" &&
        mergeFromAutosave &&
        !!assessment.incompleteAutosave);
    if (risk && !duplicateAcknowledged) {
      toast.error("فعّل «أوافق على الإدراج رغم التنبيهات» أو ألغِ.");
      return;
    }
    const incoming = sessionToProjectDraft(selectedSession);
    if (!incoming.products.length) {
      toast.error("لا توجد قطع مفعّلة للاستيراد — راجع شاشة التحليل.");
      return;
    }

    let baseDraft: ProjectDraft = draft;
    if (importMode === "merge" && mergeFromAutosave && assessment.incompleteAutosave) {
      baseDraft = assessment.incompleteAutosave.draft;
    }

    const nextDraft =
      importMode === "replace" ? incoming : mergeProjectDrafts(baseDraft, incoming);

    setDraft(nextDraft);
    let nextStep: NewProjectStep = 2;
    if (
      importMode === "merge" &&
      mergeFromAutosave &&
      assessment.incompleteAutosave
    ) {
      nextStep = Math.min(assessment.incompleteAutosave.step, 2) as NewProjectStep;
    }
    setStep(nextStep);

    const patched = {
      ...selectedSession,
      lastImportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    upsertSessionApi.mutate(patched);
    appendImportLog({
      fingerprint: assessment.fingerprint,
      importedAt: new Date().toISOString(),
      sessionId: selectedSession.id,
    });
    toast.success(
      importMode === "replace"
        ? "تم استبدال المسودة ببيانات التحليل."
        : "تم دمج بيانات التحليل مع المسودة.",
    );
    setImportOpen(false);
    setDuplicateAcknowledged(false);
    setMergeFromAutosave(false);
  }, [
    duplicateAcknowledged,
    draft,
    importMode,
    mergeFromAutosave,
    selectedSession,
    remoteAutosave,
    toast,
    upsertSessionApi,
  ]);

  const openImporter = () => {
    setSelSessionId(analysisSessions[0]?.id ?? null);
    setDuplicateAcknowledged(false);
    setImportOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="border-b border-brand-border pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Workflow className="w-5 h-5 text-brand-wood" />
            <h2 className="text-3xl font-bold tracking-tighter uppercase">New Project</h2>
          </div>
          <button type="button" onClick={openImporter} className="industrial-btn border-brand-wood/45">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <ArabicText>استيراد من تحليل أوامر الشغل</ArabicText>
          </button>
        </div>
        <p className="text-sm text-brand-metal mt-1">
          Multi-step wizard for capturing routing, parts, and operations
          <span className="mx-2 text-brand-border">|</span>
          <ArabicText>إدخال مشروع جديد</ArabicText>
        </p>
      </header>

      <Stepper step={step} />

      <div className="glass-panel p-6">
        {step === 0 && <StepInfo draft={draft} setDraft={setDraft} />}
        {step === 1 && <StepProducts draft={draft} setDraft={setDraft} onAdd={handleAddProduct} />}
        {step === 2 && <StepRouting draft={draft} setDraft={setDraft} />}
        {step === 3 && <StepReview draft={draft} />}
      </div>

      <footer className="flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1) as NewProjectStep)}
          className="industrial-btn disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        {step < 3 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={() => setStep((s) => Math.min(3, s + 1) as NewProjectStep)}
            className="industrial-btn disabled:opacity-30 disabled:cursor-not-allowed border-brand-wood/60 text-brand-luxury bg-brand-wood/10"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="industrial-btn border-brand-success/60 text-brand-success"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Submit</span>
          </button>
        )}
      </footer>

      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="استيراد من تحليل أوامر الشغل"
        description="Import from work order analysis"
        footer={
          <>
            <button type="button" className="industrial-btn" onClick={() => setImportOpen(false)}>
              إلغاء
            </button>
            <button
              type="button"
              className="industrial-btn border-brand-wood/50 text-brand-luxury"
              onClick={applyImport}
            >
              تطبيق الاستيراد
            </button>
          </>
        }
      >
        {sessions.length === 0 ? (
          <p className="text-sm text-brand-metal">
            لا توجد جلسات محفوظة. افتح «تحليل أوامر الشغل» من القائمة، ثم احفظ الجلسة في المكتبة.
          </p>
        ) : (
          <div className="space-y-4 text-[12px] text-brand-luxury">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-brand-metal block mb-1">
                جلسة محفوظة
              </label>
              <select
                className="w-full bg-brand-black border border-brand-border px-3 py-2"
                value={selSessionId ?? ""}
                onChange={(e) => {
                  setSelSessionId(e.target.value || null);
                  setDuplicateAcknowledged(false);
                }}
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.projectName || s.fileName} — {new Date(s.updatedAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] uppercase text-brand-metal">طريقة الإدراج</p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imode"
                  checked={importMode === "replace"}
                  onChange={() => setImportMode("replace")}
                  className="mt-1 accent-brand-wood"
                />
                <span>
                  <ArabicText>استبدال المسودة الحالية بالكامل ببيانات التحليل</ArabicText>
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="imode"
                  checked={importMode === "merge"}
                  onChange={() => setImportMode("merge")}
                  className="mt-1 accent-brand-wood"
                />
                <span>
                  <ArabicText>دمج قطع التحليل مع المسودة الحالية</ArabicText>{" "}
                  <span className="text-brand-metal">(يُفضَّل لتكملة أمر غير مكتمل)</span>
                </span>
              </label>
            </div>

            {importMode === "merge" &&
              dupAssessment?.incompleteAutosave && (
                <label className="flex items-start gap-2 border border-brand-border p-2 bg-brand-black/30">
                  <input
                    type="checkbox"
                    checked={mergeFromAutosave}
                    onChange={(e) => setMergeFromAutosave(e.target.checked)}
                    className="mt-1 accent-brand-wood"
                  />
                  <span>
                    <ArabicText>
                      بدء الدمج من المسودة التلقائية غير المكتملة لهذا المتصفّح، ثم إضافة بيانات
                      التحليل فوقها
                    </ArabicText>
                  </span>
                </label>
              )}

            {selectedSession && dupAssessment && (
              <div className="space-y-2 border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="text-[10px] font-bold uppercase text-amber-100/90">التنبيهات</p>
                <p className="text-[11px] text-brand-metal leading-relaxed">
                  {describeDuplicateReason(dupAssessment)}
                </p>
                {importMode === "merge" && dupAssessment.incompleteAutosave && mergeFromAutosave && (
                  <p className="text-[11px] text-amber-200/80 mt-2">
                    سيتم الجمع بين المسودة المحفوظة غير المكتملة وبيانات التحليل — تأكد من عدم تكرار القطع
                    يدوياً بعد الاستيراد.
                  </p>
                )}
                {dupAssessment.fixtureMatches.length > 0 && (
                  <ul className="text-[10px] text-brand-metal list-disc ms-4 space-y-1">
                    {dupAssessment.fixtureMatches.slice(0, 5).map((m) => (
                      <li key={m.work_order_id}>
                        {m.work_order_id} · {m.product_name}{" "}
                        {m.remaining > 0 ? `(متبقي ${m.remaining})` : "(مكتمل)"}
                      </li>
                    ))}
                  </ul>
                )}
                {importMode === "merge" && dupAssessment.draftPartOverlaps.length > 0 && (
                  <ul className="text-[10px] text-amber-200/90 list-disc ms-4 space-y-1">
                    {dupAssessment.draftPartOverlaps.slice(0, 12).map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                )}
                {needsDuplicateAck && (
                  <label className="flex items-start gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={duplicateAcknowledged}
                      onChange={(e) => setDuplicateAcknowledged(e.target.checked)}
                      className="mt-1 accent-brand-wood"
                    />
                    <ArabicText>
                      أفهم وأوافق على إدراج البيانات رغم التنبيهات أعلاه (بما فيها التكرار أو عدم اكتمال
                      أمر سابق إن وجد)
                    </ArabicText>
                  </label>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

function Stepper({ step }: { step: NewProjectStep }) {
  return (
    <ol className="grid grid-cols-1 md:grid-cols-4 gap-2">
      {STEP_LABELS.map((label, index) => {
        const active = step === index;
        const done = step > index;
        return (
          <li
            key={label.title}
            className={`border p-3 ${
              done
                ? "border-brand-success/60"
                : active
                  ? "border-brand-wood/60"
                  : "border-brand-border"
            }`}
          >
            <p className="text-[10px] uppercase tracking-widest text-brand-metal">
              Step {index + 1}
            </p>
            <p className="text-xs font-bold text-brand-luxury">{label.title}</p>
            <ArabicText className="text-[10px] text-brand-metal block">{label.arabic}</ArabicText>
          </li>
        );
      })}
    </ol>
  );
}

function StepInfo({
  draft,
  setDraft,
}: {
  draft: ProjectDraft;
  setDraft: (d: ProjectDraft) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TextField
        label="Project Name"
        value={draft.name}
        onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        placeholder="e.g. Marina Tower lobby"
      />
      <TextField
        label="Client"
        value={draft.client}
        onChange={(event) => setDraft({ ...draft, client: event.target.value })}
        placeholder="Client / owner"
      />
      <TextField
        type="date"
        label="Delivery Date"
        value={draft.delivery_date}
        onChange={(event) => setDraft({ ...draft, delivery_date: event.target.value })}
      />
      <Select
        label="Priority"
        value={draft.priority}
        onChange={(event) => setDraft({ ...draft, priority: event.target.value as ProjectDraft["priority"] })}
      >
        <option value="Low">Low</option>
        <option value="Normal">Normal</option>
        <option value="High">High</option>
        <option value="Critical">Critical</option>
      </Select>
    </div>
  );
}

function StepProducts({
  draft,
  setDraft,
  onAdd,
}: {
  draft: ProjectDraft;
  setDraft: (d: ProjectDraft) => void;
  onAdd: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest">Products</h3>
        <button type="button" onClick={onAdd} className="industrial-btn">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>
      {draft.products.length === 0 && (
        <p className="text-xs text-brand-metal py-8 text-center">
          Add at least one product to continue.
        </p>
      )}
      <ul className="space-y-3">
        {draft.products.map((product, index) => (
          <li key={product.id} className="border border-brand-border p-4 bg-brand-black/40 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <span className="text-[10px] uppercase tracking-widest text-brand-metal">
                Product #{index + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    products: draft.products.filter((p) => p.id !== product.id),
                  })
                }
                className="text-brand-metal hover:text-brand-error"
                aria-label="Remove product"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <TextField
                label="Name"
                value={product.name}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    products: draft.products.map((p) =>
                      p.id === product.id ? { ...p, name: event.target.value } : p,
                    ),
                  })
                }
              />
              <TextField
                label="Description"
                value={product.description}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    products: draft.products.map((p) =>
                      p.id === product.id ? { ...p, description: event.target.value } : p,
                    ),
                  })
                }
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepRouting({
  draft,
  setDraft,
}: {
  draft: ProjectDraft;
  setDraft: (d: ProjectDraft) => void;
}) {
  if (draft.products.length === 0) {
    return <p className="text-xs text-brand-metal">Add products first.</p>;
  }
  return (
    <div className="space-y-6">
      {draft.products.map((product) => (
        <ProductRoutingEditor
          key={product.id}
          product={product}
          onChange={(next) =>
            setDraft({
              ...draft,
              products: draft.products.map((p) => (p.id === product.id ? next : p)),
            })
          }
        />
      ))}
    </div>
  );
}

function ProductRoutingEditor({
  product,
  onChange,
}: {
  product: ProductDraft;
  onChange: (next: ProductDraft) => void;
}) {
  const addPart = () => {
    onChange({
      ...product,
      parts: [
        ...product.parts,
        { id: uid(), name: "", factory: "WF-001", routing: [], optionalPlannedMinutes: null },
      ],
    });
  };

  return (
    <section className="border border-brand-border p-4 bg-brand-black/40 space-y-3">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-brand-metal">Product</p>
          <p className="text-sm font-bold text-brand-luxury">{product.name || "Untitled"}</p>
        </div>
        <button type="button" onClick={addPart} className="industrial-btn">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Part</span>
        </button>
      </header>
      {product.parts.length === 0 && (
        <p className="text-xs text-brand-metal">Break the product into one or more parts.</p>
      )}
      <ul className="space-y-4">
        {product.parts.map((part) => (
          <PartEditor
            key={part.id}
            part={part}
            onChange={(next) =>
              onChange({
                ...product,
                parts: product.parts.map((p) => (p.id === part.id ? next : p)),
              })
            }
            onRemove={() =>
              onChange({
                ...product,
                parts: product.parts.filter((p) => p.id !== part.id),
              })
            }
          />
        ))}
      </ul>
    </section>
  );
}

function PartEditor({
  part,
  onChange,
  onRemove,
}: {
  part: PartDraft;
  onChange: (next: PartDraft) => void;
  onRemove: () => void;
}) {
  const factory =
    part.factory === "WF-001"
      ? factoryCapacityFixture.woodworking_factory
      : factoryCapacityFixture.metal_factory;
  const addStep = () => {
    const department = factory.departments[0];
    const task = department.tasks[0];
    onChange({
      ...part,
      routing: [
        ...part.routing,
        {
          id: uid(),
          department_id: department.id,
          task_id: task.id,
          cycle_time_seconds: task.capacity_metrics?.cycle_time_seconds ?? 60,
        },
      ],
    });
  };

  return (
    <li className="border border-brand-border p-3 space-y-3 bg-brand-elevated">
      <div className="flex items-end justify-between gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
          <TextField
            label="Part Name"
            value={part.name}
            onChange={(event) => onChange({ ...part, name: event.target.value })}
          />
          <Select
            label="Factory"
            value={part.factory}
            onChange={(event) =>
              onChange({
                ...part,
                factory: event.target.value as FactoryId,
                routing: [],
              })
            }
          >
            <option value="WF-001">Wood (WF-001)</option>
            <option value="MF-001">Metal (MF-001)</option>
          </Select>
          <TextField
            label="Optional est. (min)"
            type="number"
            min={0}
            placeholder="Later planning"
            value={part.optionalPlannedMinutes ?? ""}
            onChange={(event) => {
              const v = event.target.value;
              if (v === "") onChange({ ...part, optionalPlannedMinutes: null });
              else {
                const n = Number(v);
                onChange({
                  ...part,
                  optionalPlannedMinutes: Number.isFinite(n) ? n : null,
                });
              }
            }}
          />
        </div>
        <button type="button" onClick={onRemove} className="text-brand-metal hover:text-brand-error" aria-label="Remove part">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-luxury">
          Routing Steps
        </p>
        <button type="button" onClick={addStep} className="industrial-btn">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Step</span>
        </button>
      </div>

      <ol className="space-y-2">
        {part.routing.map((stepRow, index) => {
          const department = factory.departments.find((d) => d.id === stepRow.department_id) ??
            factory.departments[0];
          const task = department.tasks.find((t) => t.id === stepRow.task_id) ?? department.tasks[0];
          return (
            <li key={stepRow.id} className="border border-brand-border p-3 bg-brand-black/60 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <span className="text-[10px] uppercase tracking-widest text-brand-metal">
                Step {index + 1}
              </span>
              <Select
                label="Department"
                value={stepRow.department_id}
                onChange={(event) => {
                  const dept = factory.departments.find((d) => d.id === event.target.value);
                  const firstTask = dept?.tasks[0];
                  onChange({
                    ...part,
                    routing: part.routing.map((s) =>
                      s.id === stepRow.id
                        ? {
                            ...s,
                            department_id: event.target.value,
                            task_id: firstTask?.id ?? s.task_id,
                            cycle_time_seconds:
                              firstTask?.capacity_metrics?.cycle_time_seconds ?? s.cycle_time_seconds,
                          }
                        : s,
                    ),
                  });
                }}
              >
                {factory.departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.id}
                  </option>
                ))}
              </Select>
              <Select
                label="Machine / Task"
                value={stepRow.task_id}
                onChange={(event) => {
                  const nextTask = department.tasks.find((t) => t.id === event.target.value);
                  onChange({
                    ...part,
                    routing: part.routing.map((s) =>
                      s.id === stepRow.id
                        ? {
                            ...s,
                            task_id: event.target.value,
                            cycle_time_seconds:
                              nextTask?.capacity_metrics?.cycle_time_seconds ?? s.cycle_time_seconds,
                          }
                        : s,
                    ),
                  });
                }}
              >
                {department.tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
              <div className="flex items-end gap-2">
                <TextField
                  label="Cycle (s)"
                  type="number"
                  min={0}
                  value={stepRow.cycle_time_seconds}
                  onChange={(event) =>
                    onChange({
                      ...part,
                      routing: part.routing.map((s) =>
                        s.id === stepRow.id
                          ? { ...s, cycle_time_seconds: Number(event.target.value) || 0 }
                          : s,
                      ),
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...part,
                      routing: part.routing.filter((s) => s.id !== stepRow.id),
                    })
                  }
                  className="text-brand-metal hover:text-brand-error"
                  aria-label="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="md:col-span-4 text-[10px] text-brand-metal">
                <span className="font-bold text-brand-luxury">{task.name}</span> · {task.type}
                {task.capacity_metrics
                  ? ` · ${task.capacity_metrics.max_capacity_per_hour}/h max`
                  : ""}
              </p>
            </li>
          );
        })}
      </ol>
    </li>
  );
}

function StepReview({ draft }: { draft: ProjectDraft }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest">Review</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-brand-luxury">
        <Row label="Project" value={draft.name || "—"} />
        <Row label="Client" value={draft.client || "—"} />
        <Row label="Delivery" value={draft.delivery_date || "—"} />
        <Row label="Priority" value={draft.priority} />
      </dl>
      <div className="space-y-3">
        {draft.products.map((product) => (
          <article key={product.id} className="border border-brand-border p-3 bg-brand-black/40">
            <p className="text-xs font-bold text-brand-luxury">{product.name || "Untitled"}</p>
            {product.description && (
              <p className="text-[11px] text-brand-metal">{product.description}</p>
            )}
            <ul className="mt-2 space-y-1">
              {product.parts.map((part) => (
                <li key={part.id} className="text-[11px] text-brand-luxury">
                  · {part.name || "Untitled part"} ({part.factory})
                  <span className="text-brand-metal"> — {part.routing.length} steps</span>
                  {part.optionalPlannedMinutes != null && part.optionalPlannedMinutes > 0 && (
                    <span className="text-brand-metal"> — ~{part.optionalPlannedMinutes} min est.</span>
                  )}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-brand-border p-3 bg-brand-black/40">
      <p className="text-[10px] uppercase tracking-widest text-brand-metal">{label}</p>
      <p className="text-sm text-brand-luxury">{value}</p>
    </div>
  );
}
