import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookings, bookingStatuses, messages } from "@/lib/db/schema";

export type BookingStatus = (typeof bookingStatuses)[number];

export async function listBookings(status: BookingStatus | null) {
  await requireAdmin();
  const db = await getDb();
  const [rows, counts] = await Promise.all([
    db.query.bookings.findMany({
      where: status ? eq(bookings.status, status) : undefined,
      orderBy: [desc(bookings.createdAt)],
      limit: 200,
    }),
    db.select({ status: bookings.status, n: count() }).from(bookings).groupBy(bookings.status),
  ]);
  return { rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) as Partial<Record<BookingStatus, number>> };
}

export async function getBooking(id: string) {
  await requireAdmin();
  const db = await getDb();
  return (await db.query.bookings.findFirst({ where: eq(bookings.id, id), with: { service: { columns: { slug: true, durationMinutes: true } } } })) ?? null;
}

export type AdminBooking = NonNullable<Awaited<ReturnType<typeof getBooking>>>;

export async function updateBooking(id: string, changes: { status: BookingStatus; scheduledAt: Date | null; adminNote: string | null }) {
  await requireAdmin();
  const db = await getDb();
  await db.update(bookings).set(changes).where(eq(bookings.id, id));
}

export async function deleteBooking(id: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(bookings).where(eq(bookings.id, id));
}

export async function listMessages() {
  await requireAdmin();
  const db = await getDb();
  return db.query.messages.findMany({ orderBy: [desc(messages.createdAt)], limit: 200 });
}

export async function setMessageRead(id: string, isRead: boolean) {
  await requireAdmin();
  const db = await getDb();
  await db.update(messages).set({ isRead }).where(eq(messages.id, id));
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(messages).where(eq(messages.id, id));
}
