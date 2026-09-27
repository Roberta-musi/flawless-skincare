import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Flawless Skin Care",
    short_name: "Flawless",
    description: "Face and body care, consultations and treatments in Limbe, Cameroon.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf6f2",
    theme_color: "#fbf6f2",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
