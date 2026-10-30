"use client";

import { ShoppingBag } from "lucide-react";
import { bagCount } from "@/lib/bag/core";
import { bagDrawer, useBag } from "@/lib/bag/store";
import { interpolate } from "@/lib/i18n/localized";

export function BagButton({ label }: { label: string }) {
  const count = bagCount(useBag());
  return (
    <button
      type="button"
      onClick={bagDrawer.open}
      className="relative grid size-11 place-items-center rounded-full text-plum transition-colors hover:bg-blush"
      aria-label={interpolate(label, { count })}
    >
      <ShoppingBag className="size-5.5" strokeWidth={1.5} />
      {count > 0 && (
        <span
          key={count}
          className="absolute top-1 right-0.5 grid min-w-4.5 animate-rise place-items-center rounded-full bg-fuchsia px-1 text-[10px] leading-4.5 font-semibold text-white"
        >
          {count}
        </span>
      )}
    </button>
  );
}
