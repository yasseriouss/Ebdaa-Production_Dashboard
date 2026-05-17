export function appLocale(direction: "ltr" | "rtl"): string {
  return direction === "rtl" ? "ar-EG" : "en-US";
}

export function formatDateIso(isoOrDate: string | Date, locale: string): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}
