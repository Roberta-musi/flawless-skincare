import type { Locale } from "@/lib/i18n/config";
import { localized } from "@/lib/i18n/localized";

export type VariantLike = { priceXaf: number | null; compareAtPriceXaf: number | null; inStock: boolean };

export function pricedVariants<V extends VariantLike>(variants: V[]) {
  return variants.filter((v): v is V & { priceXaf: number } => v.priceXaf != null);
}

export function lowestPrice(variants: VariantLike[]) {
  const prices = pricedVariants(variants).map((v) => v.priceXaf);
  return prices.length ? Math.min(...prices) : null;
}

export function hasPriceRange(variants: VariantLike[]) {
  return new Set(pricedVariants(variants).map((v) => v.priceXaf)).size > 1;
}

export function isInStock(variants: VariantLike[]) {
  return variants.length === 0 || variants.some((v) => v.inStock);
}

export function isOnSale(variant: VariantLike) {
  return variant.priceXaf != null && variant.compareAtPriceXaf != null && variant.compareAtPriceXaf > variant.priceXaf;
}

export const sortOptions = ["featured", "newest", "priceAsc", "priceDesc"] as const;
export type SortOption = (typeof sortOptions)[number];

export type ShopFilters = {
  categoryId?: string | null;
  concernId?: string | null;
  skinTypeId?: string | null;
  query?: string;
  sort?: SortOption;
};

type Filterable = {
  nameEn: string;
  nameFr: string | null;
  shortDescriptionEn: string | null;
  shortDescriptionFr: string | null;
  categoryId: string | null;
  concernIds: string[];
  skinTypeIds: string[];
  isFeatured: boolean;
  isBestseller: boolean;
  createdAt: Date;
  variants: VariantLike[];
};

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filterProducts<P extends Filterable>(items: P[], filters: ShopFilters, locale: Locale) {
  const terms = normalizeText(filters.query ?? "")
    .split(/\s+/)
    .filter(Boolean);

  const matches = items.filter((p) => {
    if (filters.categoryId && p.categoryId !== filters.categoryId) return false;
    if (filters.concernId && !p.concernIds.includes(filters.concernId)) return false;
    if (filters.skinTypeId && !p.skinTypeIds.includes(filters.skinTypeId)) return false;
    if (!terms.length) return true;
    const haystack = normalizeText(
      [p.nameEn, p.nameFr, localized(p, "shortDescription", locale)].filter(Boolean).join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });

  const priceOf = (p: P) => lowestPrice(p.variants);
  const byPrice = (direction: 1 | -1) => (a: P, b: P) => {
    const pa = priceOf(a);
    const pb = priceOf(b);
    if (pa == null) return pb == null ? 0 : 1;
    if (pb == null) return -1;
    return (pa - pb) * direction;
  };

  switch (filters.sort ?? "featured") {
    case "newest":
      return [...matches].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case "priceAsc":
      return [...matches].sort(byPrice(1));
    case "priceDesc":
      return [...matches].sort(byPrice(-1));
    default:
      return [...matches].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || Number(b.isBestseller) - Number(a.isBestseller),
      );
  }
}
