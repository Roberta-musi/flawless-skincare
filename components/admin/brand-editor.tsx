"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveBrandAction } from "@/lib/actions/admin/site";
import type { BrandForEdit } from "@/lib/data/admin/site";
import { type Lang, LangSwitch, numberOrNull, SaveBar, SingleImageField, TextField } from "./form-kit";
import { Card } from "./ui";

type Draft = Omit<BrandForEdit, "id" | "updatedAt" | "ceoSocials"> & { ceoSocials: { facebook: string; tiktok: string; instagram: string } };

function toDraft(b: BrandForEdit): Draft {
  const { id: _id, updatedAt: _u, ...rest } = b;
  return { ...rest, ceoSocials: { facebook: b.ceoSocials.facebook ?? "", tiktok: b.ceoSocials.tiktok ?? "", instagram: b.ceoSocials.instagram ?? "" } };
}

export function BrandEditor({ brand }: { brand: BrandForEdit }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => toDraft(brand));
  const [saved, setSaved] = useState(() => JSON.stringify(toDraft(brand)));
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const suffix = lang === "en" ? "En" : "Fr";
  const text = (field: string) => (draft as Record<string, unknown>)[`${field}${suffix}`] as string | null;
  const setText = (field: string, value: string) => setDraft((d) => ({ ...d, [`${field}${suffix}`]: value }));

  function save() {
    startSaving(async () => {
      const result = await saveBrandAction(draft);
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
      <LangSwitch value={lang} onChange={setLang} frenchMissing={Boolean(draft.shortBioEn && !draft.shortBioFr)} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <div className="flex flex-col gap-6">
          <Card title="Your photo">
            <SingleImageField
              label="Portrait"
              value={draft.portraitKey}
              onChange={(portraitKey) => setDraft((d) => ({ ...d, portraitKey }))}
              folder="brand"
              aspect="aspect-[3/4] max-w-64"
              hint="A bright, professional portrait works best. It is shown in an arch on the home and about pages."
            />
          </Card>
          <Card title="About you">
            <div className="flex flex-col gap-5">
              <TextField id="b-name" label="Your name" value={draft.ceoName} onChange={(v) => setDraft((d) => ({ ...d, ceoName: v }))} optional />
              <TextField id="b-title" label="Title" value={text("ceoTitle")} onChange={(v) => setText("ceoTitle", v)} optional hint="e.g. Founder & CEO" />
              <TextField
                id="b-founded"
                label="Year Flawless started"
                value={draft.foundedYear?.toString() ?? ""}
                onChange={(v) => setDraft((d) => ({ ...d, foundedYear: numberOrNull(v) }))}
                error={errors.foundedYear}
                optional
              />
              {(["facebook", "tiktok", "instagram"] as const).map((network) => (
                <TextField
                  key={network}
                  id={`b-${network}`}
                  label={`Your ${network === "tiktok" ? "TikTok" : network[0].toUpperCase() + network.slice(1)}`}
                  value={draft.ceoSocials[network]}
                  onChange={(v) => setDraft((d) => ({ ...d, ceoSocials: { ...d.ceoSocials, [network]: v } }))}
                  error={errors[`ceoSocials.${network}`]}
                  optional
                  placeholder="https://"
                />
              ))}
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <Card title="Your story">
            <div className="flex flex-col gap-5">
              <TextField id="b-short" label="Short introduction" value={text("shortBio")} onChange={(v) => setText("shortBio", v)} multiline rows={3} optional hint="Two or three sentences for the home page." />
              <TextField id="b-quote" label="A quote from you" value={text("quote")} onChange={(v) => setText("quote", v)} multiline rows={2} optional />
              <TextField id="b-story" label="Your full story" value={text("story")} onChange={(v) => setText("story", v)} multiline rows={8} optional hint="Shown on the about page. Separate paragraphs with an empty line." />
            </div>
          </Card>
          <Card title="Brand story">
            <TextField id="b-brand" label="The story of Flawless Skin Care" value={text("brandStory")} onChange={(v) => setText("brandStory", v)} multiline rows={6} optional />
          </Card>
        </div>
      </div>
      <SaveBar saving={saving} dirty={JSON.stringify(draft) !== saved} onSave={save} />
    </div>
  );
}
