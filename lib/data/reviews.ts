import "server-only";
import { desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { tags } from "./tags";

export async function getApprovedReviews() {
  "use cache";
  cacheTag(tags.reviews, tags.catalog, tags.services);
  cacheLife("max");
  const db = await getDb();
  return db.query.reviews.findMany({
    where: eq(reviews.status, "approved"),
    orderBy: [desc(reviews.isFeatured), desc(reviews.createdAt)],
    with: {
      product: { columns: { slug: true, nameEn: true, nameFr: true, isPublished: true } },
      service: { columns: { slug: true, nameEn: true, nameFr: true, isPublished: true } },
    },
  });
}

export type PublicReview = Awaited<ReturnType<typeof getApprovedReviews>>[number];
