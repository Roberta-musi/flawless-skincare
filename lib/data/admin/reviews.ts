import "server-only";
import { count, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reviews, reviewStatuses } from "@/lib/db/schema";

export type ReviewStatus = (typeof reviewStatuses)[number];

export async function listReviews(status: ReviewStatus | null) {
  await requireAdmin();
  const db = await getDb();
  const [rows, counts] = await Promise.all([
    db.query.reviews.findMany({
      where: status ? eq(reviews.status, status) : undefined,
      orderBy: [desc(reviews.createdAt)],
      limit: 300,
      with: { product: { columns: { nameEn: true } }, service: { columns: { nameEn: true } } },
    }),
    db.select({ status: reviews.status, n: count() }).from(reviews).groupBy(reviews.status),
  ]);
  return { rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) as Partial<Record<ReviewStatus, number>> };
}

export type AdminReview = Awaited<ReturnType<typeof listReviews>>["rows"][number];

export async function moderateReview(id: string, changes: { status?: ReviewStatus; isFeatured?: boolean }) {
  await requireAdmin();
  const db = await getDb();
  await db.update(reviews).set(changes).where(eq(reviews.id, id));
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(reviews).where(eq(reviews.id, id));
}

export async function addReview(input: {
  name: string;
  location: string | null;
  rating: number | null;
  body: string;
  source: "whatsapp" | "in_store";
  productId: string | null;
  serviceId: string | null;
  locale: "en" | "fr";
}) {
  await requireAdmin();
  const db = await getDb();
  const [row] = await db
    .insert(reviews)
    .values({ ...input, status: "approved", consentAt: new Date() })
    .returning({ id: reviews.id });
  return row.id;
}
