import { describe, expect, it } from "vitest";
import { interpolate, isTranslated, localized } from "./localized";
import { localeFromPathname, localePath, stripLocale, switchLocalePath } from "./paths";

describe("locale paths", () => {
  it("keeps English unprefixed and prefixes French", () => {
    expect(localePath("en", "/shop")).toBe("/shop");
    expect(localePath("fr", "/shop")).toBe("/fr/shop");
    expect(localePath("fr", "/")).toBe("/fr");
  });

  it("strips only a real /fr segment", () => {
    expect(stripLocale("/fr")).toBe("/");
    expect(stripLocale("/fr/shop/soaps")).toBe("/shop/soaps");
    expect(stripLocale("/fragrance")).toBe("/fragrance");
    expect(stripLocale("/shop")).toBe("/shop");
  });

  it("switches between languages", () => {
    expect(switchLocalePath("/products/body-butter", "fr")).toBe("/fr/products/body-butter");
    expect(switchLocalePath("/fr/products/body-butter", "en")).toBe("/products/body-butter");
    expect(switchLocalePath("/fr", "en")).toBe("/");
  });

  it("reads the locale from a pathname", () => {
    expect(localeFromPathname("/fr/about")).toBe("fr");
    expect(localeFromPathname("/fragrance")).toBe("en");
  });
});

describe("localized", () => {
  const row = { nameEn: "Body butter", nameFr: "Beurre corporel", introEn: "Rich", introFr: "  ", tagsEn: ["a"], tagsFr: [] };

  it("uses French when filled and falls back to English otherwise", () => {
    expect(localized(row, "name", "fr")).toBe("Beurre corporel");
    expect(localized(row, "name", "en")).toBe("Body butter");
    expect(localized(row, "intro", "fr")).toBe("Rich");
    expect(localized(row, "tags", "fr")).toEqual(["a"]);
  });

  it("reports whether every filled English field has French", () => {
    expect(isTranslated(row, ["name"])).toBe(true);
    expect(isTranslated(row, ["name", "intro"])).toBe(false);
    expect(isTranslated({ nameEn: "x", noteEn: null }, ["name", "note"])).toBe(false);
    expect(isTranslated({ nameEn: "x", nameFr: "y", noteEn: null }, ["name", "note"])).toBe(true);
  });
});

describe("interpolate", () => {
  it("fills named placeholders and leaves unknown ones", () => {
    expect(interpolate("Hello {name}, {count} items {x}", { name: "Ada", count: 2 })).toBe("Hello Ada, 2 items {x}");
  });
});
