import * as React from "react"

import { cn } from "@factory/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, dir, ...props }, ref) => {
    const resolvedDir =
      dir ??
      (type === "number" ||
      type === "date" ||
      type === "datetime-local" ||
      type === "month" ||
      type === "week" ||
      type === "time"
        ? undefined
        : ("auto" as const));

    return (
      <input
        type={type}
        {...(resolvedDir !== undefined ? { dir: resolvedDir } : {})}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
