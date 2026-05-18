import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { Link } from "wouter";
import { cn } from "../../lib/cn";
import { buildNewsTickerItems } from "../../lib/newsTickerItems";
import {
  getNewsTickerEvent,
  getNewsTickerFeedSorted,
  pushNewsTickerEvent,
  seedNewsTickerEvents,
  subscribeNewsTickerFeed,
  type NewsTickerFeedItem,
} from "../../lib/newsTickerFeed";
import { useRouteCoachToast } from "../../lib/useRouteCoachToast";
import { useWoodBottleneckStage } from "../../lib/useWoodBottleneckStage";
import { useTranslation } from "../../context/I18nContext";
import { useDirection } from "../../lib/useDirection";

function useNewsTickerFeedItems(): NewsTickerFeedItem[] {
  return useSyncExternalStore(subscribeNewsTickerFeed, getNewsTickerFeedSorted, getNewsTickerFeedSorted);
}

function TickerChip({
  item,
  rtl,
}: {
  item: { id: string; text: string; href?: string };
  rtl: boolean;
}) {
  const className = cn(
    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-brand-luxury",
    "border border-brand-border/50 bg-brand-black/35 px-2 py-0.5 rounded-sm",
    "hover:border-brand-wood/40 hover:text-brand-wood transition-colors",
    rtl && "font-arabic",
  );

  const content = (
    <>
      <span className="h-1 w-1 rounded-full bg-brand-wood shrink-0" aria-hidden />
      {item.text}
    </>
  );

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <span className={className}>{content}</span>;
}

function TickerSegment({
  items,
  rtl,
  segmentKey,
  hidden,
}: {
  items: NewsTickerFeedItem[];
  rtl: boolean;
  segmentKey: string;
  hidden?: boolean;
}) {
  return (
    <div
      className="news-ticker-segment flex shrink-0 items-center gap-5 px-2"
      aria-hidden={hidden || undefined}
    >
      {items.map((item, index) => (
        <TickerChip key={`${segmentKey}-${item.id}-${index}`} item={item} rtl={rtl} />
      ))}
    </div>
  );
}

export function SystemNewsTicker() {
  const { t } = useTranslation();
  const { direction } = useDirection();
  const rtl = direction === "rtl";
  const bottleneckStage = useWoodBottleneckStage();
  const items = useNewsTickerFeedItems();
  const prevBottleneckRef = useRef(bottleneckStage);

  useRouteCoachToast();

  useLayoutEffect(() => {
    const built = buildNewsTickerItems(t, bottleneckStage);
    const staticItems = built.filter((item) => item.id !== "bottleneck");
    seedNewsTickerEvents(staticItems);
    const bottleneck = built.find((item) => item.id === "bottleneck");
    if (bottleneck) {
      const stageChanged = prevBottleneckRef.current !== bottleneckStage;
      const existing = getNewsTickerEvent("bottleneck");
      pushNewsTickerEvent({
        ...bottleneck,
        occurredAt: stageChanged ? Date.now() : (existing?.occurredAt ?? Date.now()),
      });
      prevBottleneckRef.current = bottleneckStage;
    }
  }, [t, bottleneckStage]);

  const durationSec = Math.max(48, items.length * 9);

  if (items.length === 0) return null;

  return (
    <div
      className="news-ticker shrink-0 border-b border-brand-border bg-brand-elevated/95 z-50 max-w-[1680px] mx-auto w-full"
      role="region"
      aria-label={t("newsTicker.ariaLabel")}
      dir={rtl ? "rtl" : "ltr"}
      lang={rtl ? "ar" : "en"}
    >
      <div className="flex min-h-0 items-stretch">
        <div
          className={cn(
            "news-ticker-badge shrink-0 flex items-center px-2.5 sm:px-3",
            "bg-red-600 text-white",
            rtl && "font-arabic",
          )}
        >
          <span className="text-[10px] font-bold leading-none tracking-wide whitespace-nowrap">
            {t("newsTicker.badge")}
          </span>
        </div>

        <div
          className="news-ticker-viewport min-w-0 flex-1 overflow-hidden py-1"
          aria-live="polite"
        >
          <div
            className="news-ticker-track flex w-max will-change-transform"
            style={{ ["--news-ticker-duration" as string]: `${durationSec}s` }}
          >
            <TickerSegment items={items} rtl={rtl} segmentKey="a" />
            <TickerSegment items={items} rtl={rtl} segmentKey="b" hidden />
          </div>
        </div>
      </div>
    </div>
  );
}
