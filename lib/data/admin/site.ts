import "server-only";
import { asc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { brandProfile, contentPages, faqs, settings } from "@/lib/db/schema";
import { deleteUnreferencedMedia } from "@/lib/media/storage";
import type { BrandInput, ContentPageInput, FaqInput, SettingsInput } from "@/lib/validation/admin";

export async function getSettingsForEdit() {
  await requireAdmin();
  const db = await getDb();
  return (await db.query.settings.findFirst({ where: eq(settings.id, 1) }))!;
}

export type SettingsForEdit = Awaited<ReturnType<typeof getSettingsForEdit>>;

export async function saveSettings(input: SettingsInput) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.settings.findFirst({ where: eq(settings.id, 1), columns: { shopPhotoKey: true } });
  const socials = Object.fromEntries(Object.entries(input.socials).filter(([, url]) => url));
  await db.update(settings).set({ ...input, socials }).where(eq(settings.id, 1));
  if (previous?.shopPhotoKey && previous.shopPhotoKey !== input.shopPhotoKey) await deleteUnreferencedMedia([previous.shopPhotoKey]);
}

export async function getBrandForEdit() {
  await requireAdmin();
  const db = await getDb();
  return (await db.query.brandProfile.findFirst({ where: eq(brandProfile.id, 1) }))!;
}

export type BrandForEdit = Awaited<ReturnType<typeof getBrandForEdit>>;

export async function saveBrand(input: BrandInput) {
  await requireAdmin();
  const db = await getDb();
  const previous = await db.query.brandProfile.findFirst({ where: eq(brandProfile.id, 1), columns: { portraitKey: true } });
  const ceoSocials = Object.fromEntries(Object.entries(input.ceoSocials).filter(([, url]) => url));
  await db.update(brandProfile).set({ ...input, ceoSocials }).where(eq(brandProfile.id, 1));
  if (previous?.portraitKey && previous.portraitKey !== input.portraitKey) await deleteUnreferencedMedia([previous.portraitKey]);
}

export async function listContentForEdit() {
  await requireAdmin();
  const db = await getDb();
  const [faqRows, pageRows] = await Promise.all([
    db.query.faqs.findMany({ orderBy: [asc(faqs.sortOrder)] }),
    db.query.contentPages.findMany(),
  ]);
  return { faqs: faqRows, pages: pageRows };
}

export async function saveFaq(input: FaqInput) {
  await requireAdmin();
  const db = await getDb();
  const { id, ...fields } = input;
  if (id) await db.update(faqs).set(fields).where(eq(faqs.id, id));
  else await db.insert(faqs).values(fields);
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  const db = await getDb();
  await db.delete(faqs).where(eq(faqs.id, id));
}

export async function saveContentPage(input: ContentPageInput) {
  await requireAdmin();
  const db = await getDb();
  const { slug, ...fields } = input;
  await db.update(contentPages).set(fields).where(eq(contentPages.slug, slug));
}
