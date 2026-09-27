"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard, type ProductCardDict } from "@/components/product/product-card";
import { Sheet } from "@/components/site/sheet";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { filterProducts, type SortOption, sortOptions } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import type { ProductSummary } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";

type Term = { id: string; slug: string; nameEn: string; nameFr: string | null };
export type ShopDict = ProductCardDict & Pick<Dictionary, "shop" | "whatsapp">;

type Props = {
  products: ProductSummary[];
  categories: Term[];
  concerns: Term[];
  skinTypes: Term[];
  locale: Locale;
  dict: ShopDict;
  lockedCategoryId?: string;
};

function resultsLabel(dict: ShopDict, count: number) {
  return count === 1 ? dict.shop.resultsOne : interpolate(dict.shop.results, { count });
}

export function ShopBrowser({ products, categories, concerns, skinTypes, locale, dict, lockedCategoryId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const bySlug = (terms: Term[], key: string) => terms.find((t) => t.slug === searchParams.get(key)) ?? null;
  const category = lockedCategoryId ? null : bySlug(categories, "category");
  const concern = bySlug(concerns, "concern");
  const skinType = bySlug(skinTypes, "skin");
  const sortParam = searchParams.get("sort");
  const sort: SortOption = sortOptions.includes(sortParam as SortOption) ? (sortParam as SortOption) : "featured";

  const scoped = useMemo(
    () => (lockedCategoryId ? products.filter((p) => p.categoryId === lockedCategoryId) : products),
    [products, lockedCategoryId],
  );
  const results = useMemo(
    () =>
      filterProducts(
        scoped,
        { categoryId: category?.id, concernId: concern?.id, skinTypeId: skinType?.id, query, sort },
        locale,
      ),
    [scoped, category, concern, skinType, query, sort, locale],
  );

  const availableConcerns = concerns.filter((c) => scoped.some((p) => p.concernIds.includes(c.id)));
  const availableSkinTypes = skinTypes.filter((s) => scoped.some((p) => p.skinTypeIds.includes(s.id)));
  const activeCount = [category, concern, skinType].filter(Boolean).length;

  function update(values: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(values)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if ((searchParams.get("q") ?? "") === query.trim()) return;
    const timer = setTimeout(() => update({ q: query.trim() || null }), 350);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (window.location.hash === "#search") searchRef.current?.focus();
  }, []);

  const panel = (
    <FilterPanel
      locale={locale}
      dict={dict}
      categories={lockedCategoryId ? [] : categories}
      concerns={availableConcerns}
      skinTypes={availableSkinTypes}
      selected={{ category: category?.slug, concern: concern?.slug, skin: skinType?.slug }}
      counts={{
        category: (id) => products.filter((p) => p.categoryId === id).length,
        all: products.length,
      }}
      onChange={update}
    />
  );

  const chips = [
    category && { key: "category", label: localized(category, "name", locale) },
    concern && { key: "concern", label: localized(concern, "name", locale) },
    skinType && { key: "skin", label: localized(skinType, "name", locale) },
  ].filter((chip): chip is { key: string; label: string } => Boolean(chip));

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <aside className="hidden lg:block">
        <div className="sticky top-28">{panel}</div>
      </aside>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted" strokeWidth={1.5} />
          <input
            ref={searchRef}
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={dict.shop.search}
            aria-label={dict.shop.search}
            className="h-13 w-full rounded-full border border-line bg-white pr-5 pl-11 text-base text-plum placeholder:text-muted/70 focus:border-fuchsia focus:ring-3 focus:ring-fuchsia/10 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setFiltersOpen(true)} className="lg:hidden">
              <SlidersHorizontal />
              {dict.shop.filters}
              {activeCount > 0 && <span className="grid size-5 place-items-center rounded-full bg-fuchsia text-[10px] text-white">{activeCount}</span>}
            </Button>
            <p className="hidden text-sm text-muted sm:block" aria-live="polite">
              {resultsLabel(dict, results.length)}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <span className="hidden sm:inline">{dict.shop.sort}</span>
            <Select
              value={sort}
              onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
              className="h-10 w-auto rounded-full py-0 pr-9 pl-4 text-sm"
              aria-label={dict.shop.sort}
            >
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {dict.shop.sortOptions[option]}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <p className="-mt-2 text-sm text-muted sm:hidden">{resultsLabel(dict, results.length)}</p>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => update({ [chip.key]: null })}
                className="flex items-center gap-1.5 rounded-full bg-blush px-3.5 py-1.5 text-xs text-fuchsia-deep transition-colors hover:bg-blush-deep"
              >
                {chip.label}
                <X className="size-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => update({ category: null, concern: null, skin: null })}
              className="px-2 text-xs text-muted underline-offset-4 hover:text-plum hover:underline"
            >
              {dict.shop.clear}
            </button>
          </div>
        )}

        {results.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 xl:grid-cols-3">
            {results.map((product, i) => (
              <ProductCard key={product.id} product={product} locale={locale} dict={dict} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-[1.5rem] bg-cream/70 px-6 py-16 text-center">
            <p className="font-display text-2xl">{dict.shop.empty}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setQuery("");
                update({ category: null, concern: null, skin: null, q: null });
              }}
            >
              {dict.shop.clear}
            </Button>
          </div>
        )}
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        side="left"
        label={dict.shop.filters}
        closeLabel={dict.common.close}
        header={<h2 className="text-2xl">{dict.shop.filters}</h2>}
      >
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">{panel}</div>
        <div className="border-t border-line bg-cream/60 px-5 py-4 sm:px-6">
          <Button className="w-full" onClick={() => setFiltersOpen(false)}>
            {results.length === 1 ? dict.shop.showResultsOne : interpolate(dict.shop.showResults, { count: results.length })}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function FilterPanel({
  locale,
  dict,
  categories,
  concerns,
  skinTypes,
  selected,
  counts,
  onChange,
}: {
  locale: Locale;
  dict: ShopDict;
  categories: Term[];
  concerns: Term[];
  skinTypes: Term[];
  selected: { category?: string; concern?: string; skin?: string };
  counts: { category: (id: string) => number; all: number };
  onChange: (values: Record<string, string | null>) => void;
}) {
  const heading = "mb-3 text-[11px] font-medium tracking-[0.24em] text-gold uppercase";
  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
      active ? "border-plum bg-plum text-ivory" : "border-line bg-white text-plum hover:border-plum/40",
    );

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 0 && (
        <fieldset>
          <legend className={heading}>{dict.shop.category}</legend>
          <ul className="flex flex-col">
            {[{ id: "", slug: "", nameEn: dict.shop.all, nameFr: dict.shop.all }, ...categories].map((c) => {
              const active = (selected.category ?? "") === c.slug;
              return (
                <li key={c.slug || "all"}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ category: c.slug || null })}
                    className={cn(
                      "flex w-full items-center justify-between py-2 text-left text-[15px] transition-colors",
                      active ? "font-medium text-fuchsia" : "text-plum/80 hover:text-plum",
                    )}
                  >
                    <span>{localized(c, "name", locale)}</span>
                    <span className="text-xs text-muted tabular-nums">{c.id ? counts.category(c.id) : counts.all}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}
      {concerns.length > 0 && (
        <fieldset>
          <legend className={heading}>{dict.shop.concern}</legend>
          <div className="flex flex-wrap gap-2">
            {concerns.map((c) => {
              const active = selected.concern === c.slug;
              return (
                <button key={c.id} type="button" aria-pressed={active} onClick={() => onChange({ concern: active ? null : c.slug })} className={chip(active)}>
                  {localized(c, "name", locale)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {skinTypes.length > 0 && (
        <fieldset>
          <legend className={heading}>{dict.shop.skinType}</legend>
          <div className="flex flex-wrap gap-2">
            {skinTypes.map((s) => {
              const active = selected.skin === s.slug;
              return (
                <button key={s.id} type="button" aria-pressed={active} onClick={() => onChange({ skin: active ? null : s.slug })} className={chip(active)}>
                  {localized(s, "name", locale)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
}
