export type BagLine = {
  key: string;
  productId: string;
  variantId: string | null;
  slug: string;
  nameEn: string;
  nameFr: string | null;
  variantEn: string | null;
  variantFr: string | null;
  priceXaf: number | null;
  imageKey: string | null;
  quantity: number;
};

export const maxQuantity = 20;

export function lineKey(productId: string, variantId: string | null) {
  return variantId ? `${productId}:${variantId}` : productId;
}

export function addLine(lines: BagLine[], line: Omit<BagLine, "key" | "quantity">, quantity = 1) {
  const key = lineKey(line.productId, line.variantId);
  const existing = lines.find((l) => l.key === key);
  if (existing) return setQuantity(lines, key, existing.quantity + quantity);
  return [...lines, { ...line, key, quantity: Math.min(quantity, maxQuantity) }];
}

export function setQuantity(lines: BagLine[], key: string, quantity: number) {
  if (quantity <= 0) return lines.filter((l) => l.key !== key);
  return lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, maxQuantity) } : l));
}

export function bagCount(lines: BagLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function bagTotal(lines: BagLine[]) {
  if (lines.some((l) => l.priceXaf == null)) return null;
  return lines.reduce((sum, l) => sum + (l.priceXaf ?? 0) * l.quantity, 0);
}

export function parseStoredBag(raw: string | null): BagLine[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (l): l is BagLine =>
        l && typeof l.key === "string" && typeof l.productId === "string" && typeof l.nameEn === "string" && Number.isInteger(l.quantity) && l.quantity > 0,
    );
  } catch {
    return [];
  }
}
