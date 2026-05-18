import type { NewsTickerItem } from "./newsTickerItems";

export type NewsTickerFeedItem = NewsTickerItem & { occurredAt: number };

const MAX_EVENTS = 48;
const listeners = new Set<() => void>();
let events: NewsTickerFeedItem[] = [];
let sortedSnapshot: NewsTickerFeedItem[] = [];
let snapshotDirty = true;

function rebuildSnapshot(): NewsTickerFeedItem[] {
  sortedSnapshot = [...events].sort((a, b) => a.occurredAt - b.occurredAt);
  snapshotDirty = false;
  return sortedSnapshot;
}

function emit() {
  snapshotDirty = true;
  listeners.forEach((listener) => listener());
}

/** Chronological order — earliest occurrence first in the ticker stream. */
export function getNewsTickerFeedSorted(): NewsTickerFeedItem[] {
  if (snapshotDirty) return rebuildSnapshot();
  return sortedSnapshot;
}

export function subscribeNewsTickerFeed(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function pushNewsTickerEvent(
  item: NewsTickerItem & { occurredAt?: number },
): void {
  const occurredAt = item.occurredAt ?? Date.now();
  const next: NewsTickerFeedItem = { id: item.id, text: item.text, href: item.href, occurredAt };
  const idx = events.findIndex((e) => e.id === item.id);
  if (idx >= 0) {
    const prev = events[idx];
    if (
      prev.text === next.text &&
      prev.href === next.href &&
      prev.occurredAt === next.occurredAt
    ) {
      return;
    }
    events[idx] = next;
  } else {
    events.push(next);
  }
  if (events.length > MAX_EVENTS) {
    events = rebuildSnapshot().slice(-MAX_EVENTS);
    snapshotDirty = true;
  }
  emit();
}

export function getNewsTickerEvent(id: string): NewsTickerFeedItem | undefined {
  return events.find((e) => e.id === id);
}

export function seedNewsTickerEvents(items: NewsTickerItem[], baseTime = Date.now()): void {
  let changed = false;
  items.forEach((item, index) => {
    const occurredAt = baseTime - (items.length - index) * 1000;
    const idx = events.findIndex((e) => e.id === item.id);
    if (idx < 0) {
      events.push({ ...item, occurredAt });
      changed = true;
    } else if (events[idx].text !== item.text || events[idx].href !== item.href) {
      events[idx] = { ...events[idx], text: item.text, href: item.href };
      changed = true;
    }
  });
  if (events.length > MAX_EVENTS) {
    events = rebuildSnapshot().slice(-MAX_EVENTS);
    snapshotDirty = true;
    changed = true;
  }
  if (changed) emit();
}

/** @internal test helper */
export function resetNewsTickerFeedForTests(): void {
  events = [];
  sortedSnapshot = [];
  snapshotDirty = true;
  emit();
}
