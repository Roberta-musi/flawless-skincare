import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data/catalog";
import { getServices, serviceTranslatableFields } from "@/lib/data/services";
import { isTranslated } from "@/lib/i18n/localized";
import { siteUrl } from "@/lib/site";
import { buildSitemap } from "@/lib/sitemap";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, services] = await Promise.all([getCatalog(), getServices()]);
  const staticPages = ["/", "/shop", "/services", "/about", "/reviews", "/contact", "/faq", "/book", "/privacy", "/booking-policy", "/returns"];

  return buildSitemap(siteUrl(), [
    ...staticPages.map((path) => ({ path, translated: true, priority: path === "/" ? 1 : 0.6 })),
    ...catalog.categories.map((c) => ({
      path: `/shop/${c.slug}`,
      translated: isTranslated(c, ["name", "intro"]),
      lastModified: c.updatedAt,
      priority: 0.7,
    })),
    ...catalog.products.map((p) => ({ path: `/products/${p.slug}`, translated: p.translated, lastModified: p.updatedAt, priority: 0.8 })),
    ...services.map((s) => ({
      path: `/services/${s.slug}`,
      translated: isTranslated(s, serviceTranslatableFields),
      lastModified: s.updatedAt,
      priority: 0.7,
    })),
  ]);
}
