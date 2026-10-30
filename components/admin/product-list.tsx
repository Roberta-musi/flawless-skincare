"use client";

import { ChevronRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/field";
import { setProductPublishedAction } from "@/lib/actions/admin/catalog";
import { lowestPrice } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { EmptyState, StatusPill } from "./ui";

type Row = {
  id: string;
  nameEn: string;
  nameFr: string | null;
  isPublished: boolean;
  isBestseller: boolean;
  category: { nameEn: string } | null;
  images: { key: string }[];
  variants: { priceXaf: number | null; compareAtPriceXaf: number | null; inStock: boolean }[];
};

const filters = [
  { id: "all", label: "All" },
  { id: "published", label: "On the website" },
  { id: "draft", label: "Drafts" },
  { id: "out", label: "Out of stock" },
] as const;

export function ProductList({ products }: { products: Row[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [pending, startTransition] = useTransition();

  const shown = products.filter((p) => {
    if (filter === "published" && !p.isPublished) return false;
    if (filter === "draft" && p.isPublished) return false;
    if (filter === "out" && p.variants.some((v) => v.inStock)) return false;
    const q = query.trim().toLowerCase();
    return !q || p.nameEn.toLowerCase().includes(q) || p.nameFr?.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" className="h-11 rounded-full pl-10" />
        </div>
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors",
                filter === f.id ? "bg-plum text-ivory" : "bg-white text-plum ring-1 ring-line hover:bg-cream",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-line">
          {shown.map((product) => {
            const price = lowestPrice(product.variants);
            const inStock = product.variants.some((v) => v.inStock);
            return (
              <li key={product.id} className="flex items-center gap-3 pr-3">
                <Link href={`/admin/products/${product.id}`} className="flex min-w-0 flex-1 items-center gap-4 p-3 transition-colors hover:bg-cream/60 sm:px-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-blush">
                    {product.images[0] && <Image src={product.images[0].key} alt="" fill sizes="56px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{product.nameEn}</p>
                    <p className="truncate text-xs text-muted">
                      {product.category?.nameEn ?? "No category"} · {price == null ? "Price on request" : formatPrice(price, "en")}
                      {!inStock && " · Out of stock"}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-plum/30" />
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await setProductPublishedAction(product.id, !product.isPublished);
                      toast.success(product.isPublished ? `“${product.nameEn}” is now hidden.` : `“${product.nameEn}” is now on the website.`);
                    })
                  }
                  title={product.isPublished ? "Hide from website" : "Show on website"}
                >
                  <StatusPill status={product.isPublished ? "published" : "draft"}>{product.isPublished ? "Live" : "Draft"}</StatusPill>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="No products found" body="Try another search or filter." />
      )}
    </div>
  );
}
