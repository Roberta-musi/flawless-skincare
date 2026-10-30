import type { OpeningHours, Socials } from "@/lib/db/schema";
import { openingHoursSpecification } from "@/lib/hours";

type Variant = { priceXaf: number | null; inStock: boolean };
type Review = { name: string; body: string; rating: number | null; createdAt: Date };

export function absoluteUrl(base: string, path: string) {
  return path.startsWith("http") ? path : `${base}${path}`;
}

function availability(inStock: boolean) {
  return inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
}

export function ratingSummary(reviews: Pick<Review, "rating">[]) {
  const rated = reviews.filter((r): r is { rating: number } => r.rating != null);
  if (!rated.length) return null;
  const average = rated.reduce((sum, r) => sum + r.rating, 0) / rated.length;
  return { average: Math.round(average * 10) / 10, count: rated.length };
}

export function productJsonLd(input: {
  name: string;
  description: string | null;
  url: string;
  images: string[];
  sku: string;
  category: string | null;
  brand: string;
  variants: Variant[];
  reviews: Review[];
}) {
  const priced = input.variants.filter((v): v is Variant & { priceXaf: number } => v.priceXaf != null);
  const prices = priced.map((v) => v.priceXaf);
  const anyInStock = input.variants.length === 0 || input.variants.some((v) => v.inStock);

  let offers: object | undefined;
  if (priced.length === 1 || (priced.length > 1 && new Set(prices).size === 1)) {
    offers = {
      "@type": "Offer",
      url: input.url,
      price: prices[0],
      priceCurrency: "XAF",
      availability: availability(priced.some((v) => v.inStock)),
      itemCondition: "https://schema.org/NewCondition",
    };
  } else if (priced.length > 1) {
    offers = {
      "@type": "AggregateOffer",
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: priced.length,
      priceCurrency: "XAF",
      availability: availability(anyInStock),
    };
  }

  const rating = ratingSummary(input.reviews);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    image: input.images.length ? input.images : undefined,
    sku: input.sku,
    category: input.category ?? undefined,
    brand: { "@type": "Brand", name: input.brand },
    offers,
    aggregateRating: rating ? { "@type": "AggregateRating", ratingValue: rating.average, reviewCount: rating.count } : undefined,
    review: input.reviews
      .filter((r) => r.rating != null)
      .slice(0, 5)
      .map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        reviewBody: r.body,
        datePublished: r.createdAt.toISOString().slice(0, 10),
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
      })),
  };
}

export function businessJsonLd(input: {
  url: string;
  name: string;
  description: string;
  logo: string;
  image: string | null;
  phone: string | null;
  email: string | null;
  streetAddress: string | null;
  city: string;
  region: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  openingHours: OpeningHours | null;
  socials: Socials;
  priceRange: string | null;
  founder: string | null;
  foundedYear: number | null;
}) {
  const sameAs = Object.values(input.socials).filter(Boolean);
  return {
    "@type": "HealthAndBeautyBusiness",
    "@id": `${input.url}/#business`,
    name: input.name,
    description: input.description,
    url: input.url,
    logo: input.logo,
    image: input.image ?? input.logo,
    telephone: input.phone ?? undefined,
    email: input.email ?? undefined,
    priceRange: input.priceRange ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: input.streetAddress ?? undefined,
      addressLocality: input.city,
      addressRegion: input.region,
      addressCountry: input.country,
    },
    geo:
      input.latitude != null && input.longitude != null
        ? { "@type": "GeoCoordinates", latitude: input.latitude, longitude: input.longitude }
        : undefined,
    openingHoursSpecification: openingHoursSpecification(input.openingHours),
    sameAs: sameAs.length ? sameAs : undefined,
    founder: input.founder ? { "@type": "Person", name: input.founder } : undefined,
    foundingDate: input.foundedYear ? String(input.foundedYear) : undefined,
  };
}

export function serviceJsonLd(input: {
  name: string;
  description: string | null;
  url: string;
  businessUrl: string;
  city: string;
  priceXaf: number | null;
  priceType: "fixed" | "from" | "consultation";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    provider: { "@id": `${input.businessUrl}/#business` },
    areaServed: { "@type": "City", name: input.city },
    offers:
      input.priceXaf != null && input.priceType !== "consultation"
        ? {
            "@type": "Offer",
            priceCurrency: "XAF",
            ...(input.priceType === "from"
              ? { priceSpecification: { "@type": "PriceSpecification", minPrice: input.priceXaf, priceCurrency: "XAF" } }
              : { price: input.priceXaf }),
          }
        : undefined,
  };
}
