"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { uploadImage } from "@/lib/media/prepare";
import { slugify } from "@/lib/slug";

export type Lang = "en" | "fr";

export function LangSwitch({ value, onChange, frenchMissing }: { value: Lang; onChange: (lang: Lang) => void; frenchMissing?: boolean }) {
  return (
    <div className="inline-flex rounded-full bg-cream p-1 ring-1 ring-line" role="tablist" aria-label="Language">
      {(["en", "fr"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          role="tab"
          aria-selected={value === lang}
          onClick={() => onChange(lang)}
          className={cn(
            "relative rounded-full px-4 py-1.5 text-xs font-medium tracking-[0.12em] uppercase transition-colors",
            value === lang ? "bg-plum text-ivory" : "text-plum/70 hover:text-plum",
          )}
        >
          {lang === "en" ? "English" : "Français"}
          {lang === "fr" && frenchMissing && <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-gold ring-2 ring-cream" title="French missing" />}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">{label}</span>
        {description && <span className="text-xs leading-5 text-muted">{description}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-success" : "bg-plum/15")}
      >
        <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </button>
    </label>
  );
}

export function ChipGroup({ options, selected, onChange }: { options: { id: string; label: string }[]; selected: string[]; onChange: (ids: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? selected.filter((id) => id !== option.id) : [...selected, option.id])}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
              active ? "border-plum bg-plum text-ivory" : "border-line bg-white hover:border-plum/40",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  multiline,
  rows,
  placeholder,
  optional,
  id,
  type = "text",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  error?: string;
  hint?: ReactNode;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  optional?: boolean;
  id: string;
  type?: string;
}) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} optional={optional} optionalLabel="Optional">
      {multiline ? (
        <Textarea id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} aria-invalid={Boolean(error)} />
      ) : (
        <Input id={id} type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-invalid={Boolean(error)} />
      )}
    </Field>
  );
}

export function numberOrNull(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export function SingleImageField({
  label,
  value,
  onChange,
  folder,
  hint,
  aspect = "aspect-[4/3]",
}: {
  label: string;
  value: string | null;
  onChange: (key: string | null) => void;
  folder: "categories" | "services" | "site" | "brand";
  hint?: string;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const { key } = await uploadImage(file, folder);
      onChange(key);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium">{label}</p>
      <div className={cn("relative overflow-hidden rounded-2xl bg-cream ring-1 ring-line", aspect)}>
        {value ? (
          <Image src={value} alt="" fill sizes="400px" className="object-cover" />
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted hover:text-plum">
            <ImagePlus className="size-6" strokeWidth={1.5} />
            Add a photo
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-ivory/70">
            <Loader2 className="size-6 animate-spin text-fuchsia" />
          </div>
        )}
      </div>
      {value && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>
            Replace
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange(null)} disabled={busy}>
            <Trash2 />
            Remove
          </Button>
        </div>
      )}
      {hint && <p className="text-xs leading-5 text-muted">{hint}</p>}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function SeoFields({
  lang,
  slug,
  onSlugChange,
  slugPrefix,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  fallbackTitle,
  fallbackDescription,
  errors,
}: {
  lang: Lang;
  slug: string;
  onSlugChange: (value: string) => void;
  slugPrefix: string;
  title: string | null;
  description: string | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  errors: Record<string, string>;
}) {
  const shownTitle = title || fallbackTitle;
  const shownDescription = description || fallbackDescription;
  return (
    <div className="flex flex-col gap-5">
      <Field label="Web address" htmlFor="slug" error={errors.slug} hint={`${slugPrefix}${slug || "…"}`}>
        <Input id="slug" value={slug} onChange={(e) => onSlugChange(slugify(e.target.value))} aria-invalid={Boolean(errors.slug)} />
      </Field>
      <TextField
        id={`seo-title-${lang}`}
        label={`Search title (${lang === "en" ? "English" : "French"})`}
        value={title}
        onChange={onTitleChange}
        optional
        placeholder={fallbackTitle}
        hint={`${shownTitle.length}/60 characters. Leave empty to use the name.`}
      />
      <TextField
        id={`seo-description-${lang}`}
        label={`Search description (${lang === "en" ? "English" : "French"})`}
        value={description}
        onChange={onDescriptionChange}
        optional
        multiline
        rows={3}
        placeholder={fallbackDescription}
        hint={`${shownDescription.length}/155 characters. Leave empty to use the short description.`}
      />
      <div className="rounded-2xl bg-cream/70 p-4">
        <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-muted uppercase">Google preview</p>
        <p className="truncate text-xs text-success">{`${slugPrefix}${slug}`}</p>
        <p className="truncate text-[17px] text-[#1a0dab]">{shownTitle} · Flawless Skin Care</p>
        <p className="line-clamp-2 text-[13px] text-plum/70">{shownDescription || "Add a short description to control this text."}</p>
      </div>
    </div>
  );
}

export function SaveBar({ saving, dirty, onSave, label = "Save changes", extra }: { saving: boolean; dirty: boolean; onSave: () => void; label?: string; extra?: ReactNode }) {
  return (
    <div className="sticky bottom-20 z-20 mt-8 flex items-center justify-between gap-3 rounded-2xl bg-plum px-4 py-3 text-ivory shadow-[0_20px_50px_-20px_rgb(43_20_49/0.6)] lg:bottom-6">
      <p className="text-sm text-ivory/80">{saving ? "Saving…" : dirty ? "You have unsaved changes" : "All changes saved"}</p>
      <div className="flex items-center gap-2">
        {extra}
        <Button variant="light" size="sm" onClick={onSave} disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {label}
        </Button>
      </div>
    </div>
  );
}
