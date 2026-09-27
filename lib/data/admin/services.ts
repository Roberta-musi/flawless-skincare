import "server-only";
import { and, asc, eq, ne } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { deleteUnreferencedMedia } from "@/lib/media/storage";
import type { ServiceInput } from "@/lib/validation/admin";
import type { SaveResult } from "./catalog";

export async function listAdminServices() {
  await requireAdmin();
  const db = await getDb();
  return db.query.services.findMany({ orderBy: [asc(services.sortOrder), asc(services.nameEn)] });
}

export async function getServiceForEdit(id: string) {
  await requireAdmin();
  const db = await getDb();
  return (await db.query.services.findFirst({ where: eq(services.id, id) })) ?? null;
}

export type ServiceForEdit = NonNullable<Awaited<ReturnType<typeof getServiceForEdit>>>;

export async function saveService(input: ServiceInput): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const clash = await db.query.services.findFirst({
    where: input.id ? and(eq(services.slug, input.slug), ne(services.id, input.id)) : eq(services.slug, input.slug),
    columns: { id: true },
  });
  if (clash) return { ok: false, errors: { slug: "Another service already uses this web address." } };

  const { id: inputId, ...fields } = input;
  const previous = inputId ? await db.query.services.findFirst({ where: eq(services.id, inputId), columns: { imageKey: true } }) : null;
  if (inputId && !previous) return { ok: false, errors: { form: "This service no longer exists." } };
  const id = inputId ?? crypto.randomUUID();
  if (previous) await db.update(services).set(fields).where(eq(services.id, id));
  else await db.insert(services).values({ id, ...fields });
  if (previous?.imageKey && previous.imageKey !== fields.imageKey) await deleteUnreferencedMedia([previous.imageKey]);
  return { ok: true, id };
}

export async function setServicePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  const db = await getDb();
  await db.update(services).set({ isPublished }).where(eq(services.id, id));
}

export async function deleteService(id: string) {
  await requireAdmin();
  const db = await getDb();
  const row = await db.query.services.findFirst({ where: eq(services.id, id), columns: { imageKey: true } });
  await db.delete(services).where(eq(services.id, id));
  if (row?.imageKey) await deleteUnreferencedMedia([row.imageKey]);
}
