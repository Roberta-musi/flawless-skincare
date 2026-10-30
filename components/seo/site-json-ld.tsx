import { pricedVariants } from "@/lib/catalog";
import type { Catalog } from "@/lib/data/catalog";
import type { BrandProfile, Settings } from "@/lib/data/site";
import { formatPrice } from "@/lib/format";
import { ogImageUrl } from "@/lib/media/url";
import { siteUrl } from "@/lib/site";
import { absoluteUrl, businessJsonLd } from "@/lib/structured-data";
import { JsonLd } from "./json-ld";

export function SiteJsonLd({
  settings,
  brand,
  catalog,
  description,
}: {
  settings: Settings;
  brand: BrandProfile;
  catalog: Catalog;
  description: string;
}) {
  const base = siteUrl();
  const prices = catalog.products.flatMap((p) => pricedVariants(p.variants).map((v) => v.priceXaf));
  const priceRange = prices.length
    ? `${formatPrice(Math.min(...prices), "en")} – ${formatPrice(Math.max(...prices), "en")}`.replace(/\s/g, " ")
    : null;

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          businessJsonLd({
            url: base,
            name: settings.businessName,
            description,
            logo: `${base}/brand/logo.png`,
            image: settings.shopPhotoKey ? absoluteUrl(base, ogImageUrl(settings.shopPhotoKey)) : null,
            phone: settings.phone,
            email: settings.email,
            streetAddress: settings.streetAddress,
            city: settings.city,
            region: settings.region,
            country: settings.country,
            latitude: settings.latitude,
            longitude: settings.longitude,
            openingHours: settings.openingHours,
            socials: settings.socials,
            priceRange,
            founder: brand.ceoName,
            foundedYear: brand.foundedYear,
          }),
          {
            "@type": "WebSite",
            "@id": `${base}/#website`,
            url: base,
            name: settings.businessName,
            inLanguage: ["en", "fr"],
            publisher: { "@id": `${base}/#business` },
          },
        ],
      }}
    />
  );
}
