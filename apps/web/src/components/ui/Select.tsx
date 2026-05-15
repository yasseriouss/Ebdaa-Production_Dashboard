import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?: string };

/** Native-select primitive that matches the industrial theme. */
export const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { className, children, label, ...rest },
  ref,
) {
  return (
    <label className="inline-flex flex-col gap-1 min-w-[8rem]">
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-brand-metal font-bold">
          {label}
        </span>
      )}
      <span className="relative">
        <select
          ref={ref}
          className={cn(
            "w-full appearance-none bg-brand-elevated border border-brand-border",
            "px-3 py-2 pr-8 text-xs text-brand-luxury",
            "focus:outline-none focus:border-brand-metal transition-colors",
            className,
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-metal"
        />
      </span>
    </label>
  );
});

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

/** Companion input field — single component covers form text/number inputs. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { className, label, hint, error, ...rest },
  ref,
) {
  return (
    <label className="flex flex-col gap-1 w-full">
      {label && (
        <span className="text-[10px] uppercase tracking-widest text-brand-metal font-bold">
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "bg-brand-elevated border border-brand-border px-3 py-2 text-xs text-brand-luxury",
          "placeholder:text-brand-metal/70 focus:outline-none focus:border-brand-metal transition-colors",
          error && "border-brand-error/60",
          className,
        )}
        {...rest}
      />
      {(hint || error) && (
        <span
          className={cn(
            "text-[10px]",
            error ? "text-brand-error" : "text-brand-metal",
          )}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
});
