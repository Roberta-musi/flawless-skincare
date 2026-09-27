import type { Locale } from "@/lib/i18n/config";

const intlLocale = { en: "en-CM", fr: "fr-CM" } as const;

export function formatPrice(xaf: number, locale: Locale) {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(xaf);
}

export function formatDuration(minutes: number, locale: Locale) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest} min`;
  const h = locale === "fr" ? `${hours} h` : `${hours} hr`;
  return rest ? `${h} ${rest} min` : h;
}

export function formatDate(date: Date | string, locale: Locale, options: Intl.DateTimeFormatOptions) {
  const value = typeof date === "string" ? new Date(`${date}T12:00:00`) : date;
  return new Intl.DateTimeFormat(intlLocale[locale], { timeZone: "Africa/Douala", ...options }).format(value);
}
