import { forwardRef, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  indeterminate?: boolean;
  label?: string;
};

/**
 * Styled checkbox primitive that matches the industrial theme and supports
 * an indeterminate state for "select page" toggles.
 */
export const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { className, indeterminate, checked, label, onChange, ...rest },
  forwardedRef,
) {
  return (
    <label className={cn("inline-flex items-center gap-2 cursor-pointer select-none", className)}>
      <span className="relative inline-flex items-center justify-center w-4 h-4">
        <input
          ref={(node) => {
            if (typeof forwardedRef === "function") forwardedRef(node);
            else if (forwardedRef) forwardedRef.current = node;
            if (node) node.indeterminate = Boolean(indeterminate);
          }}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 border bg-brand-elevated transition-colors",
            "peer-checked:bg-brand-wood/20 peer-checked:border-brand-wood",
            "peer-focus-visible:ring-1 peer-focus-visible:ring-brand-wood/70",
            indeterminate ? "bg-brand-wood/20 border-brand-wood" : "border-brand-border",
          )}
        />
        <span aria-hidden className="relative text-brand-wood">
          {indeterminate ? (
            <Minus className="w-3 h-3" />
          ) : checked ? (
            <Check className="w-3 h-3" />
          ) : null}
        </span>
      </span>
      {label && <span className="text-xs text-brand-luxury">{label}</span>}
    </label>
  );
});
