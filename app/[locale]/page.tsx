import { Hero } from "@/components/home/hero";
import {
  CategoriesSection,
  ConcernsSection,
  FounderSection,
  ProductsSection,
  ReviewsSection,
  ServicesSection,
  StepsSection,
  VisitSection,
} from "@/components/home/sections";
import { getCatalog } from "@/lib/data/catalog";
import { getApprovedReviews } from "@/lib/data/reviews";
import { getServices } from "@/lib/data/services";
import { getBrandProfile, getSettings } from "@/lib/data/site";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { locale, dict } = await getI18n();
  const [settings, brand, catalog, services, reviews] = await Promise.all([
    getSettings(),
    getBrandProfile(),
    getCatalog(),
    getServices(),
    getApprovedReviews(),
  ]);

  const withImages = catalog.products.filter((p) => p.image);
  const heroImages = [
    ...withImages.filter((p) => p.isFeatured),
    ...withImages.filter((p) => !p.isFeatured && p.isBestseller),
    ...withImages.filter((p) => !p.isFeatured && !p.isBestseller),
  ];
  const bestsellers = catalog.products.filter((p) => p.isBestseller);
  const highlighted = [
    ...bestsellers,
    ...catalog.products.filter((p) => !p.isBestseller && p.isFeatured),
    ...catalog.products.filter((p) => !p.isBestseller && !p.isFeatured),
  ].slice(0, 4);

  return (
    <>
      <Hero
        locale={locale}
        dict={dict}
        slogan={localized(settings, "slogan", locale) ?? dict.home.heroTitleFallback}
        foundedYear={brand.foundedYear}
        images={heroImages.slice(0, 2)}
        spotlight={bestsellers.find((p) => p.image) ?? highlighted[0]}
      />
      <ConcernsSection locale={locale} dict={dict} catalog={catalog} />
      <ProductsSection
        locale={locale}
        dict={dict}
        products={highlighted}
        eyebrow={dict.home.bestsellersEyebrow}
        title={dict.home.bestsellersTitle}
        intro={dict.home.bestsellersIntro}
        href={localePath(locale, "/shop")}
      />
      <CategoriesSection locale={locale} dict={dict} catalog={catalog} />
      <FounderSection locale={locale} dict={dict} brand={brand} />
      <ServicesSection locale={locale} dict={dict} services={services} />
      <StepsSection locale={locale} dict={dict} />
      <ReviewsSection locale={locale} dict={dict} reviews={reviews} />
      <VisitSection locale={locale} dict={dict} settings={settings} />
    </>
  );
}
