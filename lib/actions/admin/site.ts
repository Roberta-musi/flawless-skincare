"use server";

import { deleteFaq, saveBrand, saveContentPage, saveFaq, saveSettings } from "@/lib/data/admin/site";
import { revalidatePublicSite } from "@/lib/revalidate";
import { brandSchema, contentPageSchema, faqSchema, fieldErrors, settingsSchema } from "@/lib/validation/admin";

type Result = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveSettingsAction(payload: unknown): Promise<Result> {
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveSettings(parsed.data);
  revalidatePublicSite();
  return { ok: true };
}

export async function saveBrandAction(payload: unknown): Promise<Result> {
  const parsed = brandSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveBrand(parsed.data);
  revalidatePublicSite();
  return { ok: true };
}

export async function saveFaqAction(payload: unknown): Promise<Result> {
  const parsed = faqSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveFaq(parsed.data);
  revalidatePublicSite();
  return { ok: true };
}

export async function deleteFaqAction(id: string) {
  await deleteFaq(id);
  revalidatePublicSite();
}

export async function saveContentPageAction(payload: unknown): Promise<Result> {
  const parsed = contentPageSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveContentPage(parsed.data);
  revalidatePublicSite();
  return { ok: true };
}
