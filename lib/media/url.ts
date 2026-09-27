export const imageWidths = [400, 800, 1600] as const;

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL ?? "/media";

export function variantKey(key: string, width: (typeof imageWidths)[number]) {
  return `${key}-${width}.webp`;
}

export function mediaUrl(key: string, width: number) {
  const size = imageWidths.find((w) => w >= width) ?? imageWidths[imageWidths.length - 1];
  return `${mediaBase}/${variantKey(key, size)}`;
}
