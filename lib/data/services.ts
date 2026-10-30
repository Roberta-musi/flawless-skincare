import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { reviews, services } from "@/lib/db/schema";

export const serviceTranslatableFields = ["name", "shortDescription", "description", "whatToExpect", "preparation", "aftercare"];

export const getServices = cache(async () => {
  const db = await getDb();
  return db.query.services.findMany({
    where: eq(services.isPublished, true),
    orderBy: [asc(services.sortOrder), asc(services.nameEn)],
  });
});

export type Service = Awaited<ReturnType<typeof getServices>>[number];

export const getServiceBySlug = cache(async (slug: string) => {
  const db = await getDb();
  const service = await db.query.services.findFirst({
    where: and(eq(services.slug, slug), eq(services.isPublished, true)),
    with: {
      reviews: { where: eq(reviews.status, "approved"), orderBy: [desc(reviews.createdAt)] },
    },
  });
  return service ?? null;
});

export type ServiceDetail = NonNullable<Awaited<ReturnType<typeof getServiceBySlug>>>;
