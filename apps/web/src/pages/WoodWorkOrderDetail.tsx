import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, Clock4 } from "lucide-react";
import { ArabicText } from "../components/brand/ArabicText";
import { Dialog } from "../components/ui/Dialog";
import { Select, TextField } from "../components/ui/Select";
import { useToast } from "../components/ui/Toast";
import { EntityNotesPanel } from "../components/notes/EntityNotesPanel";
import { WOOD_STAGE_LABELS, WOOD_STAGE_ORDER } from "../data/routing";
import { findDepartment } from "../data/fixtures/factoryCapacity";
import {
  completionPercent,
  statusFromCompletion,
  type WoodRoutingStageKey,
  type WoodWorkOrder,
} from "../data/types";

type StageStatus = "Not Started" | "In Progress" | "Completed";

function stageStatusFromQty(passed: number, required: number): StageStatus {
  if (passed <= 0) return "Not Started";
  if (passed >= required) return "Completed";
  return "In Progress";
}

interface DetailProps {
  order: WoodWorkOrder | null;
  onClose: () => void;
  onUpdateStage: (
    workOrderId: string,
    stageKey: WoodRoutingStageKey,
    qty: number,
  ) => void;
}

export function WoodWorkOrderDetail({ order, onClose, onUpdateStage }: DetailProps) {
  const toast = useToast();
  if (!order) return null;
  return (
    <Dialog
      open
      onClose={onClose}
      variant="sheet"
      title={`Work Order · ${order.work_order_id}`}
      description={order.project_name}
    >
      <Header order={order} />
      <Stepper
        order={order}
        onUpdate={(stage, qty) => {
          onUpdateStage(order.work_order_id, stage, qty);
          toast.success(`Saved ${WOOD_STAGE_LABELS[stage].english}`);
        }}
      />
      <div className="mt-6">
        <EntityNotesPanel entityType="wood_work_order" entityId={order.work_order_id} />
      </div>
    </Dialog>
  );
}

function Header({ order }: { order: WoodWorkOrder }) {
  const percent = completionPercent(order.quantities);
  const status = statusFromCompletion(percent);
  const priority = order.priority ?? "Normal";

  return (
    <section className="mb-8 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Client" arabic="العميل">
          {order.client ?? "—"}
        </Stat>
        <Stat label="Priority" arabic="الأولوية">
          {priority}
        </Stat>
        <Stat label="Received" arabic="تاريخ الاستلام">
          {order.dates.receive_date === "nan" ? "—" : order.dates.receive_date}
        </Stat>
        <Stat label="Delivery" arabic="تاريخ التسليم">
          {order.dates.delivery_date === "nan" ? "—" : order.dates.delivery_date}
        </Stat>
      </div>

      <div>
        <ArabicText block className="text-sm text-brand-luxury mb-2">
          {order.product_name}
        </ArabicText>
        <div className="flex justify-between items-end text-[10px] uppercase tracking-widest text-brand-metal">
          <span>{status}</span>
          <span>
            {order.quantities.completed} / {order.quantities.total_required} ({percent}%)
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-brand-border">
          <div
            className="h-full bg-brand-wood transition-all"
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  arabic,
  children,
}: {
  label: string;
  arabic: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-brand-border p-3 bg-brand-black/40">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-metal">{label}</p>
      <ArabicText className="text-[10px] text-brand-metal/70 block">{arabic}</ArabicText>
      <p className="mt-1 text-sm text-brand-luxury font-bold">{children}</p>
    </div>
  );
}

function Stepper({
  order,
  onUpdate,
}: {
  order: WoodWorkOrder;
  onUpdate: (stage: WoodRoutingStageKey, qty: number) => void;
}) {
  /**
   * The source JSON does not carry per-stage `required_qty`; we treat every
   * stage as required when the order's total is non-zero. Once the upstream
   * data adds per-stage requirements, swap this filter for it.
   */
  const target = order.quantities.total_required;
  const stages = useMemo(
    () => WOOD_STAGE_ORDER.filter(() => target > 0),
    [target],
  );

  return (
    <section className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-widest text-brand-luxury">
        Routing Path
        <ArabicText className="ms-2 text-[10px] text-brand-metal normal-case">
          مسار الإنتاج
        </ArabicText>
      </h4>
      <ol className="space-y-3">
        {stages.map((stageKey, index) => {
          const stage = order.routing_progress[stageKey];
          const status = stageStatusFromQty(stage.qty_passed, target);
          const isLast = index === stages.length - 1;
          return (
            <StepperItem
              key={stageKey}
              index={index + 1}
              stageKey={stageKey}
              passed={stage.qty_passed}
              required={target}
              status={status}
              isLast={isLast}
              onChange={(qty) => onUpdate(stageKey, qty)}
            />
          );
        })}
      </ol>
    </section>
  );
}

function StepperItem({
  index,
  stageKey,
  passed,
  required,
  status,
  isLast,
  onChange,
}: {
  index: number;
  stageKey: WoodRoutingStageKey;
  passed: number;
  required: number;
  status: StageStatus;
  isLast: boolean;
  onChange: (qty: number) => void;
}) {
  const labels = WOOD_STAGE_LABELS[stageKey];
  const dept = findDepartment(labels.department);
  const [draft, setDraft] = useState(String(passed));

  useEffect(() => {
    setDraft(String(passed));
  }, [passed]);

  const palette: Record<StageStatus, { icon: React.ElementType; tone: string }> = {
    "Not Started": { icon: Circle, tone: "text-brand-metal border-brand-border" },
    "In Progress": { icon: Clock4, tone: "text-brand-warning border-brand-warning/60" },
    Completed: { icon: CheckCircle2, tone: "text-brand-success border-brand-success/60" },
  };
  const Icon = palette[status].icon;

  return (
    <li className="relative pl-10">
      {!isLast && (
        <span
          aria-hidden
          className="absolute left-4 top-9 bottom-[-12px] w-px bg-brand-border"
        />
      )}
      <span
        aria-hidden
        className={`absolute left-0 top-2 inline-flex items-center justify-center w-8 h-8 border bg-brand-elevated ${palette[status].tone}`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <div className="border border-brand-border bg-brand-black/40 p-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-brand-metal">
              Step {index}
            </p>
            <p className="text-sm font-bold text-brand-luxury">{labels.english}</p>
            <ArabicText className="block text-xs text-brand-metal">{labels.arabic}</ArabicText>
            {dept && (
              <ArabicText className="block text-[10px] text-brand-metal/70 mt-1">
                {dept.name}
              </ArabicText>
            )}
          </div>
          <div className="flex items-end gap-3 min-h-[3.5rem]">
            <TextField
              label="Qty Passed"
              type="number"
              min={0}
              max={required}
              inputMode="numeric"
              className="w-28 text-base"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => {
                const next = Number(draft);
                if (!Number.isNaN(next)) onChange(next);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const next = Number((event.target as HTMLInputElement).value);
                  if (!Number.isNaN(next)) onChange(next);
                }
              }}
            />
            <Select
              label="Status"
              className="text-base"
              value={status}
              onChange={(event) => {
                const value = event.target.value as StageStatus;
                if (value === "Not Started") onChange(0);
                else if (value === "Completed") onChange(required);
                else onChange(Math.max(1, Math.floor(required / 2)));
                setDraft(String(value === "Not Started" ? 0 : value === "Completed" ? required : Math.max(1, Math.floor(required / 2))));
              }}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-brand-metal">
          <span>
            {passed} / {required} units
          </span>
          <span>{Math.round((passed / Math.max(required, 1)) * 100)}%</span>
        </div>
        <div className="mt-1 h-1 w-full bg-brand-border">
          <div
            className="h-full bg-brand-wood"
            style={{ width: `${Math.min((passed / Math.max(required, 1)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </li>
  );
}
