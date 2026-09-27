"use client";

import { Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { type FormState, submitReview } from "@/lib/actions/public";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/localized";
import { FormAlert, Honeypot, Turnstile } from "./form-extras";
import { FormSuccess } from "./form-success";

type Option = { value: string; label: string };
type Dict = Pick<Dictionary, "reviews" | "forms" | "common" | "nav">;

export function ReviewFormWithParams(props: Omit<Parameters<typeof ReviewForm>[0], "initialAbout">) {
  const params = useSearchParams();
  const product = params.get("product");
  const service = params.get("service");
  return <ReviewForm {...props} initialAbout={product ? `product:${product}` : service ? `service:${service}` : ""} />;
}

export function ReviewForm({
  locale,
  dict,
  products,
  services,
  initialAbout,
}: {
  locale: Locale;
  dict: Dict;
  products: Option[];
  services: Option[];
  initialAbout: string;
}) {
  const [state, action, pending] = useActionState(submitReview, { status: "idle" } as FormState);
  const [values, setValues] = useState({
    name: "",
    location: "",
    rating: "",
    body: "",
    about: [...products, ...services].some((o) => o.value === initialAbout) ? initialAbout : "",
  });
  const [consent, setConsent] = useState(false);
  const errors = state.status === "error" ? state.errors : {};
  const error = (key: string) => (errors[key] ? dict.forms[errors[key]] : undefined);

  useEffect(() => {
    if (state.status === "error") document.querySelector<HTMLElement>("#write [aria-invalid='true']")?.focus();
  }, [state]);

  if (state.status === "success") return <FormSuccess title={dict.reviews.successTitle} body={dict.reviews.successBody} />;

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <form action={action} noValidate className="relative flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="rating" value={values.rating} />
      <Honeypot />

      <fieldset>
        <legend className="mb-3 text-[13px] font-medium text-plum">
          {dict.reviews.rating} <span className="font-normal text-muted">· {dict.common.optional}</span>
        </legend>
        <div className="flex gap-1" role="radiogroup" aria-label={dict.reviews.rating}>
          {[1, 2, 3, 4, 5].map((n) => {
            const active = Number(values.rating) >= n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={values.rating === String(n)}
                aria-label={interpolate(dict.reviews.ratingOption, { count: n })}
                onClick={() => setValues((v) => ({ ...v, rating: v.rating === String(n) ? "" : String(n) }))}
                className="grid size-11 place-items-center rounded-full transition-colors hover:bg-blush"
              >
                <Star className={cn("size-6", active ? "text-gold" : "text-plum/25")} fill={active ? "currentColor" : "none"} strokeWidth={1.5} />
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={dict.reviews.name} htmlFor="review-name" error={error("name")}>
          <Input id="review-name" name="name" value={values.name} onChange={set("name")} autoComplete="given-name" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label={dict.reviews.location} htmlFor="review-location" optional optionalLabel={dict.common.optional} error={error("location")}>
          <Input id="review-location" name="location" value={values.location} onChange={set("location")} autoComplete="address-level2" />
        </Field>
      </div>

      <Field label={dict.reviews.product} htmlFor="review-about" optional optionalLabel={dict.common.optional}>
        <Select id="review-about" name="about" value={values.about} onChange={set("about")}>
          <option value="">{dict.reviews.none}</option>
          {products.length > 0 && (
            <optgroup label={dict.nav.shop}>
              {products.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          )}
          {services.length > 0 && (
            <optgroup label={dict.nav.services}>
              {services.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          )}
        </Select>
      </Field>

      <Field label={dict.reviews.body} htmlFor="review-body" error={error("body")}>
        <Textarea id="review-body" name="body" value={values.body} onChange={set("body")} maxLength={2000} aria-invalid={Boolean(errors.body)} />
      </Field>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 text-sm leading-6 text-plum/85">
          <Checkbox name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} />
          <span>{dict.reviews.consent}</span>
        </label>
        {errors.consent && (
          <p className="pl-8 text-xs text-danger" role="alert">
            {error("consent")}
          </p>
        )}
      </div>

      <Turnstile locale={locale} />
      {errors.form && <FormAlert>{dict.forms[errors.form]}</FormAlert>}

      <Button type="submit" size="lg" disabled={pending} className="self-stretch sm:self-start">
        {pending ? dict.common.sending : dict.reviews.submit}
      </Button>
    </form>
  );
}
