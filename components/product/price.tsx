import { hasPriceRange, isOnSale, lowestPrice, type VariantLike } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

export function ProductPrice({
  variants,
  locale,
  labels,
  className,
}: {
  variants: VariantLike[];
  locale: Locale;
  labels: { from: string; priceOnRequest: string };
  className?: string;
}) {
  const lowest = lowestPrice(variants);
  if (lowest == null) return <span className={cn("text-sm text-muted", className)}>{labels.priceOnRequest}</span>;

  if (hasPriceRange(variants)) {
    return (
      <span className={cn("text-sm tabular-nums", className)}>
        <span className="text-muted">{labels.from} </span>
        {formatPrice(lowest, locale)}
      </span>
    );
  }

  const variant = variants.find((v) => v.priceXaf === lowest)!;
  return (
    <span className={cn("flex items-baseline gap-2 text-sm tabular-nums", className)}>
      <span className={cn(isOnSale(variant) && "text-fuchsia")}>{formatPrice(lowest, locale)}</span>
      {isOnSale(variant) && <s className="text-xs text-muted">{formatPrice(variant.compareAtPriceXaf!, locale)}</s>}
    </span>
  );
}
