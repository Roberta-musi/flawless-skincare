import { describe, expect, it } from "vitest";
import { filterProducts, hasPriceRange, isInStock, isOnSale, lowestPrice } from "./catalog";

const variant = (priceXaf: number | null, extra: Partial<{ compareAtPriceXaf: number; inStock: boolean }> = {}) => ({
  priceXaf,
  compareAtPriceXaf: extra.compareAtPriceXaf ?? null,
  inStock: extra.inStock ?? true,
});

const product = (name: string, extra: Partial<Parameters<typeof filterProducts>[0][number]> = {}) => ({
  nameEn: name,
  nameFr: null,
  shortDescriptionEn: null,
  shortDescriptionFr: null,
  categoryId: null,
  concernIds: [],
  skinTypeIds: [],
  isFeatured: false,
  isBestseller: false,
  createdAt: new Date("2026-01-01"),
  variants: [],
  ...extra,
});

describe("prices", () => {
  it("finds the lowest priced variant and ignores unpriced ones", () => {
    expect(lowestPrice([variant(15000), variant(null), variant(9000)])).toBe(9000);
    expect(lowestPrice([variant(null)])).toBeNull();
  });

  it("detects ranges, stock and sales", () => {
    expect(hasPriceRange([variant(5000), variant(5000)])).toBe(false);
    expect(hasPriceRange([variant(5000), variant(8000)])).toBe(true);
    expect(isInStock([variant(1, { inStock: false })])).toBe(false);
    expect(isInStock([])).toBe(true);
    expect(isOnSale(variant(38000, { compareAtPriceXaf: 40000 }))).toBe(true);
    expect(isOnSale(variant(38000, { compareAtPriceXaf: 30000 }))).toBe(false);
  });
});

describe("filterProducts", () => {
  const items = [
    product("Brightening Body Butter", { categoryId: "body", concernIds: ["tone"], variants: [variant(12000)], createdAt: new Date("2026-03-01") }),
    product("Crème visage éclat", { nameFr: "Crème visage éclat", categoryId: "face", skinTypeIds: ["dry"], variants: [variant(8000)], isFeatured: true }),
    product("Coffee scrub", { categoryId: "body", variants: [], isBestseller: true, createdAt: new Date("2026-05-01") }),
  ];

  it("filters by category, concern and skin type", () => {
    expect(filterProducts(items, { categoryId: "body" }, "en").map((p) => p.nameEn)).toEqual([
      "Coffee scrub",
      "Brightening Body Butter",
    ]);
    expect(filterProducts(items, { concernId: "tone" }, "en")).toHaveLength(1);
    expect(filterProducts(items, { skinTypeId: "dry" }, "en")[0].nameEn).toBe("Crème visage éclat");
  });

  it("searches without caring about accents or case", () => {
    expect(filterProducts(items, { query: "CREME eclat" }, "fr")).toHaveLength(1);
    expect(filterProducts(items, { query: "butter body" }, "en")).toHaveLength(1);
    expect(filterProducts(items, { query: "serum" }, "en")).toHaveLength(0);
  });

  it("sorts featured first, by newest, and by price with unpriced last", () => {
    expect(filterProducts(items, {}, "en")[0].nameEn).toBe("Crème visage éclat");
    expect(filterProducts(items, { sort: "newest" }, "en")[0].nameEn).toBe("Coffee scrub");
    expect(filterProducts(items, { sort: "priceAsc" }, "en").map((p) => p.nameEn)).toEqual([
      "Crème visage éclat",
      "Brightening Body Butter",
      "Coffee scrub",
    ]);
    expect(filterProducts(items, { sort: "priceDesc" }, "en").map((p) => p.nameEn)).toEqual([
      "Brightening Body Butter",
      "Crème visage éclat",
      "Coffee scrub",
    ]);
  });
});
