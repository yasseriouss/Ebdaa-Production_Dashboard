import type { HTMLAttributes } from "react";

type ArabicTextProps = HTMLAttributes<HTMLElement> & {
  /** Render as a block (`<p>` semantics) instead of an inline `<span>`. */
  block?: boolean;
};

/**
 * Wraps Arabic copy so it renders in Tajawal with the correct `lang`
 * attribute. Stays inline by default; pass `block` for paragraph contexts.
 */
export function ArabicText({
  block = false,
  className = "",
  children,
  ...rest
}: ArabicTextProps) {
  const Tag = block ? "p" : "span";
  const classes = ["font-arabic", className].filter(Boolean).join(" ");
  return (
    <Tag lang="ar" dir="rtl" className={classes} {...rest}>
      {children}
    </Tag>
  );
}
