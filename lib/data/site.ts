import "server-only";
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/lib/db";
import { brandProfile, contentPages, faqs, settings } from "@/lib/db/schema";
import { tags } from "./tags";

export async function getSettings() {
  "use cache";
  cacheTag(tags.settings);
  cacheLife("max");
  const db = await getDb();
  const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  if (!row) throw new Error("Settings row missing; run the database migrations.");
  return row;
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;

export async function getBrandProfile() {
  "use cache";
  cacheTag(tags.brand);
  cacheLife("max");
  const db = await getDb();
  const row = await db.query.brandProfile.findFirst({ where: eq(brandProfile.id, 1) });
  if (!row) throw new Error("Brand profile row missing; run the database migrations.");
  return row;
}

export type BrandProfile = Awaited<ReturnType<typeof getBrandProfile>>;

export async function getFaqs() {
  "use cache";
  cacheTag(tags.faqs);
  cacheLife("max");
  const db = await getDb();
  return db.query.faqs.findMany({ where: eq(faqs.isPublished, true), orderBy: [asc(faqs.sortOrder)] });
}

export type Faq = Awaited<ReturnType<typeof getFaqs>>[number];

export async function getContentPage(slug: (typeof contentPages.$inferSelect)["slug"]) {
  "use cache";
  cacheTag(tags.pages);
  cacheLife("max");
  const db = await getDb();
  return db.query.contentPages.findFirst({ where: eq(contentPages.slug, slug) });
}
