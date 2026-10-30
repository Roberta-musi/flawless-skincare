"use server";

import type { z } from "zod";
import { redirect } from "next/navigation";
import {
  deleteCategory,
  deleteProduct,
  deleteTerm,
  type SaveResult,
  saveCategory,
  saveProduct,
  saveTerm,
  setProductPublished,
} from "@/lib/data/admin/catalog";
import { revalidatePublicSite } from "@/lib/revalidate";
import { categorySchema, fieldErrors, productSchema, termSchema } from "@/lib/validation/admin";

function parse<T>(schema: z.ZodType<T>, payload: unknown) {
  const result = schema.safeParse(payload);
  return result.success ? ({ ok: true, data: result.data } as const) : ({ ok: false, errors: fieldErrors(result.error) } as const);
}

export async function saveProductAction(payload: unknown): Promise<SaveResult> {
  const parsed = parse(productSchema, payload);
  if (!parsed.ok) return parsed;
  const result = await saveProduct(parsed.data);
  if (result.ok) revalidatePublicSite();
  return result;
}

export async function setProductPublishedAction(id: string, isPublished: boolean) {
  await setProductPublished(id, isPublished);
  revalidatePublicSite();
}

export async function deleteProductAction(id: string) {
  await deleteProduct(id);
  revalidatePublicSite();
  redirect("/admin/products");
}

export async function saveCategoryAction(payload: unknown): Promise<SaveResult> {
  const parsed = parse(categorySchema, payload);
  if (!parsed.ok) return parsed;
  const result = await saveCategory(parsed.data);
  if (result.ok) revalidatePublicSite();
  return result;
}

export async function deleteCategoryAction(id: string) {
  await deleteCategory(id);
  revalidatePublicSite();
}

export async function saveTermAction(payload: unknown): Promise<SaveResult> {
  const parsed = parse(termSchema, payload);
  if (!parsed.ok) return parsed;
  const result = await saveTerm(parsed.data);
  if (result.ok) revalidatePublicSite();
  return result;
}

export async function deleteTermAction(kind: "concern" | "skinType", id: string) {
  await deleteTerm(kind, id);
  revalidatePublicSite();
}
