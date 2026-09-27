import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookings, messages, products, reviews, services } from "@/lib/db/schema";

export async function getAdminCounts() {
  await requireAdmin();
  const db = await getDb();
  const [[pendingBookings], [pendingReviews], [unreadMessages], [publishedProducts], [publishedServices]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, "pending")),
    db.select({ n: count() }).from(reviews).where(eq(reviews.status, "pending")),
    db.select({ n: count() }).from(messages).where(eq(messages.isRead, false)),
    db.select({ n: count() }).from(products).where(eq(products.isPublished, true)),
    db.select({ n: count() }).from(services).where(eq(services.isPublished, true)),
  ]);
  return {
    pendingBookings: pendingBookings.n,
    pendingReviews: pendingReviews.n,
    unreadMessages: unreadMessages.n,
    publishedProducts: publishedProducts.n,
    publishedServices: publishedServices.n,
  };
}

export type AdminCounts = Awaited<ReturnType<typeof getAdminCounts>>;

export async function getDashboard() {
  await requireAdmin();
  const db = await getDb();
  const [recentBookings, pendingReviews, recentMessages] = await Promise.all([
    db.query.bookings.findMany({ orderBy: [desc(bookings.createdAt)], limit: 5 }),
    db.query.reviews.findMany({ where: eq(reviews.status, "pending"), orderBy: [desc(reviews.createdAt)], limit: 3 }),
    db.query.messages.findMany({ where: eq(messages.isRead, false), orderBy: [desc(messages.createdAt)], limit: 3 }),
  ]);
  return { recentBookings, pendingReviews, recentMessages };
}
