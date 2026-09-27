import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const localizedSections = [
  "shop",
  "products",
  "services",
  "book",
  "about",
  "reviews",
  "contact",
  "faq",
  "privacy",
  "booking-policy",
  "returns",
];

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
    // Each build worker opens its own local D1 simulator; several at once collide on the same SQLite file.
    cpus: 1,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/media/image-loader.ts",
    deviceSizes: [400, 800, 1600],
    imageSizes: [200],
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async rewrites() {
    // English lives at unprefixed URLs; everything under app/[locale] expects a locale segment.
    // One rule per section: OpenNext cannot rewrite a single regex parameter that spans several segments.
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/", destination: "/en" },
        ...localizedSections.flatMap((section) => [
          { source: `/${section}`, destination: `/en/${section}` },
          { source: `/${section}/:path*`, destination: `/en/${section}/:path*` },
        ]),
        { source: "/:first((?!(?:en|fr|admin|api|media|_next)(?:/|$))[^/]+)/:rest*", destination: "/en/page-not-found" },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
