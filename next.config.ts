import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/media/image-loader.ts",
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
        {
          source: "/:path((?!en(?:/|$)|fr(?:/|$)|admin(?:/|$)|api(?:/|$)|media(?:/|$)|_next(?:/|$)).+)",
          destination: "/en/:path",
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
