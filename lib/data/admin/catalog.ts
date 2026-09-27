import "server-only";
import { and, asc, desc, eq, inArray, ne } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import {
  categories,
  concerns,
  productConcerns,
  productImages,
  productPairings,
  products,
  productSetItems,
  productSkinTypes,
  productVariants,
  skinTypes,
} from "@/lib/db/schema";
import { deleteUnreferencedMedia } from "@/lib/media/storage";
import type { CategoryInput, ProductInput, TermInput } from "@/lib/validation/admin";

export type SaveResult = { ok: true; id: string } | { ok: false; errors: Record<string, string> };

async function runBatch(statements: BatchItem<"sqlite">[]) {
  const db = await getDb();
  if (statements.length) await db.batch(statements as [BatchItem<"sqlite">, ...BatchItem<"sqlite">[]]);
}

export async function listAdminProducts() {
  await requireAdmin();
  const db = await getDb();
  return db.query.products.findMany({
    orderBy: [asc(products.sortOrder), desc(products.createdAt)],
    with: {
      category: { columns: { nameEn: true } },
      variants: { orderBy: [asc(productVariants.sortOrder)] },
      images: { orderBy: [asc(productImages.sortOrder)], limit: 1 },
    },
  });
}

export async function getCatalogOptions() {
  await requireAdmin();
  const db = await getDb();
  const [categoryRows, concernRows, skinTypeRows, productRows] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder), asc(categories.nameEn)] }),
    db.query.concerns.findMany({ orderBy: [asc(concerns.sortOrder), asc(concerns.nameEn)] }),
    db.query.skinTypes.findMany({ orderBy: [asc(skinTypes.sortOrder), asc(skinTypes.nameEn)] }),
    db.query.products.findMany({ columns: { id: true, nameEn: true, isPublished: true }, orderBy: [asc(products.nameEn)] }),
  ]);
  return { categories: categoryRows, concerns: concernRows, skinTypes: skinTypeRows, products: productRows };
}

export type CatalogOptions = Awaited<ReturnType<typeof getCatalogOptions>>;

export async function getProductForEdit(id: string) {
  await requireAdmin();
  const db = await getDb();
  const product = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: { orderBy: [asc(productVariants.sortOrder)] },
      images: { orderBy: [asc(productImages.sortOrder)] },
      concerns: { columns: { concernId: true } },
      skinTypes: { columns: { skinTypeId: true } },
      pairings: { orderBy: [asc(productPairings.sortOrder)], columns: { pairedProductId: true } },
      setItems: { orderBy: [asc(productSetItems.sortOrder)], columns: { itemProductId: true, quantity: true } },
    },
  });
  if (!product) return null;
  const { concerns: c, skinTypes: s, pairings, setItems, ...rest } = product;
  return {
    ...rest,
    concernIds: c.map((row) => row.concernId),
    skinTypeIds: s.map((row) => row.skinTypeId),
    pairingIds: pairings.map((row) => row.pairedProductId),
    setItems: setItems.map((row) => ({ productId: row.itemProductId, quantity: row.quantity })),
  };
}

export type ProductForEdit = NonNullable<Awaited<ReturnType<typeof getProductForEdit>>>;

export async function saveProduct(input: ProductInput): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const clash = await db.query.products.findFirst({
    where: input.id ? and(eq(products.slug, input.slug), ne(products.id, input.id)) : eq(products.slug, input.slug),
    columns: { id: true },
  });
  if (clash) return { ok: false, errors: { slug: "Another product already uses this web address." } };

  const existing = input.id
    ? await db.query.products.findFirst({
        where: eq(products.id, input.id),
        with: { variants: { columns: { id: true } }, images: { columns: { id: true, key: true } } },
      })
    : null;
  if (input.id && !existing) return { ok: false, errors: { form: "This product no longer exists." } };

  const id = input.id ?? crypto.randomUUID();
  const { id: _id, variants, images, concernIds, skinTypeIds, pairingIds, setItems, ...fields } = input;
  const statements: BatchItem<"sqlite">[] = [];

  statements.push(existing ? db.update(products).set(fields).where(eq(products.id, id)) : db.insert(products).values({ id, ...fields }));

  const keptVariants = new Set(variants.flatMap((v) => (v.id ? [v.id] : [])));
  const removedVariants = (existing?.variants ?? []).filter((v) => !keptVariants.has(v.id)).map((v) => v.id);
  if (removedVariants.length) statements.push(db.delete(productVariants).where(inArray(productVariants.id, removedVariants)));
  variants.forEach(({ id: variantId, ...variant }, sortOrder) => {
    const known = variantId && existing?.variants.some((v) => v.id === variantId);
    statements.push(
      known
        ? db.update(productVariants).set({ ...variant, sortOrder }).where(eq(productVariants.id, variantId))
        : db.insert(productVariants).values({ ...variant, productId: id, sortOrder }),
    );
  });

  const keptImages = new Set(images.flatMap((i) => (i.id ? [i.id] : [])));
  const removedImages = (existing?.images ?? []).filter((i) => !keptImages.has(i.id));
  if (removedImages.length) statements.push(db.delete(productImages).where(inArray(productImages.id, removedImages.map((i) => i.id))));
  images.forEach(({ id: imageId, ...image }, sortOrder) => {
    const known = imageId && existing?.images.some((i) => i.id === imageId);
    statements.push(
      known
        ? db.update(productImages).set({ ...image, sortOrder }).where(eq(productImages.id, imageId))
        : db.insert(productImages).values({ ...image, productId: id, sortOrder }),
    );
  });

  statements.push(db.delete(productConcerns).where(eq(productConcerns.productId, id)));
  if (concernIds.length) statements.push(db.insert(productConcerns).values(concernIds.map((concernId) => ({ productId: id, concernId }))));
  statements.push(db.delete(productSkinTypes).where(eq(productSkinTypes.productId, id)));
  if (skinTypeIds.length) statements.push(db.insert(productSkinTypes).values(skinTypeIds.map((skinTypeId) => ({ productId: id, skinTypeId }))));
  statements.push(db.delete(productPairings).where(eq(productPairings.productId, id)));
  const pairs = pairingIds.filter((p) => p !== id);
  if (pairs.length) statements.push(db.insert(productPairings).values(pairs.map((pairedProductId, sortOrder) => ({ productId: id, pairedProductId, sortOrder }))));
  statements.push(db.delete(productSetItems).where(eq(productSetItems.setProductId, id)));
  const items = setItems.filter((item) => item.productId !== id);
  if (items.length) {
    statements.push(
      db.insert(productSetItems).values(items.map((item, sortOrder) => ({ setProductId: id, itemProductId: item.productId, quantity: item.quantity, sortOrder }))),
    );
  }

  await runBatch(statements);
  await deleteUnreferencedMedia(removedImages.map((i) => i.key));
  return { ok: true, id };
}

export async function setProductPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  const db = await getDb();
  await db.update(products).set({ isPublished }).where(eq(products.id, id));
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const db = await getDb();
  const images = await db.select({ key: productImages.key }).from(productImages).where(eq(productImages.productId, id));
  await db.delete(products).where(eq(products.id, id));
  await deleteUnreferencedMedia(images.map((i) => i.key));
}

export async function listTaxonomy() {
  await requireAdmin();
  const db = await getDb();
  const [categoryRows, concernRows, skinTypeRows, counts] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.sortOrder), asc(categories.nameEn)] }),
    db.query.concerns.findMany({ orderBy: [asc(concerns.sortOrder), asc(concerns.nameEn)] }),
    db.query.skinTypes.findMany({ orderBy: [asc(skinTypes.sortOrder), asc(skinTypes.nameEn)] }),
    db.select({ categoryId: products.categoryId }).from(products),
  ]);
  const perCategory = new Map<string, number>();
  for (const row of counts) if (row.categoryId) perCategory.set(row.categoryId, (perCategory.get(row.categoryId) ?? 0) + 1);
  return {
    categories: categoryRows.map((c) => ({ ...c, productCount: perCategory.get(c.id) ?? 0 })),
    concerns: concernRows,
    skinTypes: skinTypeRows,
  };
}

export async function saveCategory(input: CategoryInput): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const clash = await db.query.categories.findFirst({
    where: input.id ? and(eq(categories.slug, input.slug), ne(categories.id, input.id)) : eq(categories.slug, input.slug),
    columns: { id: true },
  });
  if (clash) return { ok: false, errors: { slug: "Another category already uses this web address." } };
  const { id: inputId, ...fields } = input;
  const previous = inputId ? await db.query.categories.findFirst({ where: eq(categories.id, inputId), columns: { imageKey: true } }) : null;
  const id = inputId ?? crypto.randomUUID();
  if (previous) await db.update(categories).set(fields).where(eq(categories.id, id));
  else await db.insert(categories).values({ id, ...fields });
  if (previous?.imageKey && previous.imageKey !== fields.imageKey) await deleteUnreferencedMedia([previous.imageKey]);
  return { ok: true, id };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const db = await getDb();
  const row = await db.query.categories.findFirst({ where: eq(categories.id, id), columns: { imageKey: true } });
  await db.delete(categories).where(eq(categories.id, id));
  if (row?.imageKey) await deleteUnreferencedMedia([row.imageKey]);
}

export async function saveTerm(input: TermInput): Promise<SaveResult> {
  await requireAdmin();
  const db = await getDb();
  const table = input.kind === "concern" ? concerns : skinTypes;
  const clash = await db
    .select({ id: table.id })
    .from(table)
    .where(input.id ? and(eq(table.slug, input.slug), ne(table.id, input.id)) : eq(table.slug, input.slug));
  if (clash.length) return { ok: false, errors: { slug: "This web address is already used." } };
  const { id: inputId, kind: _kind, ...fields } = input;
  const id = inputId ?? crypto.randomUUID();
  if (inputId) await db.update(table).set(fields).where(eq(table.id, id));
  else await db.insert(table).values({ id, ...fields });
  return { ok: true, id };
}

export async function deleteTerm(kind: TermInput["kind"], id: string) {
  await requireAdmin();
  const db = await getDb();
  const table = kind === "concern" ? concerns : skinTypes;
  await db.delete(table).where(eq(table.id, id));
}
