import { useId, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { useDirection } from "../../lib/useDirection";

export function GuidanceIconButton({
  expanded,
  onToggle,
  label,
  controlsId,
  className,
}: {
  expanded: boolean;
  onToggle: () => void;
  label: string;
  controlsId?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={label}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        expanded
          ? "border-brand-wood/50 bg-brand-wood/15 text-brand-wood"
          : "border-brand-border bg-brand-elevated/50 text-brand-metal hover:border-brand-wood/40 hover:text-brand-wood",
        className,
      )}
    >
      <Info className="h-3.5 w-3.5" aria-hidden />
    </button>
  );
}

export function GuidanceCollapsible({
  open,
  panelId,
  children,
  className,
}: {
  open: boolean;
  panelId: string;
  children: ReactNode;
  className?: string;
}) {
  const { direction } = useDirection();
  const rtl = direction === "rtl";

  return (
    <div
      id={panelId}
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out",
        open ? "mt-2 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        className,
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "space-y-1.5 rounded-lg border border-brand-border/80 bg-brand-elevated/40 px-3 py-2.5 text-sm leading-relaxed text-brand-metal",
            rtl && "font-arabic",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** Icon trigger beside title + full-width collapsible guidance panel. */
export function SectionGuidanceInline({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <GuidanceIconButton
        expanded={open}
        onToggle={() => setOpen((v) => !v)}
        label={label}
        controlsId={panelId}
      />
      <GuidanceCollapsible open={open} panelId={panelId} className="w-full">
        {children}
      </GuidanceCollapsible>
    </>
  );
}
