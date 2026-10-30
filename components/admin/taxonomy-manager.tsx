"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/site/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { deleteCategoryAction, deleteTermAction, saveCategoryAction, saveTermAction } from "@/lib/actions/admin/catalog";
import { slugify } from "@/lib/slug";
import type { CategoryInput, TermInput } from "@/lib/validation/admin";
import { type Lang, LangSwitch, SaveBar, SeoFields, SingleImageField, TextField, Toggle } from "./form-kit";
import { Card, StatusPill } from "./ui";

type Category = CategoryInput & { id: string; productCount: number };
type Term = { id: string; slug: string; nameEn: string; nameFr: string | null; sortOrder: number };

const emptyCategory: CategoryInput = {
  slug: "",
  nameEn: "",
  nameFr: null,
  introEn: null,
  introFr: null,
  imageKey: null,
  sortOrder: 0,
  isPublished: true,
  seoTitleEn: null,
  seoTitleFr: null,
  seoDescriptionEn: null,
  seoDescriptionFr: null,
};

export function TaxonomyManager({ categories, concerns, skinTypes }: { categories: Category[]; concerns: Term[]; skinTypes: Term[] }) {
  const [editing, setEditing] = useState<CategoryInput | null>(null);
  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Categories"
        description="Each category has its own page in the shop, with an introduction and a photo."
        actions={
          <Button size="sm" onClick={() => setEditing({ ...emptyCategory, sortOrder: categories.length + 1 })}>
            <Plus />
            Add
          </Button>
        }
      >
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => setEditing(category)}
                className="flex w-full items-center gap-4 rounded-2xl p-2 text-left ring-1 ring-line transition-colors hover:bg-cream/70"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-blush">
                  {category.imageKey && <Image src={category.imageKey} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{category.nameEn}</p>
                  <p className="text-xs text-muted">{category.productCount} products</p>
                </div>
                {!category.isPublished && <StatusPill status="draft">Hidden</StatusPill>}
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <TermList kind="concern" title="Skin concerns" description="Used for “Shop by concern” and the shop filters." terms={concerns} />
        <TermList kind="skinType" title="Skin types" description="Used for the “Suitable for” filter." terms={skinTypes} />
      </div>

      <Sheet
        open={editing != null}
        onClose={() => setEditing(null)}
        side="right"
        label="Edit category"
        closeLabel="Close"
        header={<h2 className="text-2xl">{editing?.id ? "Edit category" : "New category"}</h2>}
        className="sm:w-[34rem]"
      >
        {editing && <CategoryForm key={editing.id ?? "new"} category={editing} onDone={() => setEditing(null)} />}
      </Sheet>
    </div>
  );
}

function CategoryForm({ category, onDone }: { category: CategoryInput; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState<CategoryInput>(category);
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(category.id));
  const suffix = lang === "en" ? "En" : "Fr";
  const text = (field: string) => (draft as Record<string, unknown>)[`${field}${suffix}`] as string | null;
  const setText = (field: string, value: string) =>
    setDraft((d) => {
      const next = { ...d, [`${field}${suffix}`]: value } as CategoryInput;
      if (field === "name" && lang === "en" && !slugTouched) next.slug = slugify(value);
      return next;
    });

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-6 sm:px-6">
        <LangSwitch value={lang} onChange={setLang} frenchMissing={!draft.nameFr} />
        <TextField id="cat-name" label="Name" value={text("name")} onChange={(v) => setText("name", v)} error={errors[`name${suffix}`]} />
        <TextField id="cat-intro" label="Introduction" value={text("intro")} onChange={(v) => setText("intro", v)} multiline rows={3} optional hint="Shown at the top of the category page." />
        <SingleImageField label="Photo" value={draft.imageKey} onChange={(imageKey) => setDraft((d) => ({ ...d, imageKey }))} folder="categories" aspect="aspect-[3/4] max-w-56" />
        <Toggle checked={draft.isPublished} onChange={(isPublished) => setDraft((d) => ({ ...d, isPublished }))} label="Show on the website" />
        <TextField id="cat-sort" label="Order" value={String(draft.sortOrder)} onChange={(v) => setDraft((d) => ({ ...d, sortOrder: Number(v.replace(/[^\d-]/g, "")) || 0 }))} hint="Lower numbers appear first." />
        <SeoFields
          lang={lang}
          slug={draft.slug}
          onSlugChange={(slug) => {
            setSlugTouched(true);
            setDraft((d) => ({ ...d, slug }));
          }}
          slugPrefix="/shop/"
          title={text("seoTitle")}
          description={text("seoDescription")}
          onTitleChange={(v) => setText("seoTitle", v)}
          onDescriptionChange={(v) => setText("seoDescription", v)}
          fallbackTitle={(lang === "fr" && draft.nameFr) || draft.nameEn}
          fallbackDescription={(lang === "fr" && draft.introFr) || draft.introEn || ""}
          errors={errors}
        />
        {draft.id && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-danger hover:bg-danger/10"
            onClick={() => {
              if (!confirm(`Delete “${draft.nameEn}”? Its products stay, without a category.`)) return;
              startSaving(async () => {
                await deleteCategoryAction(draft.id!);
                toast.success("Category deleted.");
                onDone();
                router.refresh();
              });
            }}
          >
            <Trash2 />
            Delete category
          </Button>
        )}
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <SaveBar
          saving={saving}
          dirty
          label={draft.id ? "Save" : "Create"}
          onSave={() =>
            startSaving(async () => {
              const result = await saveCategoryAction(draft);
              if (!result.ok) {
                setErrors(result.errors);
                toast.error("Please fix the highlighted fields.");
                return;
              }
              toast.success("Category saved.");
              onDone();
              router.refresh();
            })
          }
        />
      </div>
    </>
  );
}

function TermList({ kind, title, description, terms }: { kind: TermInput["kind"]; title: string; description: string; terms: Term[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<TermInput | null>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function save() {
    if (!editing) return;
    startTransition(async () => {
      const result = await saveTermAction({ ...editing, slug: editing.slug || slugify(editing.nameEn) });
      if (!result.ok) {
        setError(Object.values(result.errors)[0]);
        return;
      }
      setEditing(null);
      setError(undefined);
      router.refresh();
    });
  }

  const form = editing && (
    <div className="flex flex-col gap-2 rounded-2xl bg-cream/70 p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <Input value={editing.nameEn} onChange={(e) => setEditing({ ...editing, nameEn: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} placeholder="English name" className="h-10 text-sm" autoFocus />
        <Input value={editing.nameFr ?? ""} onChange={(e) => setEditing({ ...editing, nameFr: e.target.value || null })} placeholder="French name" className="h-10 text-sm" />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={pending || !editing.nameEn.trim()}>
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card
      title={title}
      description={description}
      actions={
        <Button size="sm" variant="secondary" onClick={() => setEditing({ kind, slug: "", nameEn: "", nameFr: null, sortOrder: terms.length + 1 })}>
          <Plus />
          Add
        </Button>
      }
    >
      {editing && !editing.id && <div className="mb-3">{form}</div>}
      <ul className="flex flex-col divide-y divide-line">
        {terms.map((term) =>
          editing?.id === term.id ? (
            <li key={term.id} className="py-2">
              {form}
            </li>
          ) : (
            <li key={term.id} className="flex items-center gap-2 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{term.nameEn}</p>
                <p className="truncate text-xs text-muted">{term.nameFr ?? "No French name yet"}</p>
              </div>
              <button type="button" onClick={() => setEditing({ kind, ...term })} className="grid size-9 place-items-center rounded-full text-muted hover:bg-cream hover:text-plum" aria-label={`Edit ${term.nameEn}`}>
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete “${term.nameEn}”? It will be removed from all products.`)) return;
                  startTransition(async () => {
                    await deleteTermAction(kind, term.id);
                    router.refresh();
                  });
                }}
                className="grid size-9 place-items-center rounded-full text-muted hover:bg-danger/10 hover:text-danger"
                aria-label={`Delete ${term.nameEn}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ),
        )}
      </ul>
    </Card>
  );
}
