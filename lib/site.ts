import type { Settings } from "@/lib/data/site";
import type { Locale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";
import { normalizeWhatsAppNumber, whatsappUrl } from "@/lib/whatsapp";

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100").replace(/\/$/, "");
}

export function businessWhatsAppUrl(settings: Pick<Settings, "whatsapp">, message: string) {
  const number = normalizeWhatsAppNumber(settings.whatsapp);
  return number ? whatsappUrl(number, message) : null;
}

export function addressLines(settings: Settings, locale: Locale) {
  return [settings.streetAddress, localized(settings, "landmark", locale), `${settings.city}, ${locale === "fr" ? "Cameroun" : "Cameroon"}`].filter(
    (line): line is string => Boolean(line),
  );
}

export function mapQuery(settings: Settings) {
  if (settings.latitude != null && settings.longitude != null) return `${settings.latitude},${settings.longitude}`;
  return [settings.businessName, settings.streetAddress, settings.city, "Cameroon"].filter(Boolean).join(", ");
}

export function mapEmbedUrl(settings: Settings, locale: Locale) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(settings))}&hl=${locale}&z=15&output=embed`;
}

export function directionsUrl(settings: Settings) {
  return settings.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery(settings))}`;
}
