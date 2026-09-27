import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons";
import { ShopSection } from "@/components/shop/shop-section";
import { PageHeader } from "@/components/site/page-header";
import { ButtonAnchor } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { getCatalog } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/site";
import { interpolate, isTranslated, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { businessWhatsAppUrl } from "@/lib/site";

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return catalog.categories.map((c) => ({ category: c.slug }));
}

async function findCategory(slug: string) {
  const catalog = await getCatalog();
  const category = catalog.categories.find((c) => c.slug === slug);
  return category ? { catalog, category } : null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/shop/[category]">): Promise<Metadata> {
  const { locale } = await getI18n();
  const found = await findCategory((await params).category);
  if (!found) return {};
  const { category } = found;
  return pageMetadata({
    locale,
    path: `/shop/${category.slug}`,
    title: localized(category, "seoTitle", locale) ?? localized(category, "name", locale),
    description: localized(category, "seoDescription", locale) ?? localized(category, "intro", locale),
    images: category.imageKey ? [{ url: `/media/${category.imageKey}-1600.webp` }] : undefined,
    translated: isTranslated(category, ["name", "intro"]),
  });
}

export default async function CategoryPage({ params }: PageProps<"/[locale]/shop/[category]">) {
  const { locale, dict } = await getI18n();
  const found = await findCategory((await params).category);
  if (!found) notFound();
  const { catalog, category } = found;
  const name = localized(category, "name", locale);
  const hasProducts = catalog.products.some((p) => p.categoryId === category.id);
  const whatsapp = businessWhatsAppUrl(await getSettings(), interpolate(dict.whatsapp.messages.category, { category: name }));

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.shop.title, href: localePath(locale, "/shop") },
          { label: name, href: localePath(locale, `/shop/${category.slug}`) },
        ]}
        eyebrow={dict.shop.title}
        title={name}
        intro={localized(category, "intro", locale)}
      />
      {hasProducts ? (
        <ShopSection catalog={catalog} locale={locale} dict={dict} lockedCategoryId={category.id} />
      ) : (
        <Container className="flex flex-col items-center gap-6 py-24 text-center">
          <p className="max-w-md text-muted">{dict.shop.categoryEmpty}</p>
          {whatsapp && (
            <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp">
              <WhatsAppIcon />
              {dict.whatsapp.ask}
            </ButtonAnchor>
          )}
        </Container>
      )}
    </>
  );
}
