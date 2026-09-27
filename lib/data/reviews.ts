import "server-only";
import { desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";

export const getApprovedReviews = cache(async () => {
  const db = await getDb();
  return db.query.reviews.findMany({
    where: eq(reviews.status, "approved"),
    orderBy: [desc(reviews.isFeatured), desc(reviews.createdAt)],
    with: {
      product: { columns: { slug: true, nameEn: true, nameFr: true, isPublished: true } },
      service: { columns: { slug: true, nameEn: true, nameFr: true, isPublished: true } },
    },
  });
});

export type PublicReview = Awaited<ReturnType<typeof getApprovedReviews>>[number];
