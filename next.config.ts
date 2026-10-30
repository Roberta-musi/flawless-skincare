import type { NextConfig } from "next";

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
  // A self-contained server.js plus only the node_modules it needs, for the cPanel Node.js app.
  output: "standalone",
  serverExternalPackages: ["@libsql/client", "libsql"],
  experimental: {
    globalNotFound: true,
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
