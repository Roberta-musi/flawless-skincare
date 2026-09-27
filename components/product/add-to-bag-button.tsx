"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { BagLine } from "@/lib/bag/core";
import { bagActions, bagDrawer } from "@/lib/bag/store";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import { interpolate, localized } from "@/lib/i18n/localized";

export type BagItemInput = Omit<BagLine, "key" | "quantity">;

export function notifyAdded(item: BagItemInput, locale: Locale, labels: { added: string; view: string }) {
  toast.success(interpolate(labels.added, { product: localized(item, "name", locale) }), {
    action: { label: labels.view, onClick: bagDrawer.open },
  });
}

export function QuickAddButton({
  item,
  locale,
  labels,
  className,
}: {
  item: BagItemInput;
  locale: Locale;
  labels: { addToBag: string; added: string; view: string };
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        bagActions.add(item);
        notifyAdded(item, locale, labels);
      }}
      className={cn(
        "flex items-center justify-center gap-2 bg-ivory/95 text-[11px] font-medium tracking-[0.16em] text-plum uppercase backdrop-blur transition-all duration-300 hover:bg-plum hover:text-ivory",
        className,
      )}
      aria-label={`${labels.addToBag}: ${localized(item, "name", locale)}`}
    >
      <Plus className="size-4" strokeWidth={1.75} />
      <span className="max-md:sr-only">{labels.addToBag}</span>
    </button>
  );
}
