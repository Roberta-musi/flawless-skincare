import type { Metadata } from "next";
import { ShopSection } from "@/components/shop/shop-section";
import { PageHeader } from "@/components/site/page-header";
import { getCatalog } from "@/lib/data/catalog";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/shop", title: dict.shop.title, description: dict.shop.intro });
}

export default async function ShopPage() {
  const { locale, dict } = await getI18n();
  const catalog = await getCatalog();
  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.shop.title, href: localePath(locale, "/shop") },
        ]}
        title={dict.shop.title}
        intro={dict.shop.intro}
      />
      <ShopSection catalog={catalog} locale={locale} dict={dict} />
    </>
  );
}
