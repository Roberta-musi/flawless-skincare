import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Container } from "@/components/ui/layout";
import type { Catalog } from "@/lib/data/catalog";
import type { Locale } from "@/lib/i18n/config";
import { ShopBrowser, type ShopDict } from "./shop-browser";

export function ShopSection({
  catalog,
  locale,
  dict,
  lockedCategoryId,
}: {
  catalog: Catalog;
  locale: Locale;
  dict: ShopDict;
  lockedCategoryId?: string;
}) {
  const products = lockedCategoryId ? catalog.products.filter((p) => p.categoryId === lockedCategoryId) : catalog.products;
  const pick = <T extends { id: string; slug: string; nameEn: string; nameFr: string | null }>(items: T[]) =>
    items.map(({ id, slug, nameEn, nameFr }) => ({ id, slug, nameEn, nameFr }));

  return (
    <Container className="py-12 md:py-16">
      <Suspense
        fallback={
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:gap-x-6 lg:ml-[18.5rem] xl:grid-cols-3">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} locale={locale} dict={dict} eager={i < 2} />
            ))}
          </div>
        }
      >
        <ShopBrowser
          products={catalog.products}
          categories={pick(catalog.categories)}
          concerns={pick(catalog.concerns)}
          skinTypes={pick(catalog.skinTypes)}
          locale={locale}
          dict={{ common: dict.common, product: dict.product, bag: dict.bag, shop: dict.shop, whatsapp: dict.whatsapp }}
          lockedCategoryId={lockedCategoryId}
        />
      </Suspense>
    </Container>
  );
}
