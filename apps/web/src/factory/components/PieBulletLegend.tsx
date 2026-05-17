import { cn } from "@factory/lib/utils";

export type PieBulletLegendItem = {
  name: string;
  fill: string;
  value?: number | string;
};

type PieBulletLegendProps = {
  items: PieBulletLegendItem[];
  className?: string;
};

/** صف مرجعي: نقاط ملونة مطابقة للشرائح — سهل المسح البصري */
export function PieBulletLegend({ items, className }: PieBulletLegendProps) {
  if (!items.length) return null;
  return (
    <ul
      dir="rtl"
      className={cn(
        "m-0 flex list-none flex-wrap items-center justify-end gap-x-4 gap-y-2 p-0",
        className,
      )}
      aria-label="مرجع ألوان المخطط"
    >
      {items.map((item, i) => (
        <li key={`${item.name}-${i}`} className="flex min-w-0 max-w-full items-center gap-2">
          <span
            className="size-2.5 shrink-0 rounded-full ring-2 ring-foreground/15 shadow-sm"
            style={{ backgroundColor: item.fill }}
            aria-hidden
          />
          <span className="truncate text-[11px] font-semibold leading-snug text-foreground">
            {item.name}
            {item.value !== undefined && item.value !== "" ? (
              <span className="ms-1 tabular-nums font-bold text-muted-foreground">
                {typeof item.value === "number" ? item.value : item.value}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
