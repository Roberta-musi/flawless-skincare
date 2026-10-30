import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { Prose } from "@/components/ui/prose";
import { getContentPage } from "@/lib/data/site";
import type { contentPageSlugs } from "@/lib/db/schema";
import { formatDate } from "@/lib/format";
import { interpolate, isTranslated, localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "./page-header";

type Slug = (typeof contentPageSlugs)[number];

export async function contentPageMetadata(slug: Slug): Promise<Metadata> {
  const { locale } = await getI18n();
  const page = await getContentPage(slug);
  if (!page) return {};
  return pageMetadata({ locale, path: `/${slug}`, title: localized(page, "title", locale), translated: isTranslated(page, ["title", "body"]) });
}

export async function ContentPage({ slug }: { slug: Slug }) {
  const { locale, dict } = await getI18n();
  const page = await getContentPage(slug);
  if (!page) notFound();
  const title = localized(page, "title", locale);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: title, href: localePath(locale, `/${slug}`) },
        ]}
        title={title}
        intro={interpolate(dict.legal.updated, { date: formatDate(page.updatedAt, locale, { day: "numeric", month: "long", year: "numeric" }) })}
      />
      <Section className="pt-12 md:pt-16">
        <Container className="max-w-3xl">
          <Prose source={localized(page, "body", locale)} className="text-base leading-8" />
        </Container>
      </Section>
    </>
  );
}
