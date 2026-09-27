import { Stars } from "@/components/ui/stars";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate, localized } from "@/lib/i18n/localized";

type ReviewLike = {
  name: string;
  location: string | null;
  rating: number | null;
  body: string;
  source: "website" | "whatsapp" | "in_store";
  product?: { nameEn: string; nameFr: string | null } | null;
  service?: { nameEn: string; nameFr: string | null } | null;
};

export function ReviewCard({
  review,
  locale,
  dict,
  className,
}: {
  review: ReviewLike;
  locale: Locale;
  dict: Pick<Dictionary, "reviews" | "common">;
  className?: string;
}) {
  const about = review.product ?? review.service;
  return (
    <figure className={cn("flex h-full flex-col gap-5 rounded-[1.5rem] bg-white p-7 ring-1 ring-line", className)}>
      {review.rating != null && <Stars rating={review.rating} label={interpolate(dict.common.ratingLabel, { rating: review.rating })} />}
      <blockquote className="font-display text-xl leading-relaxed text-plum">“{review.body}”</blockquote>
      <figcaption className="mt-auto flex flex-col gap-1 text-sm">
        <span className="font-medium text-plum">
          {review.name}
          {review.location && <span className="font-normal text-muted"> · {review.location}</span>}
        </span>
        <span className="text-xs text-muted">
          {about ? `${localized(about, "name", locale)} · ` : ""}
          {dict.reviews.source[review.source]}
        </span>
      </figcaption>
    </figure>
  );
}
