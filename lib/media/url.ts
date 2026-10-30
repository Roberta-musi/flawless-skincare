export const imageWidths = [400, 800, 1600] as const;

const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL ?? "/media";

export function variantKey(key: string, width: (typeof imageWidths)[number]) {
  return `${key}-${width}`;
}

export function ogKey(key: string) {
  return `${key}-og`;
}

export function allVariantKeys(key: string) {
  return [...imageWidths.map((w) => variantKey(key, w)), ogKey(key)];
}

export function mediaUrl(key: string, width: number) {
  const size = imageWidths.find((w) => w >= width) ?? imageWidths[imageWidths.length - 1];
  return `${mediaBase}/${variantKey(key, size)}`;
}

export function ogImageUrl(key: string) {
  return `${mediaBase}/${ogKey(key)}`;
}
