import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { reviews, services } from "@/lib/db/schema";
import { tags } from "./tags";

export async function getServices() {
  "use cache";
  cacheTag(tags.services);
  cacheLife("max");
  const db = await getDb();
  return db.query.services.findMany({
    where: eq(services.isPublished, true),
    orderBy: [asc(services.sortOrder), asc(services.nameEn)],
  });
}

export type Service = Awaited<ReturnType<typeof getServices>>[number];

export async function getServiceBySlug(slug: string) {
  "use cache";
  cacheTag(tags.services, tags.reviews);
  cacheLife("max");
  const db = await getDb();
  const service = await db.query.services.findFirst({
    where: and(eq(services.slug, slug), eq(services.isPublished, true)),
    with: {
      reviews: { where: eq(reviews.status, "approved"), orderBy: [desc(reviews.createdAt)] },
    },
  });
  return service ?? null;
}

export type ServiceDetail = NonNullable<Awaited<ReturnType<typeof getServiceBySlug>>>;
