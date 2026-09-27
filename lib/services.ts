import type { Service } from "@/lib/data/services";
import { formatDuration, formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

type PricedService = Pick<Service, "priceType" | "priceXaf">;

export function servicePriceLabel(service: PricedService, locale: Locale, common: Dictionary["common"]) {
  if (service.priceType === "consultation") return common.onConsultation;
  if (service.priceXaf == null) return common.priceOnRequest;
  const price = formatPrice(service.priceXaf, locale);
  return service.priceType === "from" ? `${common.from} ${price}` : price;
}

export function serviceDurationLabel(service: Pick<Service, "durationMinutes">, locale: Locale) {
  return service.durationMinutes ? formatDuration(service.durationMinutes, locale) : null;
}
