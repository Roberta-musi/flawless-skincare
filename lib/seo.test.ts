import { describe, expect, it } from "vitest";
import { pageMetadata } from "./seo";

describe("pageMetadata", () => {
  it("links both languages and points canonical at the current one", () => {
    const meta = pageMetadata({ locale: "fr", path: "/shop", title: "Boutique" });
    expect(meta.alternates?.canonical).toBe("/fr/shop");
    expect(meta.alternates?.languages).toEqual({ en: "/shop", fr: "/fr/shop", "x-default": "/shop" });
  });

  it("canonicalises untranslated French pages to English and drops hreflang", () => {
    const meta = pageMetadata({ locale: "fr", path: "/products/x", title: "X", translated: false });
    expect(meta.alternates?.canonical).toBe("/products/x");
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it("marks noindex pages", () => {
    expect(pageMetadata({ locale: "en", path: "/book/thanks", title: "T", noindex: true }).robots).toEqual({ index: false, follow: true });
  });
});
