import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { isInStock, isOnSale } from "@/lib/catalog";
import type { ProductSummary } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { QuickAddButton } from "./add-to-bag-button";
import { ProductPrice } from "./price";
import { ProductImage } from "./product-image";

export type ProductCardDict = Pick<Dictionary, "common" | "product" | "bag">;

export function ProductCard({
  product,
  locale,
  dict,
  eager,
}: {
  product: ProductSummary;
  locale: Locale;
  dict: ProductCardDict;
  eager?: boolean;
}) {
  const name = localized(product, "name", locale);
  const href = localePath(locale, `/products/${product.slug}`);
  const inStock = isInStock(product.variants);
  const single = product.variants.length <= 1 ? product.variants[0] : undefined;
  const canQuickAdd = inStock && product.variants.length <= 1 && (!single || single.inStock);
  const badge = !inStock
    ? { tone: "muted" as const, label: dict.common.outOfStock }
    : product.variants.some(isOnSale)
      ? { tone: "fuchsia" as const, label: dict.common.sale }
      : product.isBestseller
        ? { tone: "ivory" as const, label: dict.common.bestseller }
        : product.isNew
          ? { tone: "plum" as const, label: dict.common.new }
          : null;

  return (
    <article className="group relative flex flex-col gap-4">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden>
          <ProductImage
            imageKey={product.image?.key}
            alt={name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            loading={eager ? "eager" : undefined}
            className="aspect-[4/5] rounded-[1.25rem]"
            imageClassName="transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-[1.04]"
          />
        </Link>
        {badge && (
          <Badge tone={badge.tone} className="absolute top-3 left-3 shadow-sm">
            {badge.label}
          </Badge>
        )}
        {canQuickAdd && (
          <QuickAddButton
            item={{
              productId: product.id,
              variantId: single?.id ?? null,
              slug: product.slug,
              nameEn: product.nameEn,
              nameFr: product.nameFr,
              variantEn: single?.labelEn ?? null,
              variantFr: single?.labelFr ?? null,
              priceXaf: single?.priceXaf ?? null,
              imageKey: product.image?.key ?? null,
            }}
            locale={locale}
            labels={{ addToBag: dict.product.addToBag, added: dict.bag.added, view: dict.bag.view }}
            className="absolute right-3 bottom-3 size-11 rounded-full shadow-md md:inset-x-3 md:bottom-3 md:h-11 md:w-auto md:translate-y-2 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5 px-0.5">
        <h3 className="font-display text-xl leading-snug">
          <Link href={href} className="transition-colors hover:text-fuchsia">
            {name}
          </Link>
        </h3>
        <ProductPrice variants={product.variants} locale={locale} labels={dict.common} />
      </div>
    </article>
  );
}
