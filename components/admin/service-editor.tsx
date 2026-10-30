"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button, ButtonAnchor } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { deleteServiceAction, saveServiceAction } from "@/lib/actions/admin/services";
import type { ServiceForEdit } from "@/lib/data/admin/services";
import { isTranslated } from "@/lib/i18n/localized";
import { slugify } from "@/lib/slug";
import type { ServiceInput } from "@/lib/validation/admin";
import { type Lang, LangSwitch, numberOrNull, SaveBar, SeoFields, SingleImageField, TextField, Toggle } from "./form-kit";
import { Card } from "./ui";

const blank: ServiceInput = {
  slug: "",
  nameEn: "",
  nameFr: null,
  shortDescriptionEn: null,
  shortDescriptionFr: null,
  descriptionEn: null,
  descriptionFr: null,
  whatToExpectEn: null,
  whatToExpectFr: null,
  preparationEn: null,
  preparationFr: null,
  aftercareEn: null,
  aftercareFr: null,
  durationMinutes: 60,
  priceXaf: null,
  priceType: "fixed",
  mode: "in_shop",
  imageKey: null,
  isPublished: false,
  isFeatured: false,
  sortOrder: 0,
  seoTitleEn: null,
  seoTitleFr: null,
  seoDescriptionEn: null,
  seoDescriptionFr: null,
};

function toDraft(service: ServiceForEdit): ServiceInput {
  const { createdAt: _c, updatedAt: _u, ...rest } = service;
  return rest;
}

export function ServiceEditor({ service }: { service: ServiceForEdit | null }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ServiceInput>(() => (service ? toDraft(service) : blank));
  const [saved, setSaved] = useState(() => JSON.stringify(service ? toDraft(service) : blank));
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const dirty = JSON.stringify(draft) !== saved;
  const suffix = lang === "en" ? "En" : "Fr";

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const text = (field: string) => (draft as Record<string, unknown>)[`${field}${suffix}`] as string | null;
  const setText = (field: string, value: string) =>
    setDraft((d) => {
      const next = { ...d, [`${field}${suffix}`]: value } as ServiceInput;
      if (field === "name" && lang === "en" && !slugTouched) next.slug = slugify(value);
      return next;
    });

  function save() {
    startSaving(async () => {
      const result = await saveServiceAction(draft);
      if (!result.ok) {
        setErrors(result.errors);
        toast.error(result.errors.form ?? "Please fix the highlighted fields.");
        return;
      }
      setErrors({});
      setSaved(JSON.stringify({ ...draft, id: result.id }));
      toast.success(draft.isPublished ? "Saved. The website is updated." : "Saved as a draft.");
      if (!draft.id) router.replace(`/admin/services/${result.id}`);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LangSwitch
          value={lang}
          onChange={setLang}
          frenchMissing={!isTranslated(draft, ["name", "shortDescription", "description", "whatToExpect", "preparation", "aftercare"])}
        />
        {draft.id && draft.isPublished && (
          <ButtonAnchor href={`/services/${draft.slug}`} target="_blank" variant="ghost" size="sm">
            <ExternalLink />
            View on website
          </ButtonAnchor>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Card title="Service details">
            <div className="flex flex-col gap-5">
              <TextField id="s-name" label="Name" value={text("name")} onChange={(v) => setText("name", v)} error={errors[`name${suffix}`]} />
              <TextField id="s-short" label="Short description" value={text("shortDescription")} onChange={(v) => setText("shortDescription", v)} multiline rows={2} optional />
              <TextField id="s-desc" label="Full description" value={text("description")} onChange={(v) => setText("description", v)} multiline rows={5} optional hint="Use **bold** and start lines with - for lists." />
              <TextField id="s-expect" label="What to expect" value={text("whatToExpect")} onChange={(v) => setText("whatToExpect", v)} multiline rows={3} optional />
              <TextField id="s-prep" label="Before the visit" value={text("preparation")} onChange={(v) => setText("preparation", v)} multiline rows={3} optional />
              <TextField id="s-after" label="Aftercare" value={text("aftercare")} onChange={(v) => setText("aftercare", v)} multiline rows={3} optional />
            </div>
          </Card>
          <Card title="Search engines">
            <SeoFields
              lang={lang}
              slug={draft.slug}
              onSlugChange={(slug) => {
                setSlugTouched(true);
                setDraft((d) => ({ ...d, slug }));
              }}
              slugPrefix="/services/"
              title={text("seoTitle")}
              description={text("seoDescription")}
              onTitleChange={(v) => setText("seoTitle", v)}
              onDescriptionChange={(v) => setText("seoDescription", v)}
              fallbackTitle={(lang === "fr" && draft.nameFr) || draft.nameEn}
              fallbackDescription={(lang === "fr" && draft.shortDescriptionFr) || draft.shortDescriptionEn || ""}
              errors={errors}
            />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Visibility">
            <div className="flex flex-col gap-5">
              <Toggle checked={draft.isPublished} onChange={(isPublished) => setDraft((d) => ({ ...d, isPublished }))} label="Show on the website" description="Also makes it bookable." />
              <Toggle checked={draft.isFeatured} onChange={(isFeatured) => setDraft((d) => ({ ...d, isFeatured }))} label="Featured" />
            </div>
          </Card>
          <Card title="Price & time">
            <div className="flex flex-col gap-5">
              <Field label="How the price is shown" htmlFor="s-price-type">
                <Select id="s-price-type" value={draft.priceType} onChange={(e) => setDraft((d) => ({ ...d, priceType: e.target.value as ServiceInput["priceType"] }))}>
                  <option value="fixed">Fixed price</option>
                  <option value="from">Starting price (“From …”)</option>
                  <option value="consultation">Price after consultation</option>
                </Select>
              </Field>
              {draft.priceType !== "consultation" && (
                <Field label="Price (FCFA)" htmlFor="s-price" hint="Leave empty to show “Price on request”." error={errors.priceXaf}>
                  <Input id="s-price" inputMode="numeric" value={draft.priceXaf ?? ""} onChange={(e) => setDraft((d) => ({ ...d, priceXaf: numberOrNull(e.target.value) }))} />
                </Field>
              )}
              <Field label="Duration (minutes)" htmlFor="s-duration" error={errors.durationMinutes} optional optionalLabel="Optional">
                <Input id="s-duration" inputMode="numeric" value={draft.durationMinutes ?? ""} onChange={(e) => setDraft((d) => ({ ...d, durationMinutes: numberOrNull(e.target.value) }))} />
              </Field>
              <Field label="Where" htmlFor="s-mode">
                <Select id="s-mode" value={draft.mode} onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value as ServiceInput["mode"] }))}>
                  <option value="in_shop">In the Limbe shop</option>
                  <option value="online">Online (WhatsApp video)</option>
                  <option value="both">In the shop or online</option>
                </Select>
              </Field>
              <Field label="Order in lists" htmlFor="s-sort">
                <Input id="s-sort" inputMode="numeric" value={draft.sortOrder} onChange={(e) => setDraft((d) => ({ ...d, sortOrder: Number(e.target.value.replace(/[^\d-]/g, "")) || 0 }))} />
              </Field>
            </div>
          </Card>
          <Card title="Photo">
            <SingleImageField label="Service photo" value={draft.imageKey} onChange={(imageKey) => setDraft((d) => ({ ...d, imageKey }))} folder="services" />
          </Card>
          {draft.id && (
            <Card title="Delete service" description="Past booking requests keep the service name.">
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger/10"
                onClick={() => {
                  if (confirm(`Delete “${draft.nameEn}”?`)) startSaving(() => deleteServiceAction(draft.id!));
                }}
              >
                <Trash2 />
                Delete service
              </Button>
            </Card>
          )}
        </div>
      </div>
      <SaveBar saving={saving} dirty={dirty} onSave={save} label={draft.id ? "Save changes" : "Create service"} />
    </div>
  );
}
