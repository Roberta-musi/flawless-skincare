import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { brandProfile, categories, productImages, services, settings } from "@/lib/db/schema";
import { allVariantKeys } from "./url";

async function bucket() {
  const { env } = await getCloudflareContext({ async: true });
  return env.MEDIA;
}

export async function putMedia(key: string, body: ArrayBuffer, contentType: string) {
  await (await bucket()).put(key, body, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
}

export async function deleteUnreferencedMedia(keys: string[]) {
  const unique = [...new Set(keys)];
  if (!unique.length) return;
  const db = await getDb();
  const [images, cats, svc, site, brand] = await Promise.all([
    db.select({ key: productImages.key }).from(productImages).where(inArray(productImages.key, unique)),
    db.select({ key: categories.imageKey }).from(categories).where(inArray(categories.imageKey, unique)),
    db.select({ key: services.imageKey }).from(services).where(inArray(services.imageKey, unique)),
    db.select({ key: settings.shopPhotoKey }).from(settings).where(eq(settings.id, 1)),
    db.select({ key: brandProfile.portraitKey }).from(brandProfile).where(eq(brandProfile.id, 1)),
  ]);
  const inUse = new Set([...images, ...cats, ...svc, ...site, ...brand].map((row) => row.key));
  const orphaned = unique.filter((key) => !inUse.has(key));
  if (orphaned.length) await (await bucket()).delete(orphaned.flatMap(allVariantKeys));
}
