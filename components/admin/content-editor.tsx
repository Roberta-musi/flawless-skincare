"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Sheet } from "@/components/site/sheet";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { deleteFaqAction, saveContentPageAction, saveFaqAction } from "@/lib/actions/admin/site";
import type { contentPages, faqs } from "@/lib/db/schema";
import type { ContentPageInput, FaqInput } from "@/lib/validation/admin";
import { type Lang, LangSwitch, SaveBar, TextField, Toggle } from "./form-kit";
import { Card, StatusPill } from "./ui";

type Faq = typeof faqs.$inferSelect;
type Page = typeof contentPages.$inferSelect;

const topics: Record<Faq["topic"], string> = {
  ordering: "Ordering",
  delivery: "Delivery & payment",
  booking: "Bookings",
  products: "Products",
  general: "General",
};

const pageNames: Record<Page["slug"], string> = { privacy: "Privacy notice", "booking-policy": "Booking policy", returns: "Returns" };

export function ContentEditor({ faqs, pages }: { faqs: Faq[]; pages: Page[] }) {
  const [editingFaq, setEditingFaq] = useState<FaqInput | null>(null);
  const [editingPage, setEditingPage] = useState<ContentPageInput | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <Card
        title="Frequently asked questions"
        description="Answer the questions customers ask most on WhatsApp: ordering, delivery, payment, bookings."
        actions={
          <Button size="sm" onClick={() => setEditingFaq({ topic: "general", questionEn: "", questionFr: null, answerEn: "", answerFr: null, sortOrder: faqs.length + 1, isPublished: true })}>
            <Plus />
            Add
          </Button>
        }
      >
        <ul className="flex flex-col divide-y divide-line">
          {faqs.map((faq) => (
            <li key={faq.id} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{faq.questionEn}</p>
                <p className="text-xs text-muted">
                  {topics[faq.topic]}
                  {!faq.questionFr && " · No French yet"}
                </p>
              </div>
              {!faq.isPublished && <StatusPill status="draft">Hidden</StatusPill>}
              <button type="button" onClick={() => setEditingFaq(faq)} className="grid size-9 place-items-center rounded-full text-muted hover:bg-cream hover:text-plum" aria-label="Edit question">
                <Pencil className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Policy pages" description="Linked from the footer and the booking form.">
        <ul className="grid gap-3 sm:grid-cols-3">
          {pages.map((page) => (
            <li key={page.slug}>
              <button
                type="button"
                onClick={() => setEditingPage({ slug: page.slug, titleEn: page.titleEn, titleFr: page.titleFr, bodyEn: page.bodyEn, bodyFr: page.bodyFr })}
                className="flex w-full flex-col items-start gap-1 rounded-2xl p-4 text-left ring-1 ring-line transition-colors hover:bg-cream/70"
              >
                <span className="font-medium">{pageNames[page.slug]}</span>
                <span className="text-xs text-muted">{page.bodyFr ? "English & French" : "English only"}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Sheet open={editingFaq != null} onClose={() => setEditingFaq(null)} side="right" label="Edit question" closeLabel="Close" header={<h2 className="text-2xl">Question</h2>} className="sm:w-[34rem]">
        {editingFaq && <FaqForm key={editingFaq.id ?? "new"} faq={editingFaq} onDone={() => setEditingFaq(null)} />}
      </Sheet>
      <Sheet open={editingPage != null} onClose={() => setEditingPage(null)} side="right" label="Edit page" closeLabel="Close" header={<h2 className="text-2xl">{editingPage ? pageNames[editingPage.slug] : ""}</h2>} className="sm:w-[40rem]">
        {editingPage && <PageForm key={editingPage.slug} page={editingPage} onDone={() => setEditingPage(null)} />}
      </Sheet>
    </div>
  );
}

function FaqForm({ faq, onDone }: { faq: FaqInput; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState(faq);
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const fr = lang === "fr";

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-6">
        <LangSwitch value={lang} onChange={setLang} frenchMissing={!draft.questionFr} />
        <Field label="Topic" htmlFor="faq-topic">
          <Select id="faq-topic" value={draft.topic} onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value as Faq["topic"] }))}>
            {Object.entries(topics).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <TextField id="faq-q" label="Question" value={fr ? draft.questionFr : draft.questionEn} onChange={(v) => setDraft((d) => ({ ...d, [fr ? "questionFr" : "questionEn"]: v }))} error={errors[fr ? "questionFr" : "questionEn"]} />
        <TextField id="faq-a" label="Answer" value={fr ? draft.answerFr : draft.answerEn} onChange={(v) => setDraft((d) => ({ ...d, [fr ? "answerFr" : "answerEn"]: v }))} error={errors[fr ? "answerFr" : "answerEn"]} multiline rows={6} />
        <Toggle checked={draft.isPublished} onChange={(isPublished) => setDraft((d) => ({ ...d, isPublished }))} label="Show on the website" />
        <TextField id="faq-sort" label="Order" value={String(draft.sortOrder)} onChange={(v) => setDraft((d) => ({ ...d, sortOrder: Number(v.replace(/[^\d-]/g, "")) || 0 }))} />
        {draft.id && (
          <Button
            variant="ghost"
            size="sm"
            className="self-start text-danger hover:bg-danger/10"
            onClick={() =>
              confirm("Delete this question?") &&
              startSaving(async () => {
                await deleteFaqAction(draft.id!);
                onDone();
                router.refresh();
              })
            }
          >
            <Trash2 />
            Delete
          </Button>
        )}
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <SaveBar
          saving={saving}
          dirty
          label="Save"
          onSave={() =>
            startSaving(async () => {
              const result = await saveFaqAction(draft);
              if (!result.ok) return setErrors(result.errors);
              toast.success("Saved.");
              onDone();
              router.refresh();
            })
          }
        />
      </div>
    </>
  );
}

function PageForm({ page, onDone }: { page: ContentPageInput; onDone: () => void }) {
  const router = useRouter();
  const [draft, setDraft] = useState(page);
  const [lang, setLang] = useState<Lang>("en");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const fr = lang === "fr";

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-6">
        <LangSwitch value={lang} onChange={setLang} frenchMissing={!draft.bodyFr} />
        <TextField id="pg-title" label="Title" value={fr ? draft.titleFr : draft.titleEn} onChange={(v) => setDraft((d) => ({ ...d, [fr ? "titleFr" : "titleEn"]: v }))} error={errors[fr ? "titleFr" : "titleEn"]} />
        <TextField
          id="pg-body"
          label="Text"
          value={fr ? draft.bodyFr : draft.bodyEn}
          onChange={(v) => setDraft((d) => ({ ...d, [fr ? "bodyFr" : "bodyEn"]: v }))}
          error={errors[fr ? "bodyFr" : "bodyEn"]}
          multiline
          rows={18}
          hint="Start a line with ## for a heading, - for a list item, and wrap words in **stars** for bold."
        />
      </div>
      <div className="px-5 pb-5 sm:px-6">
        <SaveBar
          saving={saving}
          dirty
          label="Save"
          onSave={() =>
            startSaving(async () => {
              const result = await saveContentPageAction(draft);
              if (!result.ok) return setErrors(result.errors);
              toast.success("Page updated.");
              onDone();
              router.refresh();
            })
          }
        />
      </div>
    </>
  );
}
