"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { addReview, deleteReview, moderateReview } from "@/lib/data/admin/reviews";
import { tags } from "@/lib/data/tags";
import { reviewStatuses } from "@/lib/db/schema";

const moderation = z.object({ status: z.enum(reviewStatuses).optional(), isFeatured: z.boolean().optional() });

export async function moderateReviewAction(id: string, changes: unknown) {
  await moderateReview(id, moderation.parse(changes));
  updateTag(tags.reviews);
}

export async function deleteReviewAction(id: string) {
  await deleteReview(id);
  updateTag(tags.reviews);
}

const manualReview = z.object({
  name: z.string().trim().min(2).max(80),
  location: z
    .string()
    .trim()
    .max(80)
    .transform((v) => v || null),
  rating: z.number().int().min(1).max(5).nullable(),
  body: z.string().trim().min(5).max(2000),
  source: z.enum(["whatsapp", "in_store"]),
  about: z.string().regex(/^(|product:[\w-]+|service:[\w-]+)$/),
  locale: z.enum(["en", "fr"]),
  consent: z.literal(true),
});

export async function addReviewAction(payload: unknown) {
  const parsed = manualReview.safeParse(payload);
  if (!parsed.success) return { ok: false as const, error: "Fill in the name and review, and confirm the customer agreed to share it." };
  const { about, consent: _consent, ...input } = parsed.data;
  const [kind, id] = about ? about.split(":") : [null, null];
  await addReview({ ...input, productId: kind === "product" ? id : null, serviceId: kind === "service" ? id : null });
  updateTag(tags.reviews);
  return { ok: true as const };
}
