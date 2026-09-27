"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { WhatsAppIcon } from "@/components/icons";
import { Sheet } from "@/components/site/sheet";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { bagCount, type BagLine, bagTotal } from "@/lib/bag/core";
import { bagActions, bagDrawer, useBag, useBagDrawer } from "@/lib/bag/store";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { bagMessage, whatsappUrl } from "@/lib/whatsapp";

export type BagDrawerDict = Pick<Dictionary, "bag" | "whatsapp" | "common" | "product" | "nav">;

function lineLabel(line: BagLine, locale: Locale) {
  const name = localized(line, "name", locale);
  const variant = localized(line, "variant", locale);
  return variant ? `${name} (${variant})` : name;
}

export function BagDrawer({ locale, whatsappNumber, dict }: { locale: Locale; whatsappNumber: string | null; dict: BagDrawerDict }) {
  const lines = useBag();
  const open = useBagDrawer();
  const [name, setName] = useState("");
  const [town, setTown] = useState("");
  const count = bagCount(lines);
  const total = bagTotal(lines);

  const message = bagMessage(dict.whatsapp.messages, {
    lines: lines.map((line) => ({
      product: lineLabel(line, locale),
      quantity: line.quantity,
      price: line.priceXaf == null ? dict.common.priceOnRequest : formatPrice(line.priceXaf * line.quantity, locale),
    })),
    total: total == null ? null : formatPrice(total, locale),
    name,
    town,
  });

  return (
    <Sheet
      open={open}
      onClose={bagDrawer.close}
      side="right"
      label={dict.bag.title}
      closeLabel={dict.common.close}
      header={
        <div className="flex items-baseline gap-3">
          <h2 className="text-2xl">{dict.bag.title}</h2>
          {count > 0 && (
            <span className="text-xs text-muted">
              {count === 1 ? dict.bag.itemsOne : interpolate(dict.bag.items, { count })}
            </span>
          )}
        </div>
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-blush text-fuchsia">
            <ShoppingBag className="size-7" strokeWidth={1.25} />
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-display text-2xl">{dict.bag.empty}</p>
            <p className="text-sm text-muted">{dict.bag.emptyHint}</p>
          </div>
          <ButtonLink href={localePath(locale, "/shop")} onClick={bagDrawer.close} variant="secondary">
            {dict.bag.continue}
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-5 sm:px-6">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5">
                <Link href={localePath(locale, `/products/${line.slug}`)} onClick={bagDrawer.close} className="shrink-0">
                  <ProductImage imageKey={line.imageKey} alt={localized(line, "name", locale)} sizes="80px" className="size-20 rounded-xl" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={localePath(locale, `/products/${line.slug}`)}
                      onClick={bagDrawer.close}
                      className="font-display text-lg leading-snug hover:text-fuchsia"
                    >
                      {localized(line, "name", locale)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => bagActions.setQuantity(line.key, 0)}
                      className="-mr-1 grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-blush hover:text-danger"
                      aria-label={interpolate(dict.bag.remove, { product: localized(line, "name", locale) })}
                    >
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  {line.variantEn && <p className="text-xs text-muted">{localized(line, "variant", locale)}</p>}
                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        onClick={() => bagActions.setQuantity(line.key, line.quantity - 1)}
                        className="grid size-8 place-items-center rounded-full text-plum hover:bg-blush"
                        aria-label={dict.product.decrease}
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm tabular-nums" aria-live="polite">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => bagActions.setQuantity(line.key, line.quantity + 1)}
                        className="grid size-8 place-items-center rounded-full text-plum hover:bg-blush"
                        aria-label={dict.product.increase}
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-medium tabular-nums">
                      {line.priceXaf == null ? dict.common.priceOnRequest : formatPrice(line.priceXaf * line.quantity, locale)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-4 border-t border-line bg-cream/60 px-5 py-5 sm:px-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bag-name" className="text-xs">
                  {dict.bag.name} <span className="font-normal text-muted">· {dict.common.optional}</span>
                </Label>
                <Input id="bag-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-10 text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bag-town" className="text-xs">
                  {dict.bag.town} <span className="font-normal text-muted">· {dict.common.optional}</span>
                </Label>
                <Input
                  id="bag-town"
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  placeholder={dict.bag.townPlaceholder}
                  autoComplete="address-level2"
                  className="h-10 text-sm"
                />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] uppercase tracking-[0.14em] text-muted">{dict.bag.subtotal}</span>
              <span className="font-display text-2xl tabular-nums">{total == null ? dict.common.priceOnRequest : formatPrice(total, locale)}</span>
            </div>
            {whatsappNumber && (
              <a
                href={whatsappUrl(whatsappNumber, message)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "whatsapp", size: "lg" }, "w-full")}
              >
                <WhatsAppIcon />
                {dict.whatsapp.sendOrder}
              </a>
            )}
            <p className="text-center text-xs leading-5 text-muted">{dict.bag.note}</p>
          </div>
        </>
      )}
    </Sheet>
  );
}
