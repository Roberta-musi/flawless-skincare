"use server";

import { updateTag } from "next/cache";
import { deleteFaq, saveBrand, saveContentPage, saveFaq, saveSettings } from "@/lib/data/admin/site";
import { tags } from "@/lib/data/tags";
import { brandSchema, contentPageSchema, faqSchema, fieldErrors, settingsSchema } from "@/lib/validation/admin";

type Result = { ok: true } | { ok: false; errors: Record<string, string> };

export async function saveSettingsAction(payload: unknown): Promise<Result> {
  const parsed = settingsSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveSettings(parsed.data);
  updateTag(tags.settings);
  return { ok: true };
}

export async function saveBrandAction(payload: unknown): Promise<Result> {
  const parsed = brandSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveBrand(parsed.data);
  updateTag(tags.brand);
  return { ok: true };
}

export async function saveFaqAction(payload: unknown): Promise<Result> {
  const parsed = faqSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveFaq(parsed.data);
  updateTag(tags.faqs);
  return { ok: true };
}

export async function deleteFaqAction(id: string) {
  await deleteFaq(id);
  updateTag(tags.faqs);
}

export async function saveContentPageAction(payload: unknown): Promise<Result> {
  const parsed = contentPageSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await saveContentPage(parsed.data);
  updateTag(tags.pages);
  return { ok: true };
}
