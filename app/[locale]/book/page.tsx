import type { Metadata } from "next";
import { Suspense } from "react";
import { type BookableService, BookingPanel } from "@/components/booking/booking-form";
import { BookingWithParams } from "@/components/booking/booking-with-params";
import { PageHeader } from "@/components/site/page-header";
import { Container } from "@/components/ui/layout";
import { getServices } from "@/lib/data/services";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { serviceDurationLabel, servicePriceLabel } from "@/lib/services";

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/book", title: dict.booking.title, description: dict.booking.intro });
}

export default async function BookPage() {
  const { locale, dict } = await getI18n();
  const services: BookableService[] = (await getServices()).map((s) => ({
    slug: s.slug,
    name: localized(s, "name", locale),
    duration: serviceDurationLabel(s, locale),
    price: servicePriceLabel(s, locale, dict.common),
    mode: dict.services.modes[s.mode],
  }));
  const formDict = { booking: dict.booking, forms: dict.forms, common: dict.common, whatsapp: dict.whatsapp, nav: dict.nav };

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.booking.title, href: localePath(locale, "/book") },
        ]}
        eyebrow={dict.home.servicesEyebrow}
        title={dict.booking.title}
        intro={dict.booking.intro}
      />
      <Container className="py-12 md:py-16">
        <Suspense fallback={<BookingPanel locale={locale} dict={formDict} services={services} initialService={null} />}>
          <BookingWithParams locale={locale} dict={formDict} services={services} />
        </Suspense>
      </Container>
    </>
  );
}
