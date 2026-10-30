import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";
import { fieldErrors, passwordChangeSchema, productSchema, settingsSchema, teamMemberSchema } from "./admin";

const product = {
  slug: "body-butter",
  categoryId: null,
  nameEn: "Body Butter",
  nameFr: "",
  benefitsEn: [],
  benefitsFr: [],
  isPublished: true,
  isFeatured: false,
  isBestseller: false,
  isNew: false,
  sortOrder: 0,
  variants: [{ labelEn: "250 g", priceXaf: 9000, compareAtPriceXaf: null, inStock: true }],
  images: [],
  concernIds: [],
  skinTypeIds: [],
  pairingIds: [],
  setItems: [],
};

describe("slugify", () => {
  it("makes clean URL slugs from names in either language", () => {
    expect(slugify("Crème Éclat & Beurre  Corporel!")).toBe("creme-eclat-and-beurre-corporel");
    expect(slugify("  5D Molato Soap (Big size) ")).toBe("5d-molato-soap-big-size");
  });
});

describe("productSchema", () => {
  it("turns empty optional text into null", () => {
    const result = productSchema.parse(product);
    expect(result.nameFr).toBeNull();
    expect(result.descriptionEn).toBeNull();
  });

  it("rejects a sale price that is not lower than the old price", () => {
    const result = productSchema.safeParse({ ...product, variants: [{ ...product.variants[0], compareAtPriceXaf: 8000 }] });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error)).toEqual({ "variants.0.compareAtPriceXaf": "The old price must be higher than the price" });
  });

  it("requires a size, a name and a valid slug and refuses foreign image keys", () => {
    const result = productSchema.safeParse({
      ...product,
      slug: "Body Butter",
      nameEn: " ",
      variants: [],
      images: [{ key: "../secrets", width: 1, height: 1 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(fieldErrors(result.error)).sort()).toEqual(["images.0.key", "nameEn", "slug", "variants"]);
  });
});

describe("settingsSchema", () => {
  const settings = {
    businessName: "Flawless Skin Care",
    whatsapp: "+237 673 222 029",
    email: "",
    city: "Limbe",
    region: "South West",
    latitude: null,
    longitude: null,
    mapUrl: "",
    shopPhotoKey: null,
    openingHours: [{ opens: "09:00", closes: "18:00" }, null, null, null, null, null, null],
    socials: {},
  };

  it("normalises the WhatsApp number and blanks", () => {
    const result = settingsSchema.parse(settings);
    expect(result.whatsapp).toBe("237673222029");
    expect(result.email).toBeNull();
    expect(result.mapUrl).toBeNull();
  });

  it("rejects closing before opening and short numbers", () => {
    const result = settingsSchema.safeParse({ ...settings, whatsapp: "6732", openingHours: [{ opens: "18:00", closes: "09:00" }, null, null, null, null, null, null] });
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(fieldErrors(result.error)).sort()).toEqual(["openingHours", "whatsapp"]);
  });
});

describe("team schemas", () => {
  it("normalises emails and requires a 10-character password", () => {
    expect(teamMemberSchema.parse({ name: "Ada", email: "  Ada@Flawless.TEST ", role: "manager", password: "0123456789" }).email).toBe("ada@flawless.test");
    const result = teamMemberSchema.safeParse({ name: "", email: "nope", role: "admin", password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(fieldErrors(result.error)).sort()).toEqual(["email", "name", "password", "role"]);
  });

  it("checks the new password is typed twice", () => {
    const result = passwordChangeSchema.safeParse({ currentPassword: "old", newPassword: "0123456789", confirm: "0123456788" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrors(result.error)).toEqual({ confirm: "The two passwords don't match" });
  });
});
