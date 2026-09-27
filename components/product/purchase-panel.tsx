"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClasses } from "@/components/ui/button";
import { maxQuantity } from "@/lib/bag/core";
import { bagActions } from "@/lib/bag/store";
import { isOnSale } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";
import { productMessage, whatsappUrl } from "@/lib/whatsapp";
import { notifyAdded } from "./add-to-bag-button";

type Variant = {
  id: string;
  labelEn: string;
  labelFr: string | null;
  priceXaf: number | null;
  compareAtPriceXaf: number | null;
  inStock: boolean;
};

export function PurchasePanel({
  product,
  variants,
  locale,
  whatsappNumber,
  productUrl,
  dict,
}: {
  product: { id: string; slug: string; nameEn: string; nameFr: string | null; imageKey: string | null };
  variants: Variant[];
  locale: Locale;
  whatsappNumber: string | null;
  productUrl: string;
  dict: Pick<Dictionary, "product" | "common" | "whatsapp" | "bag">;
}) {
  const [selectedId, setSelectedId] = useState(() => (variants.find((v) => v.inStock) ?? variants[0])?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const variant = variants.find((v) => v.id === selectedId) ?? null;
  const name = localized(product, "name", locale);
  const variantLabel = variant ? localized(variant, "label", locale) : null;
  const available = variant ? variant.inStock : true;
  const unitPrice = variant?.priceXaf ?? null;

  const label = variantLabel && variants.length > 1 ? `${name} (${variantLabel})` : name;
  const message = productMessage(dict.whatsapp.messages, {
    product: quantity > 1 ? `${quantity} × ${label}` : label,
    price: unitPrice == null ? null : formatPrice(unitPrice * quantity, locale),
    url: productUrl,
  });

  function add() {
    const item = {
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      nameEn: product.nameEn,
      nameFr: product.nameFr,
      variantEn: variant?.labelEn ?? null,
      variantFr: variant?.labelFr ?? null,
      priceXaf: unitPrice,
      imageKey: product.imageKey,
    };
    bagActions.add(item, quantity);
    notifyAdded(item, locale, dict.bag);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-display text-3xl tabular-nums">{unitPrice == null ? dict.common.priceOnRequest : formatPrice(unitPrice, locale)}</p>
        {variant && isOnSale(variant) && (
          <>
            <s className="text-base text-muted tabular-nums">{formatPrice(variant.compareAtPriceXaf!, locale)}</s>
            <Badge tone="fuchsia">
              {interpolate(dict.product.save, { amount: formatPrice(variant.compareAtPriceXaf! - variant.priceXaf!, locale) })}
            </Badge>
          </>
        )}
        {!available && <Badge tone="muted">{dict.common.outOfStock}</Badge>}
      </div>

      {variants.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[11px] font-medium tracking-[0.24em] text-gold-deep uppercase">
            {dict.product.size}
            {variantLabel && <span className="ml-2 tracking-normal text-plum normal-case">{variantLabel}</span>}
          </legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {variants.map((v) => {
              const active = v.id === selectedId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedId(v.id)}
                  className={cn(
                    "flex min-w-24 flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition-colors",
                    active ? "border-plum bg-plum text-ivory" : "border-line bg-white hover:border-plum/40",
                    !v.inStock && "opacity-60",
                  )}
                >
                  <span className="text-sm font-medium">{localized(v, "label", locale)}</span>
                  <span className={cn("text-xs tabular-nums", active ? "text-ivory/70" : "text-muted")}>
                    {v.priceXaf == null ? dict.common.priceOnRequest : formatPrice(v.priceXaf, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex gap-3">
        <div className="flex h-13 items-center rounded-full border border-line bg-white" role="group" aria-label={dict.product.quantity}>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid size-12 place-items-center rounded-full text-plum hover:bg-blush disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label={dict.product.decrease}
          >
            <Minus className="size-4" />
          </button>
          <span className="w-8 text-center tabular-nums" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            className="grid size-12 place-items-center rounded-full text-plum hover:bg-blush"
            aria-label={dict.product.increase}
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button size="lg" className="min-w-0 flex-1 shrink px-5" onClick={add} disabled={!available}>
          <ShoppingBag />
          {dict.product.addToBag}
        </Button>
      </div>

      {whatsappNumber && (
        <a
          href={whatsappUrl(whatsappNumber, message)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses({ variant: "whatsapp", size: "lg" }, "w-full")}
        >
          <WhatsAppIcon />
          {available ? dict.whatsapp.order : dict.whatsapp.ask}
        </a>
      )}
      <p className="text-xs leading-5 text-muted">{dict.common.indicativePrices}</p>
    </div>
  );
}
