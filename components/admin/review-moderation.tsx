"use client";

import { Check, Plus, Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { FormAlert } from "@/components/forms/form-extras";
import { Sheet } from "@/components/site/sheet";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Stars } from "@/components/ui/stars";
import { addReviewAction, deleteReviewAction, moderateReviewAction } from "@/lib/actions/admin/reviews";
import { timeAgo } from "@/lib/admin-format";
import { cn } from "@/lib/cn";
import type { AdminReview } from "@/lib/data/admin/reviews";
import { EmptyState, StatusPill } from "./ui";

const sources = { website: "Website", whatsapp: "WhatsApp", in_store: "In the shop" };

export function ReviewModeration({
  reviews,
  highlight,
  options,
}: {
  reviews: AdminReview[];
  highlight: string | null;
  options: { products: { id: string; nameEn: string }[]; services: { id: string; nameEn: string }[] };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (highlight) document.getElementById(highlight)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlight]);

  const act = (fn: () => Promise<void>, message: string) =>
    startTransition(async () => {
      await fn();
      toast.success(message);
      router.refresh();
    });

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
          <Plus />
          Add a review you received
        </Button>
      </div>
      {reviews.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <li
              key={review.id}
              id={review.id}
              className={cn("flex scroll-mt-24 flex-col gap-4 rounded-[1.5rem] bg-white p-5 ring-1 ring-line sm:p-6", review.id === highlight && "ring-2 ring-fuchsia")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {review.name}
                    {review.location && <span className="font-normal text-muted"> · {review.location}</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {timeAgo(review.createdAt)} · {sources[review.source]}
                    {(review.product || review.service) && ` · ${review.product?.nameEn ?? review.service?.nameEn}`}
                  </p>
                </div>
                <StatusPill status={review.status} />
              </div>
              {review.rating != null && <Stars rating={review.rating} label={`${review.rating} out of 5`} />}
              <p className="text-[15px] leading-7">“{review.body}”</p>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
                {review.status !== "approved" && (
                  <Button size="sm" disabled={pending} onClick={() => act(() => moderateReviewAction(review.id, { status: "approved" }), "Review published.")}>
                    <Check />
                    Approve
                  </Button>
                )}
                {review.status !== "rejected" && (
                  <Button size="sm" variant="secondary" disabled={pending} onClick={() => act(() => moderateReviewAction(review.id, { status: "rejected" }), "Review hidden.")}>
                    <X />
                    {review.status === "approved" ? "Hide" : "Decline"}
                  </Button>
                )}
                {review.status === "approved" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() => act(() => moderateReviewAction(review.id, { isFeatured: !review.isFeatured }), review.isFeatured ? "Removed from the home page." : "Featured on the home page.")}
                  >
                    <Star fill={review.isFeatured ? "currentColor" : "none"} />
                    {review.isFeatured ? "Featured" : "Feature"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto text-danger hover:bg-danger/10"
                  disabled={pending}
                  onClick={() => confirm("Delete this review for good?") && act(() => deleteReviewAction(review.id), "Review deleted.")}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Nothing here" body="Reviews submitted on the website wait here until you approve them." />
      )}
      <Sheet open={adding} onClose={() => setAdding(false)} side="right" label="Add a review" closeLabel="Close" header={<h2 className="text-2xl">Add a review</h2>}>
        {adding && (
          <AddReviewForm
            options={options}
            onDone={() => {
              setAdding(false);
              router.refresh();
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function AddReviewForm({ options, onDone }: { options: { products: { id: string; nameEn: string }[]; services: { id: string; nameEn: string }[] }; onDone: () => void }) {
  const [values, setValues] = useState({ name: "", location: "", rating: "", body: "", source: "whatsapp", about: "", locale: "en" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-6">
      <p className="rounded-2xl bg-lilac/60 p-4 text-sm leading-6">
        Only add real reviews, word for word, from customers who agreed to have them published. Never write or edit reviews yourself.
      </p>
      <Field label="Customer name" htmlFor="ar-name">
        <Input id="ar-name" value={values.name} onChange={set("name")} placeholder="First name or initials are fine" />
      </Field>
      <Field label="Town or country" htmlFor="ar-location" optional optionalLabel="Optional">
        <Input id="ar-location" value={values.location} onChange={set("location")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Received via" htmlFor="ar-source">
          <Select id="ar-source" value={values.source} onChange={set("source")}>
            <option value="whatsapp">WhatsApp</option>
            <option value="in_store">In the shop</option>
          </Select>
        </Field>
        <Field label="Rating" htmlFor="ar-rating" optional optionalLabel="Optional">
          <Select id="ar-rating" value={values.rating} onChange={set("rating")}>
            <option value="">No rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="About" htmlFor="ar-about" optional optionalLabel="Optional">
        <Select id="ar-about" value={values.about} onChange={set("about")}>
          <option value="">General experience</option>
          <optgroup label="Products">
            {options.products.map((p) => (
              <option key={p.id} value={`product:${p.id}`}>
                {p.nameEn}
              </option>
            ))}
          </optgroup>
          <optgroup label="Services">
            {options.services.map((s) => (
              <option key={s.id} value={`service:${s.id}`}>
                {s.nameEn}
              </option>
            ))}
          </optgroup>
        </Select>
      </Field>
      <Field label="Review" htmlFor="ar-body">
        <Textarea id="ar-body" value={values.body} onChange={set("body")} rows={5} />
      </Field>
      <Field label="Language of the review" htmlFor="ar-locale">
        <Select id="ar-locale" value={values.locale} onChange={set("locale")}>
          <option value="en">English</option>
          <option value="fr">French</option>
        </Select>
      </Field>
      <label className="flex items-start gap-3 text-sm leading-6">
        <Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        The customer wrote this review and agreed to have it published on the website.
      </label>
      {error && <FormAlert>{error}</FormAlert>}
      <Button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await addReviewAction({ ...values, rating: values.rating ? Number(values.rating) : null, consent });
            if (!result.ok) return setError(result.error);
            toast.success("Review published.");
            onDone();
          })
        }
      >
        Publish review
      </Button>
    </div>
  );
}
