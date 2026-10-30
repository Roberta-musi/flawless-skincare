"use client";

import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ExternalLink, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Card } from "@/components/admin/ui";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { deleteProductAction, saveProductAction } from "@/lib/actions/admin/catalog";
import { cn } from "@/lib/cn";
import type { CatalogOptions, ProductForEdit } from "@/lib/data/admin/catalog";
import { isTranslated } from "@/lib/i18n/localized";
import { uploadImage } from "@/lib/media/prepare";
import { slugify } from "@/lib/slug";
import type { ProductInput } from "@/lib/validation/admin";
import { ChipGroup, type Lang, LangSwitch, numberOrNull, SaveBar, SeoFields, TextField, Toggle } from "./form-kit";

type Draft = ProductInput;

const translatable = ["name", "shortDescription", "description", "benefits", "howToUse", "keyIngredients"];

function emptyDraft(): Draft {
  return {
    slug: "",
    categoryId: null,
    nameEn: "",
    nameFr: null,
    shortDescriptionEn: null,
    shortDescriptionFr: null,
    descriptionEn: null,
    descriptionFr: null,
    benefitsEn: [],
    benefitsFr: [],
    howToUseEn: null,
    howToUseFr: null,
    keyIngredientsEn: null,
    keyIngredientsFr: null,
    inci: null,
    isPublished: false,
    isFeatured: false,
    isBestseller: false,
    isNew: true,
    sortOrder: 0,
    seoTitleEn: null,
    seoTitleFr: null,
    seoDescriptionEn: null,
    seoDescriptionFr: null,
    variants: [{ labelEn: "Standard size", labelFr: "Format standard", priceXaf: null, compareAtPriceXaf: null, inStock: true }],
    images: [],
    concernIds: [],
    skinTypeIds: [],
    pairingIds: [],
    setItems: [],
  };
}

function toDraft(product: ProductForEdit): Draft {
  return {
    id: product.id,
    slug: product.slug,
    categoryId: product.categoryId,
    nameEn: product.nameEn,
    nameFr: product.nameFr,
    shortDescriptionEn: product.shortDescriptionEn,
    shortDescriptionFr: product.shortDescriptionFr,
    descriptionEn: product.descriptionEn,
    descriptionFr: product.descriptionFr,
    benefitsEn: product.benefitsEn,
    benefitsFr: product.benefitsFr,
    howToUseEn: product.howToUseEn,
    howToUseFr: product.howToUseFr,
    keyIngredientsEn: product.keyIngredientsEn,
    keyIngredientsFr: product.keyIngredientsFr,
    inci: product.inci,
    isPublished: product.isPublished,
    isFeatured: product.isFeatured,
    isBestseller: product.isBestseller,
    isNew: product.isNew,
    sortOrder: product.sortOrder,
    seoTitleEn: product.seoTitleEn,
    seoTitleFr: product.seoTitleFr,
    seoDescriptionEn: product.seoDescriptionEn,
    seoDescriptionFr: product.seoDescriptionFr,
    variants: product.variants.map((v) => ({
      id: v.id,
      labelEn: v.labelEn,
      labelFr: v.labelFr,
      priceXaf: v.priceXaf,
      compareAtPriceXaf: v.compareAtPriceXaf,
      inStock: v.inStock,
    })),
    images: product.images.map((i) => ({ id: i.id, key: i.key, width: i.width, height: i.height, altEn: i.altEn, altFr: i.altFr })),
    concernIds: product.concernIds,
    skinTypeIds: product.skinTypeIds,
    pairingIds: product.pairingIds,
    setItems: product.setItems,
  };
}

function move<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function ProductEditor({ product, options }: { product: ProductForEdit | null; options: CatalogOptions }) {
  const router = useRouter();
  const initial = useMemo(() => (product ? toDraft(product) : emptyDraft()), [product]);
  const [draft, setDraft] = useState<Draft>(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [uploading, setUploading] = useState(0);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const fileInput = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(draft) !== saved;
  const suffix = lang === "en" ? "En" : "Fr";

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const text = (field: string) => (draft as Record<string, unknown>)[`${field}${suffix}`] as string | null;
  const setText = (field: string, value: string) =>
    setDraft((d) => {
      const next = { ...d, [`${field}${suffix}`]: value || (lang === "fr" ? null : value) } as Draft;
      if (field === "name" && lang === "en" && !slugTouched) next.slug = slugify(value);
      return next;
    });
  const err = (key: string) => errors[key];

  async function addFiles(files: FileList) {
    const list = [...files].slice(0, 12 - draft.images.length);
    setUploading(list.length);
    for (const file of list) {
      try {
        const image = await uploadImage(file, "products");
        setDraft((d) => ({ ...d, images: [...d.images, { ...image, altEn: null, altFr: null }] }));
      } catch (error) {
        toast.error(`${file.name}: ${error instanceof Error ? error.message : "upload failed"}`);
      }
      setUploading((n) => n - 1);
    }
  }

  function save() {
    startSaving(async () => {
      const result = await saveProductAction({
        ...draft,
        benefitsEn: draft.benefitsEn.map((b) => b.trim()).filter(Boolean),
        benefitsFr: draft.benefitsFr.map((b) => b.trim()).filter(Boolean),
      });
      if (!result.ok) {
        setErrors(result.errors);
        toast.error(result.errors.form ?? "Please fix the highlighted fields.");
        return;
      }
      setErrors({});
      setSaved(JSON.stringify({ ...draft, id: result.id }));
      toast.success(draft.isPublished ? "Saved. The website is updated." : "Saved as a draft.");
      if (!draft.id) router.replace(`/admin/products/${result.id}`);
      else router.refresh();
    });
  }

  const others = options.products.filter((p) => p.id !== draft.id);
  const frenchMissing = !isTranslated(draft, translatable);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LangSwitch value={lang} onChange={setLang} frenchMissing={frenchMissing} />
        {draft.id && draft.isPublished && (
          <ButtonAnchor href={`/products/${draft.slug}`} target="_blank" variant="ghost" size="sm">
            <ExternalLink />
            View on website
          </ButtonAnchor>
        )}
      </div>
      {lang === "fr" && (
        <p className="rounded-2xl bg-lilac/60 px-4 py-3 text-sm leading-6 text-plum/80">
          French fields are optional. Anything left empty shows the English text on the French website.
        </p>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card title="Product details">
            <div className="flex flex-col gap-5">
              <TextField id="name" label={lang === "en" ? "Name" : "Name (French)"} value={text("name")} onChange={(v) => setText("name", v)} error={err(`name${suffix}`)} />
              <TextField
                id="short"
                label="Short description"
                hint="One or two sentences shown under the name and in search results."
                value={text("shortDescription")}
                onChange={(v) => setText("shortDescription", v)}
                multiline
                rows={2}
                optional
              />
              <TextField
                id="benefits"
                label="Benefits"
                hint="One benefit per line. Describe what customers notice; avoid medical promises."
                value={(lang === "en" ? draft.benefitsEn : draft.benefitsFr).join("\n")}
                onChange={(v) =>
                  set(
                    lang === "en" ? "benefitsEn" : "benefitsFr",
                    v.split("\n").map((line) => line.trimStart()).filter((line, i, all) => line || i === all.length - 1),
                  )
                }
                multiline
                rows={3}
                optional
              />
              <TextField id="description" label="Full description" value={text("description")} onChange={(v) => setText("description", v)} multiline rows={5} optional hint="Use **bold** and start lines with - for lists." />
              <TextField id="howToUse" label="How to use" value={text("howToUse")} onChange={(v) => setText("howToUse", v)} multiline rows={3} optional />
              <TextField id="keyIngredients" label="Key ingredients" value={text("keyIngredients")} onChange={(v) => setText("keyIngredients", v)} multiline rows={2} optional />
              {lang === "en" && (
                <TextField id="inci" label="Full ingredient list (INCI)" value={draft.inci} onChange={(v) => set("inci", v)} multiline rows={3} optional hint="Copied from the label, in the same order." />
              )}
            </div>
          </Card>

          <Card title="Photos" description="The first photo is the main one. Photos are resized automatically for fast loading.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {draft.images.map((image, i) => (
                <div key={image.key} className="flex flex-col gap-2">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-cream ring-1 ring-line">
                    <Image src={image.key} alt="" fill sizes="200px" className="object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-plum px-2 py-0.5 text-[10px] text-ivory">
                        <Star className="size-3" fill="currentColor" /> Main
                      </span>
                    )}
                    <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1">
                      <div className="flex gap-1">
                        <button type="button" onClick={() => set("images", move(draft.images, i, i - 1))} className="grid size-8 place-items-center rounded-full bg-white/90 text-plum disabled:opacity-40" disabled={i === 0} aria-label="Move earlier">
                          <ArrowLeft className="size-4" />
                        </button>
                        <button type="button" onClick={() => set("images", move(draft.images, i, i + 1))} className="grid size-8 place-items-center rounded-full bg-white/90 text-plum disabled:opacity-40" disabled={i === draft.images.length - 1} aria-label="Move later">
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                      <button type="button" onClick={() => set("images", draft.images.filter((_, j) => j !== i))} className="grid size-8 place-items-center rounded-full bg-white/90 text-danger" aria-label="Remove photo">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  <Input
                    value={(lang === "en" ? image.altEn : image.altFr) ?? ""}
                    onChange={(e) =>
                      set(
                        "images",
                        draft.images.map((img, j) => (j === i ? { ...img, [lang === "en" ? "altEn" : "altFr"]: e.target.value || null } : img)),
                      )
                    }
                    placeholder="Describe the photo"
                    aria-label={`Photo ${i + 1} description`}
                    className="h-10 text-sm"
                  />
                </div>
              ))}
              {draft.images.length < 12 && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading > 0}
                  className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-plum/25 text-sm text-muted transition-colors hover:border-fuchsia hover:text-fuchsia"
                >
                  {uploading > 0 ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" strokeWidth={1.5} />}
                  {uploading > 0 ? `Uploading ${uploading}…` : "Add photos"}
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </Card>

          <Card title="Sizes & prices" description="Prices are in FCFA. Leave the price empty to show “Price on request”.">
            {err("variants") && <p className="mb-3 text-sm text-danger">{err("variants")}</p>}
            <ul className="flex flex-col gap-3">
              {draft.variants.map((variant, i) => (
                <li key={variant.id ?? `new-${i}`} className="flex flex-col gap-3 rounded-2xl bg-cream/70 p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <Field label={lang === "en" ? "Size" : "Size (French)"} htmlFor={`v-label-${i}`} error={err(`variants.${i}.label${suffix}`)} className="col-span-2 sm:col-span-1">
                      <Input
                        id={`v-label-${i}`}
                        value={(lang === "en" ? variant.labelEn : variant.labelFr) ?? ""}
                        onChange={(e) => set("variants", draft.variants.map((v, j) => (j === i ? { ...v, [lang === "en" ? "labelEn" : "labelFr"]: e.target.value } : v)))}
                        placeholder="e.g. 250 ml, Big size"
                      />
                    </Field>
                    <Field label="Price (FCFA)" htmlFor={`v-price-${i}`} error={err(`variants.${i}.priceXaf`)}>
                      <Input id={`v-price-${i}`} inputMode="numeric" value={variant.priceXaf ?? ""} onChange={(e) => set("variants", draft.variants.map((v, j) => (j === i ? { ...v, priceXaf: numberOrNull(e.target.value) } : v)))} />
                    </Field>
                    <Field label="Old price" htmlFor={`v-old-${i}`} error={err(`variants.${i}.compareAtPriceXaf`)} optional optionalLabel="Sale">
                      <Input
                        id={`v-old-${i}`}
                        inputMode="numeric"
                        value={variant.compareAtPriceXaf ?? ""}
                        onChange={(e) => set("variants", draft.variants.map((v, j) => (j === i ? { ...v, compareAtPriceXaf: numberOrNull(e.target.value) } : v)))}
                      />
                    </Field>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <Toggle
                      checked={variant.inStock}
                      onChange={(inStock) => set("variants", draft.variants.map((v, j) => (j === i ? { ...v, inStock } : v)))}
                      label={variant.inStock ? "In stock" : "Out of stock"}
                    />
                    <div className="flex gap-1">
                      <button type="button" onClick={() => set("variants", move(draft.variants, i, i - 1))} disabled={i === 0} className="grid size-9 place-items-center rounded-full text-plum hover:bg-white disabled:opacity-30" aria-label="Move up">
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" onClick={() => set("variants", move(draft.variants, i, i + 1))} disabled={i === draft.variants.length - 1} className="grid size-9 place-items-center rounded-full text-plum hover:bg-white disabled:opacity-30" aria-label="Move down">
                        <ArrowDown className="size-4" />
                      </button>
                      <button type="button" onClick={() => set("variants", draft.variants.filter((_, j) => j !== i))} disabled={draft.variants.length === 1} className="grid size-9 place-items-center rounded-full text-danger hover:bg-white disabled:opacity-30" aria-label="Remove size">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => set("variants", [...draft.variants, { labelEn: "", labelFr: null, priceXaf: null, compareAtPriceXaf: null, inStock: true }])}
            >
              <Plus />
              Add a size
            </Button>
          </Card>

          <Card title="Search engines" description="How this product appears on Google.">
            <SeoFields
              lang={lang}
              slug={draft.slug}
              onSlugChange={(value) => {
                setSlugTouched(true);
                set("slug", value);
              }}
              slugPrefix="/products/"
              title={text("seoTitle")}
              description={text("seoDescription")}
              onTitleChange={(v) => setText("seoTitle", v)}
              onDescriptionChange={(v) => setText("seoDescription", v)}
              fallbackTitle={(lang === "fr" && draft.nameFr) || draft.nameEn}
              fallbackDescription={(lang === "fr" && draft.shortDescriptionFr) || draft.shortDescriptionEn || ""}
              errors={errors}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Visibility">
            <div className="flex flex-col gap-5">
              <Toggle checked={draft.isPublished} onChange={(v) => set("isPublished", v)} label="Show on the website" description="Turn off to keep it as a draft." />
              <Toggle checked={draft.isBestseller} onChange={(v) => set("isBestseller", v)} label="Bestseller" description="Shown on the home page." />
              <Toggle checked={draft.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured" description="Shown first in the shop." />
              <Toggle checked={draft.isNew} onChange={(v) => set("isNew", v)} label="New" />
            </div>
          </Card>

          <Card title="Organisation">
            <div className="flex flex-col gap-5">
              <Field label="Category" htmlFor="category">
                <Select id="category" value={draft.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)}>
                  <option value="">No category</option>
                  {options.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium">Concerns it helps with</p>
                <ChipGroup options={options.concerns.map((c) => ({ id: c.id, label: c.nameEn }))} selected={draft.concernIds} onChange={(ids) => set("concernIds", ids)} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium">Suitable skin types</p>
                <ChipGroup options={options.skinTypes.map((s) => ({ id: s.id, label: s.nameEn }))} selected={draft.skinTypeIds} onChange={(ids) => set("skinTypeIds", ids)} />
              </div>
              <Field label="Order in lists" htmlFor="sort" hint="Lower numbers appear first.">
                <Input id="sort" inputMode="numeric" value={draft.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value.replace(/[^\d-]/g, "")) || 0)} />
              </Field>
            </div>
          </Card>

          <Card title="Pairs well with" description="Up to 8 products suggested on this product's page.">
            <ProductPicker products={others} selected={draft.pairingIds} onChange={(ids) => set("pairingIds", ids.slice(0, 8))} />
          </Card>

          <Card title="What's in the set" description="Only for sets and bundles.">
            <ul className="flex flex-col gap-2">
              {draft.setItems.map((item, i) => (
                <li key={item.productId} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm">{others.find((p) => p.id === item.productId)?.nameEn ?? "Removed product"}</span>
                  <Input
                    inputMode="numeric"
                    value={item.quantity}
                    onChange={(e) => set("setItems", draft.setItems.map((s, j) => (j === i ? { ...s, quantity: Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1) } : s)))}
                    className="h-10 w-16 text-center"
                    aria-label="Quantity"
                  />
                  <button type="button" onClick={() => set("setItems", draft.setItems.filter((_, j) => j !== i))} className="grid size-9 place-items-center rounded-full text-muted hover:text-danger" aria-label="Remove from set">
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Select
              value=""
              onChange={(e) => e.target.value && set("setItems", [...draft.setItems, { productId: e.target.value, quantity: 1 }])}
              className="mt-3 h-11 text-sm"
              aria-label="Add a product to the set"
            >
              <option value="">Add a product…</option>
              {others
                .filter((p) => !draft.setItems.some((s) => s.productId === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameEn}
                  </option>
                ))}
            </Select>
          </Card>

          {draft.id && (
            <Card title="Delete product" description="This removes it and its photos from the website for good.">
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10"
                onClick={() => {
                  if (confirm(`Delete “${draft.nameEn}”? This cannot be undone.`)) startSaving(() => deleteProductAction(draft.id!));
                }}
              >
                <Trash2 />
                Delete product
              </Button>
            </Card>
          )}
        </div>
      </div>

      <SaveBar saving={saving} dirty={dirty} onSave={save} label={draft.id ? "Save changes" : "Create product"} />
    </div>
  );
}

function ProductPicker({ products, selected, onChange }: { products: { id: string; nameEn: string; isPublished: boolean }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  const [query, setQuery] = useState("");
  const shown = products.filter((p) => selected.includes(p.id) || p.nameEn.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="flex flex-col gap-3">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="h-10 text-sm" />
      <ul className="flex max-h-64 flex-col overflow-y-auto">
        {shown.map((p) => {
          const active = selected.includes(p.id);
          return (
            <li key={p.id}>
              <label className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-cream", !p.isPublished && "text-muted")}>
                <input type="checkbox" checked={active} onChange={() => onChange(active ? selected.filter((id) => id !== p.id) : [...selected, p.id])} className="size-4 accent-fuchsia" />
                {p.nameEn}
                {!p.isPublished && <span className="text-[11px]">(draft)</span>}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
