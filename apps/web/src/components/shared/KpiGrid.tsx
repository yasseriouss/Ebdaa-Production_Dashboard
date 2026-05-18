import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      role="list"
    >
      {children}
    </div>
  );
}
