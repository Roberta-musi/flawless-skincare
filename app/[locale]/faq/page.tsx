import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/icons";
import { PageHeader } from "@/components/site/page-header";
import { AccordionItem } from "@/components/ui/accordion";
import { ButtonAnchor } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/layout";
import { Prose } from "@/components/ui/prose";
import { getFaqs, getSettings } from "@/lib/data/site";
import { faqs as faqTable } from "@/lib/db/schema";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { businessWhatsAppUrl } from "@/lib/site";

const topicOrder = faqTable.topic.enumValues;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();
  return pageMetadata({ locale, path: "/faq", title: dict.faq.title, description: dict.faq.intro });
}

export default async function FaqPage() {
  const { locale, dict } = await getI18n();
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const whatsapp = businessWhatsAppUrl(settings, dict.whatsapp.messages.general);
  const groups = topicOrder.map((topic) => ({ topic, items: faqs.filter((f) => f.topic === topic) })).filter((g) => g.items.length);

  return (
    <>
      <PageHeader
        crumbs={[
          { label: dict.common.home, href: localePath(locale, "/") },
          { label: dict.nav.faq, href: localePath(locale, "/faq") },
        ]}
        title={dict.faq.title}
        intro={dict.faq.intro}
      />
      <Section className="pt-12 md:pt-16">
        <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-20">
          <nav className="hidden lg:block" aria-label={dict.faq.title}>
            <ul className="sticky top-28 flex flex-col gap-3">
              {groups.map((g) => (
                <li key={g.topic}>
                  <a href={`#${g.topic}`} className="text-sm text-plum/70 transition-colors hover:text-fuchsia">
                    {dict.faq.topics[g.topic]}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-col gap-12">
            {groups.map((g) => (
              <section key={g.topic} id={g.topic} className="scroll-mt-28">
                <h2 className="mb-2 text-3xl">{dict.faq.topics[g.topic]}</h2>
                <div className="divide-y divide-line border-y border-line">
                  {g.items.map((faq) => (
                    <AccordionItem key={faq.id} title={<span className="font-sans text-base font-medium tracking-normal normal-case">{localized(faq, "question", locale)}</span>}>
                      <Prose source={localized(faq, "answer", locale)} />
                    </AccordionItem>
                  ))}
                </div>
              </section>
            ))}
            <div className="flex flex-col items-start gap-4 rounded-[1.5rem] bg-lilac/60 p-8">
              <h2 className="text-3xl">{dict.faq.stillQuestions}</h2>
              <p className="text-muted">{dict.faq.askUs}</p>
              {whatsapp && (
                <ButtonAnchor href={whatsapp} target="_blank" rel="noopener noreferrer" variant="whatsapp">
                  <WhatsAppIcon />
                  {dict.whatsapp.chat}
                </ButtonAnchor>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
