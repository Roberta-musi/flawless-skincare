import { z } from "zod";
import { todayInCameroon } from "@/lib/format";
import { toInternationalPhone } from "@/lib/whatsapp";

export type FormErrorCode = "required" | "invalidEmail" | "invalidPhone" | "tooLong" | "mustAccept" | "invalidDate" | "captcha" | "failed";
export type FieldErrors = Record<string, FormErrorCode>;
export type Parsed<T> = { ok: true; data: T } | { ok: false; errors: FieldErrors };

const locale = z.enum(["en", "fr"]);
const accepted = z.literal("on", { error: "mustAccept" });
const optionalEmail = z.union([z.literal(""), z.email({ error: "invalidEmail" })]);

function toErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in errors)) errors[key] = (issue.message as FormErrorCode) || "required";
  }
  return errors;
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

const bookingSchema = z.object({
  locale,
  service: z.string().min(1, { error: "required" }),
  slots: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { error: "invalidDate" }),
        window: z.enum(["morning", "afternoon", "evening"], { error: "required" }),
      }),
    )
    .min(1, { error: "required" })
    .max(3),
  name: z.string().trim().min(2, { error: "required" }).max(100, { error: "tooLong" }),
  dialCode: z.string().regex(/^\d{1,4}$/, { error: "invalidPhone" }),
  phone: z.string().trim().min(1, { error: "required" }).max(30, { error: "invalidPhone" }),
  email: optionalEmail,
  firstVisit: z.enum(["yes", "no"]),
  notes: z.string().trim().max(1000, { error: "tooLong" }),
  policy: accepted,
  consent: accepted,
});

export type BookingInput = Omit<z.infer<typeof bookingSchema>, "dialCode" | "policy" | "consent" | "firstVisit"> & {
  firstVisit: boolean;
};

export function parseBooking(formData: FormData, today = todayInCameroon()): Parsed<BookingInput> {
  const dates = formData.getAll("slotDate").map(String);
  const windows = formData.getAll("slotWindow").map(String);
  const result = bookingSchema.safeParse({
    locale: text(formData, "locale"),
    service: text(formData, "service"),
    slots: dates.filter(Boolean).map((date, i) => ({ date, window: windows[i] })),
    name: text(formData, "name"),
    dialCode: text(formData, "dialCode"),
    phone: text(formData, "phone"),
    email: text(formData, "email").trim(),
    firstVisit: text(formData, "firstVisit") || "yes",
    notes: text(formData, "notes"),
    policy: text(formData, "policy"),
    consent: text(formData, "consent"),
  });
  if (!result.success) return { ok: false, errors: toErrors(result.error) };

  const { dialCode, policy: _policy, consent: _consent, firstVisit, ...data } = result.data;
  const phone = toInternationalPhone(dialCode, data.phone);
  const errors: FieldErrors = {};
  if (!phone) errors.phone = "invalidPhone";
  if (data.slots.some((slot) => slot.date < today)) errors.slots = "invalidDate";
  if (Object.keys(errors).length) return { ok: false, errors };

  return { ok: true, data: { ...data, phone: phone!, firstVisit: firstVisit === "yes" } };
}

const reviewSchema = z.object({
  locale,
  name: z.string().trim().min(2, { error: "required" }).max(80, { error: "tooLong" }),
  location: z.string().trim().max(80, { error: "tooLong" }),
  rating: z.enum(["", "1", "2", "3", "4", "5"]),
  body: z.string().trim().min(10, { error: "required" }).max(2000, { error: "tooLong" }),
  about: z.string().regex(/^(|product:[\w-]+|service:[\w-]+)$/),
  consent: accepted,
});

export type ReviewInput = { locale: "en" | "fr"; name: string; location: string; rating: number | null; body: string; about: string };

export function parseReview(formData: FormData): Parsed<ReviewInput> {
  const result = reviewSchema.safeParse({
    locale: text(formData, "locale"),
    name: text(formData, "name"),
    location: text(formData, "location"),
    rating: text(formData, "rating"),
    body: text(formData, "body"),
    about: text(formData, "about"),
    consent: text(formData, "consent"),
  });
  if (!result.success) return { ok: false, errors: toErrors(result.error) };
  const { consent: _consent, rating, ...data } = result.data;
  return { ok: true, data: { ...data, rating: rating ? Number(rating) : null } };
}

const messageSchema = z.object({
  locale,
  name: z.string().trim().min(2, { error: "required" }).max(100, { error: "tooLong" }),
  contact: z.string().trim().min(5, { error: "required" }).max(120, { error: "tooLong" }),
  subject: z.string().trim().max(150, { error: "tooLong" }),
  body: z.string().trim().min(5, { error: "required" }).max(3000, { error: "tooLong" }),
  consent: accepted,
});

export type MessageInput = Omit<z.infer<typeof messageSchema>, "consent">;

export function parseMessage(formData: FormData): Parsed<MessageInput> {
  const result = messageSchema.safeParse({
    locale: text(formData, "locale"),
    name: text(formData, "name"),
    contact: text(formData, "contact"),
    subject: text(formData, "subject"),
    body: text(formData, "body"),
    consent: text(formData, "consent"),
  });
  if (!result.success) return { ok: false, errors: toErrors(result.error) };
  const { consent: _consent, ...data } = result.data;
  return { ok: true, data };
}

export function isSpam(formData: FormData) {
  return text(formData, "company").trim() !== "";
}
