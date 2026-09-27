"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { SaveResult } from "@/lib/data/admin/catalog";
import { deleteService, saveService, setServicePublished } from "@/lib/data/admin/services";
import { tags } from "@/lib/data/tags";
import { fieldErrors, serviceSchema } from "@/lib/validation/admin";

export async function saveServiceAction(payload: unknown): Promise<SaveResult> {
  const parsed = serviceSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const result = await saveService(parsed.data);
  if (result.ok) updateTag(tags.services);
  return result;
}

export async function setServicePublishedAction(id: string, isPublished: boolean) {
  await setServicePublished(id, isPublished);
  updateTag(tags.services);
}

export async function deleteServiceAction(id: string) {
  await deleteService(id);
  updateTag(tags.services);
  redirect("/admin/services");
}
