"use client";

import { mediaUrl } from "./url";

export default function imageLoader({ src, width }: { src: string; width: number }) {
  if (src.startsWith("/") || src.startsWith("http")) return `${src}?w=${width}`;
  return mediaUrl(src, width);
}
