import { describe, expect, it } from "vitest";
import { businessJsonLd, productJsonLd, ratingSummary, serviceJsonLd } from "./structured-data";

const base = {
  name: "Body Butter",
  description: "Rich",
  url: "https://x.cm/products/body-butter",
  images: ["https://x.cm/media/a-1600.webp"],
  sku: "butter",
  category: "Body care",
  brand: "Flawless Skin Care",
  reviews: [],
};

describe("productJsonLd", () => {
  it("uses a single Offer in XAF for one price", () => {
    const ld = productJsonLd({ ...base, variants: [{ priceXaf: 15000, inStock: true }] });
    expect(ld.offers).toMatchObject({ "@type": "Offer", price: 15000, priceCurrency: "XAF", availability: "https://schema.org/InStock" });
  });

  it("uses an AggregateOffer for several prices and skips unpriced sizes", () => {
    const ld = productJsonLd({
      ...base,
      variants: [
        { priceXaf: 9000, inStock: false },
        { priceXaf: 15000, inStock: true },
        { priceXaf: null, inStock: true },
      ],
    });
    expect(ld.offers).toMatchObject({ "@type": "AggregateOffer", lowPrice: 9000, highPrice: 15000, offerCount: 2 });
  });

  it("omits offers when nothing is priced and adds ratings from reviews", () => {
    const ld = productJsonLd({
      ...base,
      variants: [{ priceXaf: null, inStock: true }],
      reviews: [
        { name: "Ada", body: "Great", rating: 5, createdAt: new Date("2026-01-02") },
        { name: "Bo", body: "Good", rating: 4, createdAt: new Date("2026-01-03") },
        { name: "Cy", body: "Nice", rating: null, createdAt: new Date("2026-01-04") },
      ],
    });
    expect(ld.offers).toBeUndefined();
    expect(ld.aggregateRating).toEqual({ "@type": "AggregateRating", ratingValue: 4.5, reviewCount: 2 });
    expect(ld.review).toHaveLength(2);
  });
});

describe("ratingSummary", () => {
  it("ignores unrated reviews", () => {
    expect(ratingSummary([{ rating: null }])).toBeNull();
    expect(ratingSummary([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({ average: 4.3, count: 3 });
  });
});

describe("businessJsonLd", () => {
  it("describes the business without review markup", () => {
    const ld = businessJsonLd({
      url: "https://x.cm",
      name: "Flawless Skin Care",
      description: "Skincare",
      logo: "https://x.cm/brand/logo.png",
      image: null,
      phone: "+237 673 222 029",
      email: null,
      streetAddress: null,
      city: "Limbe",
      region: "South West",
      country: "CM",
      latitude: null,
      longitude: null,
      openingHours: [{ opens: "09:00", closes: "18:00" }, null, null, null, null, null, null],
      socials: { facebook: "https://fb.com/x" },
      priceRange: null,
      founder: "Musi",
      foundedYear: 2020,
    });
    expect(ld["@type"]).toBe("HealthAndBeautyBusiness");
    expect(ld).not.toHaveProperty("aggregateRating");
    expect(ld.geo).toBeUndefined();
    expect(ld.openingHoursSpecification).toHaveLength(1);
    expect(ld.sameAs).toEqual(["https://fb.com/x"]);
  });
});

describe("serviceJsonLd", () => {
  it("links the provider and prices only fixed or from services", () => {
    const common = { name: "Facial", description: null, url: "u", businessUrl: "https://x.cm", city: "Limbe" };
    expect(serviceJsonLd({ ...common, priceXaf: 20000, priceType: "fixed" }).offers).toMatchObject({ price: 20000 });
    expect(serviceJsonLd({ ...common, priceXaf: 20000, priceType: "consultation" }).offers).toBeUndefined();
    expect(serviceJsonLd({ ...common, priceXaf: null, priceType: "fixed" }).provider).toEqual({ "@id": "https://x.cm/#business" });
  });
});
