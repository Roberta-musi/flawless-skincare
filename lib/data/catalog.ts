import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { isTranslated } from "@/lib/i18n/localized";
import {
  categories,
  concerns,
  productImages,
  productPairings,
  products,
  productSetItems,
  productVariants,
  reviews,
  skinTypes,
} from "@/lib/db/schema";

export const productTranslatableFields = ["name", "shortDescription", "description", "benefits", "howToUse", "keyIngredients"];

const summaryWith = {
  variants: { orderBy: [asc(productVariants.sortOrder)] },
  images: { orderBy: [asc(productImages.sortOrder)], limit: 1 },
  concerns: { columns: { concernId: true as const } },
  skinTypes: { columns: { skinTypeId: true as const } },
};

type ProductRow = typeof products.$inferSelect;
type SummarySource = ProductRow & {
  variants: (typeof productVariants.$inferSelect)[];
  images: (typeof productImages.$inferSelect)[];
  concerns: { concernId: string }[];
  skinTypes: { skinTypeId: string }[];
};

function toSummary(p: SummarySource) {
  return {
    id: p.id,
    slug: p.slug,
    nameEn: p.nameEn,
    nameFr: p.nameFr,
    shortDescriptionEn: p.shortDescriptionEn,
    shortDescriptionFr: p.shortDescriptionFr,
    categoryId: p.categoryId,
    isFeatured: p.isFeatured,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    translated: isTranslated(p, productTranslatableFields),
    image: p.images[0] ?? null,
    variants: p.variants,
    concernIds: p.concerns.map((c) => c.concernId),
    skinTypeIds: p.skinTypes.map((s) => s.skinTypeId),
  };
}

export type ProductSummary = ReturnType<typeof toSummary>;

export const getCatalog = cache(async () => {
  const db = await getDb();
  const [categoryRows, concernRows, skinTypeRows, productRows] = await Promise.all([
    db.query.categories.findMany({
      where: eq(categories.isPublished, true),
      orderBy: [asc(categories.sortOrder), asc(categories.nameEn)],
    }),
    db.query.concerns.findMany({ orderBy: [asc(concerns.sortOrder), asc(concerns.nameEn)] }),
    db.query.skinTypes.findMany({ orderBy: [asc(skinTypes.sortOrder), asc(skinTypes.nameEn)] }),
    db.query.products.findMany({
      where: eq(products.isPublished, true),
      orderBy: [asc(products.sortOrder), desc(products.createdAt)],
      with: summaryWith,
    }),
  ]);
  const visibleCategoryIds = new Set(categoryRows.map((c) => c.id));
  return {
    categories: categoryRows,
    concerns: concernRows,
    skinTypes: skinTypeRows,
    products: productRows
      .filter((p) => p.categoryId == null || visibleCategoryIds.has(p.categoryId))
      .map(toSummary),
  };
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
export type Category = Catalog["categories"][number];
export type Concern = Catalog["concerns"][number];
export type SkinType = Catalog["skinTypes"][number];

export const getProductBySlug = cache(async (slug: string) => {
  const db = await getDb();
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isPublished, true)),
    with: {
      category: true,
      variants: { orderBy: [asc(productVariants.sortOrder)] },
      images: { orderBy: [asc(productImages.sortOrder)] },
      concerns: { with: { concern: true } },
      skinTypes: { with: { skinType: true } },
      pairings: {
        orderBy: [asc(productPairings.sortOrder)],
        with: { pairedProduct: { with: summaryWith } },
      },
      setItems: {
        orderBy: [asc(productSetItems.sortOrder)],
        with: { itemProduct: { with: summaryWith } },
      },
      reviews: {
        where: eq(reviews.status, "approved"),
        orderBy: [desc(reviews.createdAt)],
      },
    },
  });
  if (!product || (product.category && !product.category.isPublished)) return null;

  const { pairings, setItems, concerns: concernLinks, skinTypes: skinTypeLinks, ...rest } = product;
  return {
    ...rest,
    concerns: concernLinks.map((c) => c.concern),
    skinTypes: skinTypeLinks.map((s) => s.skinType),
    pairings: pairings.filter((p) => p.pairedProduct.isPublished).map((p) => toSummary(p.pairedProduct)),
    setItems: setItems
      .filter((s) => s.itemProduct.isPublished)
      .map((s) => ({ quantity: s.quantity, product: toSummary(s.itemProduct) })),
  };
});

export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
