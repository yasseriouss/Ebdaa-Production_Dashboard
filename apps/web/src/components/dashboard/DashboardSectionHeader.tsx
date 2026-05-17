import { useId, useState, type ElementType, type ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useDirection } from "../../lib/useDirection";
import { GuidanceCollapsible, GuidanceIconButton } from "./SectionGuidance";

export function DashboardSectionHeader({
  badge,
  badgeIcon: BadgeIcon,
  title,
  subtitle,
  guidance,
  guidanceLabel,
  titleId,
  action,
  className,
}: {
  badge?: string;
  badgeIcon?: ElementType;
  title: string;
  subtitle?: string;
  guidance?: ReactNode;
  guidanceLabel?: string;
  titleId?: string;
  action?: ReactNode;
  className?: string;
}) {
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const guidancePanelId = useId();
  const showSubtitle = Boolean(subtitle) && !guidance;

  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-brand-border pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
    >
      <div className="min-w-0 flex-1 space-y-2">
        {badge ? (
          <div className="flex items-center gap-2 text-brand-wood">
            {BadgeIcon ? <BadgeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden /> : null}
            <span
              className={cn(
                "text-[10px] font-bold text-brand-metal",
                rtl ? "font-arabic normal-case" : "uppercase tracking-widest",
              )}
            >
              {badge}
            </span>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <h2
            id={titleId}
            className={cn(
              "min-w-0 flex-1 text-xl font-bold text-brand-luxury sm:text-2xl",
              rtl && "font-arabic normal-case tracking-tight",
              !rtl && "tracking-tight",
            )}
          >
            {title}
          </h2>
          {guidance && guidanceLabel ? (
            <GuidanceIconButton
              expanded={guidanceOpen}
              onToggle={() => setGuidanceOpen((v) => !v)}
              label={guidanceLabel}
              controlsId={guidancePanelId}
            />
          ) : null}
        </div>
        {guidance ? (
          <GuidanceCollapsible open={guidanceOpen} panelId={guidancePanelId}>
            {guidance}
          </GuidanceCollapsible>
        ) : null}
        {showSubtitle ? (
          <p className={cn("max-w-3xl text-sm leading-relaxed text-brand-metal", rtl && "font-arabic")}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
