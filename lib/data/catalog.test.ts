import { beforeEach, describe, expect, it } from "vitest";
import {
  categories,
  concerns,
  productConcerns,
  productImages,
  productPairings,
  products,
  productVariants,
  reviews,
} from "@/lib/db/schema";
import { resetTestDb } from "@/tests/support/db";
import { getCatalog, getProductBySlug } from "./catalog";
import { getBrandProfile, getContentPage, getSettings } from "./site";

let db: Awaited<ReturnType<typeof resetTestDb>>;

beforeEach(async () => {
  db = await resetTestDb();
  await db.insert(categories).values([
    { id: "body", slug: "body-care", nameEn: "Body care", sortOrder: 1 },
    { id: "hidden", slug: "hidden", nameEn: "Hidden", isPublished: false },
  ]);
  await db.insert(concerns).values({ id: "tone", slug: "uneven-tone", nameEn: "Uneven tone" });
  await db.insert(products).values([
    { id: "butter", slug: "body-butter", nameEn: "Body Butter", categoryId: "body", isPublished: true, sortOrder: 1 },
    { id: "scrub", slug: "scrub", nameEn: "Scrub", categoryId: "body", isPublished: true, sortOrder: 2 },
    { id: "draft", slug: "draft", nameEn: "Draft", isPublished: false },
    { id: "secret", slug: "secret", nameEn: "Secret", categoryId: "hidden", isPublished: true },
  ]);
  await db.insert(productVariants).values([
    { productId: "butter", labelEn: "500 g", priceXaf: 15000, sortOrder: 2 },
    { productId: "butter", labelEn: "250 g", priceXaf: 9000, sortOrder: 1 },
  ]);
  await db.insert(productImages).values([
    { productId: "butter", key: "products/b2", width: 800, height: 1000, sortOrder: 2 },
    { productId: "butter", key: "products/b1", width: 800, height: 1000, sortOrder: 1 },
  ]);
  await db.insert(productConcerns).values({ productId: "butter", concernId: "tone" });
  await db.insert(productPairings).values([
    { productId: "butter", pairedProductId: "scrub" },
    { productId: "butter", pairedProductId: "draft" },
  ]);
  await db.insert(reviews).values([
    { name: "Ada", body: "Lovely", productId: "butter", status: "approved" },
    { name: "Bo", body: "Pending", productId: "butter", status: "pending" },
  ]);
});

describe("getCatalog", () => {
  it("returns published products with their first image, ordered variants and concern ids", async () => {
    const catalog = await getCatalog();
    expect(catalog.categories.map((c) => c.slug)).toEqual(["body-care"]);
    expect(catalog.products.map((p) => p.slug)).toEqual(["body-butter", "scrub"]);
    const butter = catalog.products[0];
    expect(butter.image?.key).toBe("products/b1");
    expect(butter.variants.map((v) => v.labelEn)).toEqual(["250 g", "500 g"]);
    expect(butter.concernIds).toEqual(["tone"]);
  });
});

describe("getProductBySlug", () => {
  it("returns details with only published pairings and approved reviews", async () => {
    const product = await getProductBySlug("body-butter");
    expect(product?.images.map((i) => i.key)).toEqual(["products/b1", "products/b2"]);
    expect(product?.concerns.map((c) => c.slug)).toEqual(["uneven-tone"]);
    expect(product?.pairings.map((p) => p.slug)).toEqual(["scrub"]);
    expect(product?.reviews.map((r) => r.name)).toEqual(["Ada"]);
  });

  it("hides unpublished products and products in unpublished categories", async () => {
    expect(await getProductBySlug("draft")).toBeNull();
    expect(await getProductBySlug("secret")).toBeNull();
    expect(await getProductBySlug("missing")).toBeNull();
  });
});

describe("site content", () => {
  it("reads the rows seeded by the defaults migration", async () => {
    expect((await getSettings()).businessName).toBe("Flawless Skin Care");
    expect((await getBrandProfile()).id).toBe(1);
    expect((await getContentPage("privacy"))?.titleFr).toBe("Politique de confidentialité");
  });
});
