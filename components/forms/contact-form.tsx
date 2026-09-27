"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { type FormState, submitMessage } from "@/lib/actions/public";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { FormAlert, Honeypot, Turnstile } from "./form-extras";
import { FormSuccess } from "./form-success";

export function ContactForm({ locale, dict }: { locale: Locale; dict: Pick<Dictionary, "contact" | "forms" | "common" | "booking"> }) {
  const [state, action, pending] = useActionState(submitMessage, { status: "idle" } as FormState);
  const [values, setValues] = useState({ name: "", contact: "", subject: "", body: "" });
  const [consent, setConsent] = useState(false);
  const errors = state.status === "error" ? state.errors : {};
  const error = (key: string) => (errors[key] ? dict.forms[errors[key]] : undefined);

  useEffect(() => {
    if (state.status === "error") document.querySelector<HTMLElement>("#message-form [aria-invalid='true']")?.focus();
  }, [state]);

  if (state.status === "success") {
    return <FormSuccess title={dict.contact.successTitle} body={interpolate(dict.contact.successBody, { name: values.name })} />;
  }

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const [before, after] = dict.contact.consent.split("{link}");

  return (
    <form id="message-form" action={action} noValidate className="relative flex flex-col gap-6">
      <input type="hidden" name="locale" value={locale} />
      <Honeypot />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={dict.contact.name} htmlFor="contact-name" error={error("name")}>
          <Input id="contact-name" name="name" value={values.name} onChange={set("name")} autoComplete="name" aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label={dict.contact.contact} htmlFor="contact-contact" error={error("contact")}>
          <Input id="contact-contact" name="contact" value={values.contact} onChange={set("contact")} autoComplete="email" aria-invalid={Boolean(errors.contact)} />
        </Field>
      </div>
      <Field label={dict.contact.subject} htmlFor="contact-subject" optional optionalLabel={dict.common.optional} error={error("subject")}>
        <Input id="contact-subject" name="subject" value={values.subject} onChange={set("subject")} />
      </Field>
      <Field label={dict.contact.message} htmlFor="contact-body" error={error("body")}>
        <Textarea id="contact-body" name="body" value={values.body} onChange={set("body")} maxLength={3000} aria-invalid={Boolean(errors.body)} />
      </Field>
      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-3 text-sm leading-6 text-plum/85">
          <Checkbox name="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-invalid={Boolean(errors.consent)} />
          <span>
            {before}
            <Link href={localePath(locale, "/privacy")} target="_blank" className="text-fuchsia underline underline-offset-4">
              {dict.booking.consentLink}
            </Link>
            {after}
          </span>
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
        {pending ? dict.common.sending : dict.contact.submit}
      </Button>
    </form>
  );
}
