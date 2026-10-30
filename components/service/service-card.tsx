import { Clock } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/product/product-image";
import { ButtonLink } from "@/components/ui/button";
import type { Service } from "@/lib/data/services";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localized } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { serviceDurationLabel, servicePriceLabel } from "@/lib/services";

export function ServiceCard({
  service,
  locale,
  dict,
}: {
  service: Service;
  locale: Locale;
  dict: Pick<Dictionary, "services" | "common">;
}) {
  const name = localized(service, "name", locale);
  const href = localePath(locale, `/services/${service.slug}`);
  const duration = serviceDurationLabel(service, locale);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-line transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(43_20_49/0.35)]">
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <ProductImage
          imageKey={service.imageKey}
          alt={name}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[4/3]"
          imageClassName="transition-transform duration-[1.2s] ease-(--ease-soft) group-hover:scale-[1.04]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <p className="text-[10px] font-medium tracking-[0.24em] text-gold-deep uppercase">{dict.services.modes[service.mode]}</p>
        <h3 className="text-2xl leading-tight">
          <Link href={href} className="transition-colors hover:text-fuchsia">
            {name}
          </Link>
        </h3>
        {localized(service, "shortDescription", locale) && (
          <p className="line-clamp-3 text-sm leading-6 text-muted">{localized(service, "shortDescription", locale)}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 text-sm">
          <span className="flex items-center gap-2 text-muted">
            {duration && (
              <>
                <Clock className="size-4" strokeWidth={1.5} />
                {duration}
              </>
            )}
          </span>
          <span className="font-medium tabular-nums">{servicePriceLabel(service, locale, dict.common)}</span>
        </div>
        <ButtonLink href={localePath(locale, `/book?service=${service.slug}`)} variant="secondary" size="sm" className="mt-2">
          {dict.services.bookShort}
        </ButtonLink>
      </div>
    </article>
  );
}
