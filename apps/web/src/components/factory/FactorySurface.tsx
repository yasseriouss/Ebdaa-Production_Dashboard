import type { ReactNode } from "react";
import "@factory/factory-shadcn.css";
import { cn } from "../../lib/cn";

/**
 * Wraps ported factory-app screens: shadcn tokens scoped to ENCID layout.
 * `embedded` tunes contrast when nested inside industrial glass-panel shells.
 */
export function FactorySurface({
  children,
  embedded = false,
}: {
  children: ReactNode;
  embedded?: boolean;
}) {
  return (
    <div
      className={cn(
        "factory-shadcn-scope min-h-0 w-full min-w-0 max-w-full overflow-x-auto text-foreground",
        embedded && "factory-embedded-in-industrial rounded-lg",
      )}
    >
      {children}
    </div>
  );
}
