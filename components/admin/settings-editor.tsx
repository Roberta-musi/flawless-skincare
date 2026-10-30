"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { WhatsAppIcon } from "@/components/icons";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { saveSettingsAction } from "@/lib/actions/admin/site";
import type { SettingsForEdit } from "@/lib/data/admin/site";
import type { OpeningHours } from "@/lib/db/schema";
import { normalizeWhatsAppNumber, whatsappUrl } from "@/lib/whatsapp";
import { type Lang, LangSwitch, SaveBar, SingleImageField, TextField, Toggle } from "./form-kit";
import { Card } from "./ui";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type Draft = Omit<SettingsForEdit, "id" | "updatedAt" | "country" | "latitude" | "longitude" | "openingHours" | "whatsapp" | "email" | "mapUrl" | "socials"> & {
  latitude: string;
  longitude: string;
  openingHours: NonNullable<OpeningHours>;
  whatsapp: string;
  email: string;
  mapUrl: string;
  socials: { facebook: string; tiktok: string; instagram: string };
};

function toDraft(s: SettingsForEdit): Draft {
  const { id: _id, updatedAt: _u, country: _c, ...rest } = s;
  return {
    ...rest,
    whatsapp: s.whatsapp ? `+${s.whatsapp}` : "",
    email: s.email ?? "",
    mapUrl: s.mapUrl ?? "",
    latitude: s.latitude?.toString() ?? "",
    longitude: s.longitude?.toString() ?? "",
    openingHours: s.openingHours?.length === 7 ? s.openingHours : days.map(() => null),
    socials: { facebook: s.socials.facebook ?? "", tiktok: s.socials.tiktok ?? "", instagram: s.socials.instagram ?? "" },
  };
}

export function SettingsEditor({ settings }: { settings: SettingsForEdit }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => toDraft(settings));
  const [saved, setSaved] = useState(() => JSON.stringify(toDraft(settings)));
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const dirty = JSON.stringify(draft) !== saved;
  const suffix = lang === "en" ? "En" : "Fr";
  const text = (field: string) => (draft as Record<string, unknown>)[`${field}${suffix}`] as string | null;
  const setText = (field: string, value: string) => setDraft((d) => ({ ...d, [`${field}${suffix}`]: value }));
  const whatsappTest = normalizeWhatsAppNumber(draft.whatsapp);

  function setDay(index: number, value: { opens: string; closes: string } | null) {
    setDraft((d) => ({ ...d, openingHours: d.openingHours.map((day, i) => (i === index ? value : day)) }));
  }

  function save() {
    startSaving(async () => {
      const result = await saveSettingsAction({
        ...draft,
        latitude: draft.latitude.trim() ? Number(draft.latitude) : null,
        longitude: draft.longitude.trim() ? Number(draft.longitude) : null,
      });
      if (!result.ok) {
        setErrors(result.errors);
        toast.error("Please fix the highlighted fields.");
        return;
      }
      setErrors({});
      setSaved(JSON.stringify(draft));
      toast.success("Saved. The website is updated.");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <LangSwitch value={lang} onChange={setLang} frenchMissing={!draft.sloganFr} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
        <Card title="Business" description="Shown in the header, footer and on Google.">
          <div className="flex flex-col gap-5">
            <TextField id="st-name" label="Business name" value={draft.businessName} onChange={(v) => setDraft((d) => ({ ...d, businessName: v }))} error={errors.businessName} hint="Use exactly the same name as on Google Maps and Facebook." />
            <TextField id="st-slogan" label="Slogan" value={text("slogan")} onChange={(v) => setText("slogan", v)} optional />
            <TextField id="st-announce" label="Announcement bar" value={text("announcement")} onChange={(v) => setText("announcement", v)} optional hint="The short line at the very top of the website. Separate parts with “ · ”; phones show only the first part." />
          </div>
        </Card>

        <Card title="Contact">
          <div className="flex flex-col gap-5">
            <Field label="WhatsApp number" htmlFor="st-wa" error={errors.whatsapp} hint="With the country code, e.g. +237 6XX XXX XXX. Every WhatsApp button on the website uses this number.">
              <Input id="st-wa" inputMode="tel" value={draft.whatsapp} onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))} aria-invalid={Boolean(errors.whatsapp)} />
            </Field>
            {whatsappTest && (
              <ButtonAnchor href={whatsappUrl(whatsappTest, "Test from the Flawless admin")} target="_blank" rel="noopener noreferrer" variant="whatsapp" size="sm" className="self-start">
                <WhatsAppIcon />
                Test this number
              </ButtonAnchor>
            )}
            <TextField id="st-phone" label="Phone" value={draft.phone} onChange={(v) => setDraft((d) => ({ ...d, phone: v }))} optional />
            <TextField id="st-email" label="Email" type="email" value={draft.email} onChange={(v) => setDraft((d) => ({ ...d, email: v }))} error={errors.email} optional hint="Booking and review alerts are sent here." />
          </div>
        </Card>

        <Card title="Address & map">
          <div className="flex flex-col gap-5">
            <TextField id="st-street" label="Street / area" value={draft.streetAddress} onChange={(v) => setDraft((d) => ({ ...d, streetAddress: v }))} optional />
            <TextField id="st-landmark" label="Landmark" value={text("landmark")} onChange={(v) => setText("landmark", v)} optional hint="e.g. opposite the main market" />
            <div className="grid grid-cols-2 gap-3">
              <TextField id="st-city" label="Town" value={draft.city} onChange={(v) => setDraft((d) => ({ ...d, city: v }))} error={errors.city} />
              <TextField id="st-region" label="Region" value={draft.region} onChange={(v) => setDraft((d) => ({ ...d, region: v }))} error={errors.region} />
            </div>
            <TextField id="st-map" label="Google Maps link" value={draft.mapUrl} onChange={(v) => setDraft((d) => ({ ...d, mapUrl: v }))} error={errors.mapUrl} optional hint="Open the shop on Google Maps, tap Share and paste the link here." />
            <div className="grid grid-cols-2 gap-3">
              <TextField id="st-lat" label="Latitude" value={draft.latitude} onChange={(v) => setDraft((d) => ({ ...d, latitude: v }))} error={errors.latitude} optional />
              <TextField id="st-lng" label="Longitude" value={draft.longitude} onChange={(v) => setDraft((d) => ({ ...d, longitude: v }))} error={errors.longitude} optional />
            </div>
            <p className="-mt-3 text-xs leading-5 text-muted">Optional: on Google Maps, press and hold on the shop to see these numbers. They place the pin exactly.</p>
          </div>
        </Card>

        <Card title="Opening hours" description="Shown on the website and on Google.">
          {errors.openingHours && <p className="mb-3 text-sm text-danger">{errors.openingHours}</p>}
          <ul className="flex flex-col gap-2">
            {days.map((day, i) => {
              const value = draft.openingHours[i];
              return (
                <li key={day} className="flex flex-wrap items-center gap-3 rounded-2xl bg-cream/60 px-3 py-2">
                  <span className="w-24 text-sm font-medium">{day}</span>
                  <Toggle checked={value != null} onChange={(open) => setDay(i, open ? { opens: "09:00", closes: "18:00" } : null)} label={value ? "Open" : "Closed"} />
                  {value && (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={value.opens} onChange={(e) => setDay(i, { ...value, opens: e.target.value })} className="h-10 w-28 text-sm" aria-label={`${day} opens`} />
                      <span className="text-muted">–</span>
                      <Input type="time" value={value.closes} onChange={(e) => setDay(i, { ...value, closes: e.target.value })} className="h-10 w-28 text-sm" aria-label={`${day} closes`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setDraft((d) => ({ ...d, openingHours: d.openingHours.map((day, i) => (i < 5 ? d.openingHours[0] : day)) }))}>
            <Copy />
            Copy Monday to all weekdays
          </Button>
        </Card>

        <Card title="Shop photo">
          <SingleImageField label="Photo of the shop" value={draft.shopPhotoKey} onChange={(shopPhotoKey) => setDraft((d) => ({ ...d, shopPhotoKey }))} folder="site" hint="Shown on the home, about and contact pages." />
        </Card>

        <Card title="Social media">
          <div className="flex flex-col gap-5">
            {(["facebook", "tiktok", "instagram"] as const).map((network) => (
              <TextField
                key={network}
                id={`st-${network}`}
                label={network === "tiktok" ? "TikTok" : network[0].toUpperCase() + network.slice(1)}
                value={draft.socials[network]}
                onChange={(v) => setDraft((d) => ({ ...d, socials: { ...d.socials, [network]: v } }))}
                error={errors[`socials.${network}`]}
                optional
                placeholder="https://"
              />
            ))}
          </div>
        </Card>

        <Card title="Home page on Google" className="lg:col-span-2">
          <div className="grid gap-5 md:grid-cols-2">
            <TextField id="st-seo-title" label="Search title" value={text("seoTitle")} onChange={(v) => setText("seoTitle", v)} optional hint="Leave empty for the default: “Flawless Skin Care · Skincare & spa in Limbe, Cameroon”." />
            <TextField id="st-seo-desc" label="Search description" value={text("seoDescription")} onChange={(v) => setText("seoDescription", v)} optional multiline rows={3} />
          </div>
        </Card>
      </div>
      <SaveBar saving={saving} dirty={dirty} onSave={save} />
    </div>
  );
}
