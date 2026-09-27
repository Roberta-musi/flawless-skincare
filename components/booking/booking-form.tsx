"use client";

import { CalendarCheck, Clock, MapPin, Plus, Wallet, X } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { FormAlert, Honeypot, Turnstile } from "@/components/forms/form-extras";
import { WhatsAppIcon } from "@/components/icons";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { type BookingSuccess, type FormState, submitBooking } from "@/lib/actions/public";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { interpolate } from "@/lib/i18n/localized";
import { localePath } from "@/lib/i18n/paths";
import { todayInCameroon } from "@/lib/format";
import { dialCodes } from "@/lib/whatsapp";

export type BookableService = { slug: string; name: string; duration: string | null; price: string; mode: string };
type Dict = Pick<Dictionary, "booking" | "forms" | "common" | "whatsapp" | "nav">;

const windows = ["morning", "afternoon", "evening"] as const;
const initial: FormState<BookingSuccess> = { status: "idle" };

function withLink(template: string, href: string, label: string) {
  const [before, after] = template.split("{link}");
  return (
    <>
      {before}
      <Link href={href} target="_blank" className="text-fuchsia underline underline-offset-4">
        {label}
      </Link>
      {after}
    </>
  );
}

export function BookingPanel(props: { locale: Locale; dict: Dict; services: BookableService[]; initialService: string | null }) {
  const [round, setRound] = useState(0);
  return <BookingForm key={round} {...props} onReset={() => setRound((r) => r + 1)} />;
}

function BookingForm({
  locale,
  dict,
  services,
  initialService,
  onReset,
}: {
  locale: Locale;
  dict: Dict;
  services: BookableService[];
  initialService: string | null;
  onReset: () => void;
}) {
  const [state, action, pending] = useActionState(submitBooking, initial);
  const [service, setService] = useState(services.some((s) => s.slug === initialService) ? initialService! : "");
  const [slots, setSlots] = useState([{ date: "", window: "morning" as (typeof windows)[number] }]);
  const [minDate, setMinDate] = useState<string>();
  const [values, setValues] = useState({ name: "", dialCode: "237", phone: "", email: "", firstVisit: "yes", notes: "" });
  const [accepted, setAccepted] = useState({ policy: false, consent: false });
  const errors = state.status === "error" ? state.errors : {};
  const error = (key: string) => (errors[key] ? dict.forms[errors[key]] : undefined);
  const selected = services.find((s) => s.slug === service);

  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const countries = useMemo(
    () =>
      dialCodes
        .map((c) => ({ ...c, name: regionNames.of(c.region) ?? c.region }))
        .sort((a, b) => (a.region === "CM" ? -1 : b.region === "CM" ? 1 : a.name.localeCompare(b.name, locale))),
    [regionNames, locale],
  );

  useEffect(() => setMinDate(todayInCameroon()), []);
  useEffect(() => {
    if (state.status === "error") document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
    if (state.status === "success") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state]);

  if (state.status === "success") {
    return (
      <div className="flex animate-rise flex-col items-center gap-6 rounded-[2rem] bg-white px-6 py-14 text-center ring-1 ring-line md:px-12">
        <span className="grid size-16 place-items-center rounded-full bg-blush text-fuchsia">
          <CalendarCheck className="size-7" strokeWidth={1.5} />
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="text-4xl">{dict.booking.successTitle}</h2>
          <p className="mx-auto max-w-md leading-7 text-muted">
            {interpolate(dict.booking.successBody, { name: state.name, service: state.service })}
          </p>
        </div>
        <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
          {state.whatsappUrl && (
            <ButtonAnchor href={state.whatsappUrl} target="_blank" rel="noopener noreferrer" variant="whatsapp">
              <WhatsAppIcon />
              {dict.whatsapp.followUp}
            </ButtonAnchor>
          )}
          <Button variant="secondary" onClick={onReset}>
            {dict.booking.another}
          </Button>
        </div>
      </div>
    );
  }

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
      <form action={action} noValidate className="relative flex flex-col gap-8">
        <input type="hidden" name="locale" value={locale} />
        <Honeypot />

        <Field label={dict.booking.service} htmlFor="service" error={error("service")}>
          <Select
            id="service"
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            aria-invalid={Boolean(errors.service)}
          >
            <option value="" disabled>
              {dict.booking.chooseService}
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-1 text-[13px] font-medium text-plum">{dict.booking.slots}</legend>
          <p className="-mt-2 text-xs leading-5 text-muted">{dict.booking.slotsHint}</p>
          {slots.map((slot, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-2xl bg-cream/70 p-4 sm:flex-row sm:items-end">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor={`slot-date-${i}`} className="text-xs text-muted">
                  {interpolate(dict.booking.option, { index: i + 1 })} · {dict.booking.date}
                </label>
                <Input
                  id={`slot-date-${i}`}
                  type="date"
                  name="slotDate"
                  min={minDate}
                  value={slot.date}
                  onChange={(e) => setSlots((all) => all.map((s, j) => (j === i ? { ...s, date: e.target.value } : s)))}
                  required={i === 0}
                  aria-invalid={i === 0 && Boolean(errors.slots)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor={`slot-window-${i}`} className="text-xs text-muted">
                  {dict.booking.window}
                </label>
                <Select
                  id={`slot-window-${i}`}
                  name="slotWindow"
                  value={slot.window}
                  onChange={(e) =>
                    setSlots((all) => all.map((s, j) => (j === i ? { ...s, window: e.target.value as (typeof windows)[number] } : s)))
                  }
                >
                  {windows.map((w) => (
                    <option key={w} value={w}>
                      {dict.booking.windows[w]}
                    </option>
                  ))}
                </Select>
              </div>
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => setSlots((all) => all.filter((_, j) => j !== i))}
                  className="grid size-12 shrink-0 place-items-center self-end rounded-full text-muted hover:bg-blush hover:text-danger"
                  aria-label={dict.booking.removeSlot}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
          {errors.slots && (
            <p className="text-xs text-danger" role="alert">
              {error("slots")}
            </p>
          )}
          {slots.length < 3 && (
            <button
              type="button"
              onClick={() => setSlots((all) => [...all, { date: "", window: "morning" }])}
              className="flex items-center gap-2 self-start text-sm font-medium text-fuchsia hover:underline"
            >
              <Plus className="size-4" />
              {dict.booking.addSlot}
            </button>
          )}
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={dict.booking.name} htmlFor="name" error={error("name")} className="sm:col-span-2">
            <Input id="name" name="name" value={values.name} onChange={set("name")} autoComplete="name" required aria-invalid={Boolean(errors.name)} />
          </Field>
          <Field label={dict.booking.phone} htmlFor="phone" error={error("phone")} hint={dict.booking.phoneHint} className="sm:col-span-2">
            <div className="flex gap-2">
              <Select
                name="dialCode"
                value={values.dialCode}
                onChange={set("dialCode")}
                aria-label={dict.booking.country}
                className="w-32 shrink-0 sm:w-40"
              >
                {countries.map((c) => (
                  <option key={c.region} value={c.dial}>
                    {c.name} (+{c.dial})
                  </option>
                ))}
              </Select>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                value={values.phone}
                onChange={set("phone")}
                autoComplete="tel-national"
                required
                aria-invalid={Boolean(errors.phone)}
              />
            </div>
          </Field>
          <Field
            label={dict.booking.email}
            htmlFor="email"
            error={error("email")}
            optional
            optionalLabel={dict.common.optional}
            className="sm:col-span-2"
          >
            <Input id="email" name="email" type="email" value={values.email} onChange={set("email")} autoComplete="email" aria-invalid={Boolean(errors.email)} />
          </Field>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[13px] font-medium text-plum">{dict.booking.firstVisit}</legend>
          <div className="flex gap-3">
            {(["yes", "no"] as const).map((option) => (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors",
                  values.firstVisit === option ? "border-plum bg-plum text-ivory" : "border-line bg-white hover:border-plum/40",
                )}
              >
                <input
                  type="radio"
                  name="firstVisit"
                  value={option}
                  checked={values.firstVisit === option}
                  onChange={set("firstVisit")}
                  className="sr-only"
                />
                {option === "yes" ? (locale === "fr" ? "Oui" : "Yes") : locale === "fr" ? "Non" : "No"}
              </label>
            ))}
          </div>
        </fieldset>

        <Field
          label={dict.booking.notes}
          htmlFor="notes"
          hint={dict.booking.notesHint}
          error={error("notes")}
          optional
          optionalLabel={dict.common.optional}
        >
          <Textarea id="notes" name="notes" value={values.notes} onChange={set("notes")} maxLength={1000} aria-invalid={Boolean(errors.notes)} />
        </Field>

        <div className="flex flex-col gap-4">
          {(["policy", "consent"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="flex items-start gap-3 text-sm leading-6 text-plum/85">
                <Checkbox
                  name={key}
                  checked={accepted[key]}
                  onChange={(e) => setAccepted((a) => ({ ...a, [key]: e.target.checked }))}
                  aria-invalid={Boolean(errors[key])}
                />
                <span>
                  {key === "policy"
                    ? withLink(dict.booking.policy, localePath(locale, "/booking-policy"), dict.booking.policyLink)
                    : withLink(dict.booking.consent, localePath(locale, "/privacy"), dict.booking.consentLink)}
                </span>
              </label>
              {errors[key] && (
                <p className="pl-8 text-xs text-danger" role="alert">
                  {error(key)}
                </p>
              )}
            </div>
          ))}
        </div>

        <Turnstile locale={locale} />
        {(errors.form || (state.status === "error" && !Object.keys(errors).length)) && (
          <FormAlert>{dict.forms[errors.form ?? "failed"]}</FormAlert>
        )}

        <Button type="submit" size="lg" disabled={pending} className="self-stretch sm:self-start">
          {pending ? dict.common.sending : dict.booking.submit}
        </Button>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[1.5rem] bg-white p-6 ring-1 ring-line">
          <p className="mb-4 text-[11px] font-medium tracking-[0.24em] text-gold uppercase">{dict.booking.summary}</p>
          {selected ? (
            <div className="flex flex-col gap-4">
              <p className="font-display text-2xl leading-tight">{selected.name}</p>
              <ul className="flex flex-col gap-2.5 text-sm text-plum/80">
                <li className="flex items-center gap-2.5">
                  <MapPin className="size-4 text-gold" strokeWidth={1.5} />
                  {selected.mode}
                </li>
                {selected.duration && (
                  <li className="flex items-center gap-2.5">
                    <Clock className="size-4 text-gold" strokeWidth={1.5} />
                    {selected.duration}
                  </li>
                )}
                <li className="flex items-center gap-2.5">
                  <Wallet className="size-4 text-gold" strokeWidth={1.5} />
                  {selected.price}
                </li>
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted">{dict.booking.chooseService}</p>
          )}
        </div>
        <p className="px-2 text-xs leading-5 text-muted">{dict.booking.intro}</p>
      </aside>
    </div>
  );
}
