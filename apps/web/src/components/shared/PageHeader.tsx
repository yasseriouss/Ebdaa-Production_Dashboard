import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-start justify-between gap-4 border-b border-brand-border/70 pb-5",
        className,
      )}
    >
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-brand-luxury">{title}</h1>
        {description ? <div className="text-sm text-brand-metal max-w-3xl leading-relaxed">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
