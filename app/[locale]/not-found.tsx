import { ButtonLink } from "@/components/ui/button";
import { Container, Ornament } from "@/components/ui/layout";
import { localePath } from "@/lib/i18n/paths";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { locale, dict } = await getI18n();
  return (
    <Container className="flex flex-col items-center gap-6 py-28 text-center md:py-40">
      <title>{`${dict.notFound.title} · ${dict.meta.siteName}`}</title>
      <Ornament />
      <p aria-hidden className="font-display text-8xl leading-none text-gold-deep italic">
        404
      </p>
      <h1 className="text-4xl md:text-5xl">{dict.notFound.title}</h1>
      <p className="max-w-md text-muted">{dict.notFound.body}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href={localePath(locale, "/shop")}>{dict.notFound.shop}</ButtonLink>
        <ButtonLink href={localePath(locale, "/")} variant="secondary">
          {dict.notFound.home}
        </ButtonLink>
      </div>
    </Container>
  );
}
