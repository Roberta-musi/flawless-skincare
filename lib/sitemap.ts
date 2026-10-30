import type { MetadataRoute } from "next";
import { localePath } from "@/lib/i18n/paths";

export type SitemapPage = { path: string; translated: boolean; lastModified?: Date; priority?: number };

export function buildSitemap(base: string, pages: SitemapPage[]): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const en = `${base}${localePath("en", page.path)}`;
    const fr = `${base}${localePath("fr", page.path)}`;
    const shared = {
      lastModified: page.lastModified,
      priority: page.priority,
      alternates: page.translated ? { languages: { en, fr, "x-default": en } } : undefined,
    };
    return page.translated ? [{ url: en, ...shared }, { url: fr, ...shared }] : [{ url: en, ...shared }];
  });
}
