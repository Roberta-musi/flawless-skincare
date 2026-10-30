"use server";

import { redirect } from "next/navigation";
import type { SaveResult } from "@/lib/data/admin/catalog";
import { deleteService, saveService, setServicePublished } from "@/lib/data/admin/services";
import { revalidatePublicSite } from "@/lib/revalidate";
import { fieldErrors, serviceSchema } from "@/lib/validation/admin";

export async function saveServiceAction(payload: unknown): Promise<SaveResult> {
  const parsed = serviceSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const result = await saveService(parsed.data);
  if (result.ok) revalidatePublicSite();
  return result;
}

export async function setServicePublishedAction(id: string, isPublished: boolean) {
  await setServicePublished(id, isPublished);
  revalidatePublicSite();
}

export async function deleteServiceAction(id: string) {
  await deleteService(id);
  revalidatePublicSite();
  redirect("/admin/services");
}
