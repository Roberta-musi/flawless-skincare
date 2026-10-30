"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { adminEntryUrl } from "@/lib/admin-links";
import { createBooking, createMessage, createReview } from "@/lib/data/submissions";
import { getSettings } from "@/lib/data/site";
import { notificationRecipient, sendEmail } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { dictionaries } from "@/lib/i18n/server";
import { interpolate, localized } from "@/lib/i18n/localized";
import { businessWhatsAppUrl } from "@/lib/site";
import { verifyTurnstile } from "@/lib/turnstile";
import { type FieldErrors, isSpam, parseBooking, parseMessage, parseReview } from "@/lib/validation/forms";

export type FormState<S = object> = { status: "idle" } | { status: "error"; errors: FieldErrors } | ({ status: "success" } & S);

export type BookingSuccess = { name: string; service: string; whatsappUrl: string | null };

async function guard(formData: FormData): Promise<FieldErrors | "spam" | null> {
  if (isSpam(formData)) return "spam";
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-forwarded-for");
  if (!(await verifyTurnstile(formData, ip))) return { form: "captcha" };
  return null;
}

function notify(subject: string, lines: (string | null | false)[]) {
  after(async () => {
    const settings = await getSettings();
    const to = notificationRecipient(settings.email);
    if (!to) return;
    await sendEmail({ to, subject, text: lines.filter((line) => typeof line === "string").join("\n") });
  });
}

export async function submitBooking(_: FormState<BookingSuccess>, formData: FormData): Promise<FormState<BookingSuccess>> {
  const blocked = await guard(formData);
  if (blocked === "spam") return { status: "success", name: "", service: "", whatsappUrl: null };
  if (blocked) return { status: "error", errors: blocked };

  const parsed = parseBooking(formData);
  if (!parsed.ok) return { status: "error", errors: parsed.errors };
  const created = await createBooking(parsed.data);
  if (!created) return { status: "error", errors: { service: "required" } };

  const { locale, name, phone, email, slots, notes, firstVisit } = parsed.data;
  const dict = dictionaries[locale];
  const service = localized(created.service, "name", locale);
  const settings = await getSettings();

  notify(`New booking request: ${created.service.nameEn} – ${name}`, [
    `Service: ${created.service.nameEn}`,
    `Name: ${name}`,
    `WhatsApp: ${phone}`,
    email ? `Email: ${email}` : false,
    `First visit: ${firstVisit ? "yes" : "no"}`,
    "",
    "Preferred times:",
    ...slots.map((s) => `• ${formatDate(s.date, "en", { weekday: "long", day: "numeric", month: "long" })}, ${s.window}`),
    notes ? "" : false,
    notes ? `Notes: ${notes}` : false,
    "",
    `Open in admin: ${adminEntryUrl(`/admin/bookings/${created.id}`)}`,
  ]);

  return {
    status: "success",
    name,
    service,
    whatsappUrl: businessWhatsAppUrl(settings, interpolate(dict.whatsapp.messages.bookingFollowUp, { service, name })),
  };
}

export async function submitReview(_: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData);
  if (blocked === "spam") return { status: "success" };
  if (blocked) return { status: "error", errors: blocked };

  const parsed = parseReview(formData);
  if (!parsed.ok) return { status: "error", errors: parsed.errors };
  const id = await createReview(parsed.data);

  notify(`New review to approve from ${parsed.data.name}`, [
    parsed.data.rating != null ? `Rating: ${parsed.data.rating}/5` : false,
    `“${parsed.data.body}”`,
    "",
    `Approve or reject: ${adminEntryUrl(`/admin/reviews?highlight=${id}`)}`,
  ]);
  return { status: "success" };
}

export async function submitMessage(_: FormState, formData: FormData): Promise<FormState> {
  const blocked = await guard(formData);
  if (blocked === "spam") return { status: "success" };
  if (blocked) return { status: "error", errors: blocked };

  const parsed = parseMessage(formData);
  if (!parsed.ok) return { status: "error", errors: parsed.errors };
  await createMessage(parsed.data);

  notify(`New message from ${parsed.data.name}${parsed.data.subject ? `: ${parsed.data.subject}` : ""}`, [
    `From: ${parsed.data.name} (${parsed.data.contact})`,
    "",
    parsed.data.body,
    "",
    `Inbox: ${adminEntryUrl("/admin/messages")}`,
  ]);
  return { status: "success" };
}
