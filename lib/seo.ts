import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";
import { localePath } from "@/lib/i18n/paths";

export function pageMetadata({
  locale,
  path,
  title,
  description,
  images,
  translated = true,
  noindex,
  absoluteTitle,
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
  translated?: boolean;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const shareImages = images ?? [{ url: "/og.jpg", width: 1200, height: 630, alt: "Flawless Skin Care" }];
  const en = localePath("en", path);
  const url = localePath(locale, path);
  const canonical = locale === "fr" && !translated ? en : url;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: description ?? undefined,
    alternates: {
      canonical,
      languages: translated ? { en, fr: localePath("fr", path), "x-default": en } : undefined,
    },
    openGraph: {
      type: "website",
      url,
      title,
      description: description ?? undefined,
      siteName: "Flawless Skin Care",
      locale: locale === "fr" ? "fr_CM" : "en_CM",
      alternateLocale: locale === "fr" ? "en_CM" : "fr_CM",
      images: shareImages,
    },
    twitter: { card: "summary_large_image", title, description: description ?? undefined, images: shareImages.map((i) => i.url) },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
