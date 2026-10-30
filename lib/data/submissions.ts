import "server-only";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { bookings, messages, products, reviews, services } from "@/lib/db/schema";
import type { BookingInput, MessageInput, ReviewInput } from "@/lib/validation/forms";

export async function createBooking(input: BookingInput) {
  const db = await getDb();
  const service = await db.query.services.findFirst({
    where: and(eq(services.slug, input.service), eq(services.isPublished, true)),
    columns: { id: true, nameEn: true, nameFr: true },
  });
  if (!service) return null;
  const now = new Date();
  const [row] = await db
    .insert(bookings)
    .values({
      serviceId: service.id,
      serviceName: service.nameEn,
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      preferredSlots: input.slots,
      firstVisit: input.firstVisit,
      notes: input.notes || null,
      locale: input.locale,
      policyAcceptedAt: now,
      consentAt: now,
    })
    .returning({ id: bookings.id });
  return { id: row.id, service };
}

export async function createReview(input: ReviewInput) {
  const db = await getDb();
  const [kind, slug] = input.about ? input.about.split(":") : [null, null];
  let productId: string | null = null;
  let serviceId: string | null = null;
  if (kind === "product" && slug) {
    const row = await db.query.products.findFirst({ where: and(eq(products.slug, slug), eq(products.isPublished, true)), columns: { id: true } });
    productId = row?.id ?? null;
  }
  if (kind === "service" && slug) {
    const row = await db.query.services.findFirst({ where: and(eq(services.slug, slug), eq(services.isPublished, true)), columns: { id: true } });
    serviceId = row?.id ?? null;
  }
  const [row] = await db
    .insert(reviews)
    .values({
      name: input.name,
      location: input.location || null,
      rating: input.rating,
      body: input.body,
      productId,
      serviceId,
      source: "website",
      status: "pending",
      locale: input.locale,
      consentAt: new Date(),
    })
    .returning({ id: reviews.id });
  return row.id;
}

export async function createMessage(input: MessageInput) {
  const db = await getDb();
  const [row] = await db
    .insert(messages)
    .values({ ...input, subject: input.subject || null, consentAt: new Date() })
    .returning({ id: messages.id });
  return row.id;
}
