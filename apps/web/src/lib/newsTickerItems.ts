import { EBdaa_ROUTE_COACH_HINTS } from "./coachingHints";
import type { Translate } from "../context/I18nContext";

export type NewsTickerItem = {
  id: string;
  text: string;
  href?: string;
};

/** كل تلميحات المسار + إشعارات التشغيل العامة للشريط المتحرك. */
export function buildNewsTickerItems(
  t: Translate,
  bottleneckStage: string,
): NewsTickerItem[] {
  const items: NewsTickerItem[] = [];

  for (const hint of EBdaa_ROUTE_COACH_HINTS) {
    const text = t(hint.bannerKey);
    if (!text || text === hint.bannerKey) continue;
    items.push({
      id: `hint-${hint.pathPrefix}`,
      text,
      href: hint.pathPrefix,
    });
  }

  items.push({
    id: "shift-active",
    text: t("dashboard.shiftOn"),
    href: "/daily/wood",
  });

  items.push({
    id: "bottleneck",
    text: t("dashboard.bottleneck", { stage: bottleneckStage }),
    href: "/analytics",
  });

  return items;
}
