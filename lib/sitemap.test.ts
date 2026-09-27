import { describe, expect, it } from "vitest";
import { buildSitemap } from "./sitemap";

describe("buildSitemap", () => {
  it("lists both languages with hreflang alternates for translated pages", () => {
    expect(buildSitemap("https://x.cm", [{ path: "/", translated: true, priority: 1 }])).toEqual([
      {
        url: "https://x.cm/",
        lastModified: undefined,
        priority: 1,
        alternates: { languages: { en: "https://x.cm/", fr: "https://x.cm/fr", "x-default": "https://x.cm/" } },
      },
      {
        url: "https://x.cm/fr",
        lastModified: undefined,
        priority: 1,
        alternates: { languages: { en: "https://x.cm/", fr: "https://x.cm/fr", "x-default": "https://x.cm/" } },
      },
    ]);
  });

  it("leaves untranslated pages out of the French sitemap", () => {
    const date = new Date("2026-09-01");
    expect(buildSitemap("https://x.cm", [{ path: "/products/soap", translated: false, lastModified: date }])).toEqual([
      { url: "https://x.cm/products/soap", lastModified: date, priority: undefined, alternates: undefined },
    ]);
  });
});
