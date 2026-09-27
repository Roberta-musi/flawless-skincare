import { beforeEach, describe, expect, it, vi } from "vitest";
import { categories, concerns, productImages, products, productVariants } from "@/lib/db/schema";
import type { ProductInput } from "@/lib/validation/admin";
import { resetTestDb } from "@/tests/support/db";

const auth = vi.hoisted(() => ({ requireAdmin: vi.fn() }));
const media = vi.hoisted(() => ({ delete: vi.fn() }));
vi.mock("@/lib/auth", () => auth);
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: async () => ({ env: { MEDIA: media } }) }));

const { deleteProduct, getProductForEdit, saveCategory, saveProduct, saveTerm } = await import("./catalog");

let db: Awaited<ReturnType<typeof resetTestDb>>;

const base: ProductInput = {
  slug: "body-butter",
  categoryId: "body",
  nameEn: "Body Butter",
  nameFr: null,
  shortDescriptionEn: null,
  shortDescriptionFr: null,
  descriptionEn: null,
  descriptionFr: null,
  benefitsEn: ["Soft skin"],
  benefitsFr: [],
  howToUseEn: null,
  howToUseFr: null,
  keyIngredientsEn: null,
  keyIngredientsFr: null,
  inci: null,
  isPublished: true,
  isFeatured: false,
  isBestseller: false,
  isNew: false,
  sortOrder: 0,
  seoTitleEn: null,
  seoTitleFr: null,
  seoDescriptionEn: null,
  seoDescriptionFr: null,
  variants: [
    { labelEn: "250 g", labelFr: null, priceXaf: 9000, compareAtPriceXaf: null, inStock: true },
    { labelEn: "500 g", labelFr: null, priceXaf: 15000, compareAtPriceXaf: null, inStock: true },
  ],
  images: [{ key: "products/a", width: 1600, height: 2000, altEn: null, altFr: null }],
  concernIds: ["tone"],
  skinTypeIds: [],
  pairingIds: [],
  setItems: [],
};

beforeEach(async () => {
  db = await resetTestDb();
  auth.requireAdmin.mockReset().mockResolvedValue({ user: { id: "u", name: "Owner", email: "o@x", role: "owner" } });
  media.delete.mockReset();
  await db.insert(categories).values({ id: "body", slug: "body-care", nameEn: "Body care", imageKey: "products/shared" });
  await db.insert(concerns).values({ id: "tone", slug: "uneven-tone", nameEn: "Uneven tone" });
});

describe("admin guard", () => {
  it("refuses to save when the visitor is not an admin", async () => {
    auth.requireAdmin.mockRejectedValue(new Error("NEXT_REDIRECT"));
    await expect(saveProduct(base)).rejects.toThrow("NEXT_REDIRECT");
    await expect(deleteProduct("x")).rejects.toThrow("NEXT_REDIRECT");
    expect(await db.query.products.findMany()).toHaveLength(0);
  });
});

describe("saveProduct", () => {
  it("creates a product with its sizes, photos and concerns", async () => {
    const result = await saveProduct(base);
    expect(result.ok).toBe(true);
    const saved = await getProductForEdit(result.ok ? result.id : "");
    expect(saved?.variants.map((v) => [v.labelEn, v.sortOrder])).toEqual([
      ["250 g", 0],
      ["500 g", 1],
    ]);
    expect(saved?.images.map((i) => i.key)).toEqual(["products/a"]);
    expect(saved?.concernIds).toEqual(["tone"]);
  });

  it("keeps variant ids on update, drops removed ones and cleans up unused photos", async () => {
    const created = await saveProduct({ ...base, images: [...base.images, { key: "products/b", width: 1, height: 1, altEn: null, altFr: null }] });
    if (!created.ok) throw new Error("create failed");
    const before = (await getProductForEdit(created.id))!;
    const [small] = before.variants;

    const updated = await saveProduct({
      ...base,
      id: created.id,
      variants: [{ ...small, priceXaf: 9500 }, { labelEn: "1 kg", labelFr: null, priceXaf: 25000, compareAtPriceXaf: null, inStock: false }],
      images: [before.images[1]],
      concernIds: [],
    });
    expect(updated.ok).toBe(true);
    const after = (await getProductForEdit(created.id))!;
    expect(after.variants.map((v) => [v.id === small.id, v.labelEn, v.priceXaf])).toEqual([
      [true, "250 g", 9500],
      [false, "1 kg", 25000],
    ]);
    expect(await db.select().from(productVariants)).toHaveLength(2);
    expect(after.images.map((i) => [i.key, i.sortOrder])).toEqual([["products/b", 0]]);
    expect(after.concernIds).toEqual([]);
    expect(media.delete).toHaveBeenCalledWith(["products/a-400", "products/a-800", "products/a-1600", "products/a-og"]);
  });

  it("rejects a web address already used by another product", async () => {
    await saveProduct(base);
    expect(await saveProduct({ ...base, nameEn: "Other" })).toEqual({ ok: false, errors: { slug: "Another product already uses this web address." } });
  });

  it("never links a product to itself", async () => {
    const created = await saveProduct(base);
    if (!created.ok) throw new Error("create failed");
    await saveProduct({ ...base, id: created.id, pairingIds: [created.id], setItems: [{ productId: created.id, quantity: 1 }] });
    const saved = await getProductForEdit(created.id);
    expect(saved?.pairingIds).toEqual([]);
    expect(saved?.setItems).toEqual([]);
  });
});

describe("deleteProduct", () => {
  it("removes the product and its photos but keeps images other records still use", async () => {
    await db.insert(products).values({ id: "p", slug: "p", nameEn: "P" });
    await db.insert(productImages).values([
      { productId: "p", key: "products/only", width: 1, height: 1 },
      { productId: "p", key: "products/shared", width: 1, height: 1 },
    ]);
    await deleteProduct("p");
    expect(await db.query.products.findMany()).toHaveLength(0);
    expect(media.delete).toHaveBeenCalledWith(["products/only-400", "products/only-800", "products/only-1600", "products/only-og"]);
  });
});

describe("taxonomy", () => {
  it("guards category and term slugs", async () => {
    const cat = { slug: "body-care", nameEn: "Body", nameFr: null, introEn: null, introFr: null, imageKey: null, sortOrder: 0, isPublished: true, seoTitleEn: null, seoTitleFr: null, seoDescriptionEn: null, seoDescriptionFr: null };
    expect((await saveCategory(cat)).ok).toBe(false);
    expect((await saveCategory({ ...cat, slug: "face-care" })).ok).toBe(true);
    expect((await saveTerm({ kind: "concern", slug: "uneven-tone", nameEn: "X", nameFr: null, sortOrder: 0 })).ok).toBe(false);
    expect((await saveTerm({ kind: "skinType", slug: "uneven-tone", nameEn: "X", nameFr: null, sortOrder: 0 })).ok).toBe(true);
  });
});
