import "server-only";
import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { brandProfile, contentPages, faqs, settings } from "@/lib/db/schema";

export const getSettings = cache(async () => {
  const db = await getDb();
  const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  if (!row) throw new Error("Settings row missing; run the database migrations.");
  return row;
});

export type Settings = Awaited<ReturnType<typeof getSettings>>;

export const getBrandProfile = cache(async () => {
  const db = await getDb();
  const row = await db.query.brandProfile.findFirst({ where: eq(brandProfile.id, 1) });
  if (!row) throw new Error("Brand profile row missing; run the database migrations.");
  return row;
});

export type BrandProfile = Awaited<ReturnType<typeof getBrandProfile>>;

export const getFaqs = cache(async () => {
  const db = await getDb();
  return db.query.faqs.findMany({ where: eq(faqs.isPublished, true), orderBy: [asc(faqs.sortOrder)] });
});

export type Faq = Awaited<ReturnType<typeof getFaqs>>[number];

export const getContentPage = cache(async (slug: (typeof contentPages.$inferSelect)["slug"]) => {
  const db = await getDb();
  return db.query.contentPages.findFirst({ where: eq(contentPages.slug, slug) });
});
