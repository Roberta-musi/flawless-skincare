import { formatDate } from "@/lib/format";
import { interpolate } from "@/lib/i18n/localized";
import type { PreferredSlot } from "@/lib/db/schema";
import { normalizeWhatsAppNumber, whatsappUrl } from "@/lib/whatsapp";

const templates = {
  en: {
    confirm: "Hello {name}, this is Flawless Skin Care. Your appointment for {service} is confirmed for {when}. We look forward to seeing you!",
    decline: "Hello {name}, this is Flawless Skin Care about your request for {service}. Unfortunately we can't make your preferred times. Would another day suit you?",
    general: "Hello {name}, this is Flawless Skin Care about your booking request for {service}.",
    windows: { morning: "in the morning", afternoon: "in the afternoon", evening: "in the evening" },
  },
  fr: {
    confirm: "Bonjour {name}, ici Flawless Skin Care. Votre rendez-vous pour {service} est confirmé pour le {when}. Au plaisir de vous accueillir !",
    decline: "Bonjour {name}, ici Flawless Skin Care au sujet de votre demande pour {service}. Malheureusement, vos créneaux ne sont pas disponibles. Un autre jour vous conviendrait-il ?",
    general: "Bonjour {name}, ici Flawless Skin Care au sujet de votre demande de rendez-vous pour {service}.",
    windows: { morning: "le matin", afternoon: "l'après-midi", evening: "le soir" },
  },
} as const;

type Booking = {
  name: string;
  phone: string;
  serviceName: string;
  locale: "en" | "fr";
  scheduledAt: Date | null;
  preferredSlots: PreferredSlot[];
};

export function describeSlot(slot: PreferredSlot, locale: "en" | "fr") {
  return `${formatDate(slot.date, locale, { weekday: "long", day: "numeric", month: "long" })} ${templates[locale].windows[slot.window]}`;
}

export function appointmentLabel(booking: Pick<Booking, "scheduledAt" | "preferredSlots" | "locale">) {
  if (booking.scheduledAt) {
    return formatDate(booking.scheduledAt, booking.locale, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
  }
  return describeSlot(booking.preferredSlots[0], booking.locale);
}

export function bookingReplyUrl(booking: Booking, kind: "confirm" | "decline" | "general") {
  const first = booking.name.split(" ")[0];
  const message = interpolate(templates[booking.locale][kind], { name: first, service: booking.serviceName, when: appointmentLabel(booking) });
  const number = normalizeWhatsAppNumber(booking.phone);
  return number ? whatsappUrl(number, message) : null;
}
