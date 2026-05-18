import { cn } from "@factory/lib/utils";

export type PieBulletLegendItem = {
  name: string;
  fill: string;
  value?: number | string;
};

type PieBulletLegendProps = {
  items: PieBulletLegendItem[];
  className?: string;
  rtl?: boolean;
  /** عرض منظم على عمودين (مثلاً توزيع الأقسام) */
  columns?: 2;
};

/** صف مرجعي: نقاط ملونة مطابقة للشرائح — سهل المسح البصري */
export function PieBulletLegend({ items, className, rtl = true, columns }: PieBulletLegendProps) {
  if (!items.length) return null;
  const isGrid = columns === 2;

  return (
    <ul
      dir={rtl ? "rtl" : "ltr"}
      className={cn(
        "m-0 list-none p-0",
        isGrid
          ? "grid grid-cols-2 gap-x-4 gap-y-2.5"
          : cn("flex flex-wrap items-center gap-x-4 gap-y-2", rtl ? "justify-start" : "justify-end"),
        className,
      )}
      aria-label="مرجع ألوان المخطط"
    >
      {items.map((item, i) => (
        <li
          key={`${item.name}-${i}`}
          className={cn(
            "flex min-w-0 items-center gap-2",
            isGrid && "w-full",
          )}
          dir={rtl ? "rtl" : "ltr"}
        >
          <span
            className="size-2.5 shrink-0 rounded-full ring-2 ring-foreground/15 shadow-sm"
            style={{ backgroundColor: item.fill }}
            aria-hidden
          />
          <span
            className={cn(
              "min-w-0 flex-1 text-[11px] font-semibold leading-snug text-foreground",
              isGrid ? "flex items-center justify-between gap-2" : "inline-flex items-baseline gap-1.5",
            )}
          >
            <span className="truncate">{item.name}</span>
            {item.value !== undefined && item.value !== "" ? (
              <span className="shrink-0 tabular-nums font-bold text-muted-foreground">
                {typeof item.value === "number" ? item.value : item.value}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
