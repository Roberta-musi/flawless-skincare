import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/localized";

export const dialCodes = [
  { region: "CM", dial: "237" },
  { region: "NG", dial: "234" },
  { region: "GH", dial: "233" },
  { region: "GA", dial: "241" },
  { region: "TD", dial: "235" },
  { region: "CF", dial: "236" },
  { region: "CG", dial: "242" },
  { region: "GQ", dial: "240" },
  { region: "FR", dial: "33" },
  { region: "BE", dial: "32" },
  { region: "DE", dial: "49" },
  { region: "CH", dial: "41" },
  { region: "IT", dial: "39" },
  { region: "ES", dial: "34" },
  { region: "NL", dial: "31" },
  { region: "GB", dial: "44" },
  { region: "US", dial: "1" },
  { region: "CA", dial: "1" },
] as const;

export function normalizeWhatsAppNumber(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits || null;
}

export function whatsappUrl(number: string, message: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function toInternationalPhone(dial: string, local: string) {
  let digits = local.replace(/\D/g, "");
  if (local.trim().startsWith("+") || digits.startsWith("00")) {
    digits = digits.replace(/^00/, "");
  } else {
    digits = dial + digits.replace(/^0+/, "");
  }
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith("237") && !/^237[26]\d{8}$/.test(digits)) return null;
  return `+${digits}`;
}

type Messages = Dictionary["whatsapp"]["messages"];

export function productMessage(messages: Messages, input: { product: string; price: string | null; url: string }) {
  if (!input.price) return interpolate(messages.productNoPrice, { product: input.product, url: input.url });
  return interpolate(messages.product, { product: input.product, price: input.price, url: input.url });
}

export type BagMessageLine = { product: string; quantity: number; price: string };

export function bagMessage(
  messages: Messages,
  input: { lines: BagMessageLine[]; total: string | null; name?: string; town?: string },
) {
  const parts = [messages.bagIntro, ...input.lines.map((line) => interpolate(messages.bagLine, line))];
  if (input.total) parts.push("", interpolate(messages.bagTotal, { total: input.total }));
  const name = input.name?.trim();
  const town = input.town?.trim();
  if (name || town) parts.push("");
  if (name) parts.push(interpolate(messages.bagName, { name }));
  if (town) parts.push(interpolate(messages.bagTown, { town }));
  parts.push("", messages.bagOutro);
  return parts.join("\n");
}
