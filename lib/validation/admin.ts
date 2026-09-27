import { z } from "zod";
import { contentPageSlugs, faqs } from "@/lib/db/schema";
import { slugPattern } from "@/lib/slug";

const optionalText = z
  .string()
  .trim()
  .max(5000)
  .nullish()
  .transform((v) => (v ? v : null));
const requiredText = (max = 200) => z.string().trim().min(1, { error: "Required" }).max(max, { error: "Too long" });
const slug = z.string().trim().regex(slugPattern, { error: "Use lowercase letters, numbers and dashes only" });
const price = z.number().int().min(0).max(100_000_000).nullable();
const list = z.array(z.string().trim().min(1).max(300)).max(20);
const mediaKey = (folder: string) => z.string().regex(new RegExp(`^${folder}/[a-z0-9-]+$`));

const seo = {
  seoTitleEn: optionalText,
  seoTitleFr: optionalText,
  seoDescriptionEn: optionalText,
  seoDescriptionFr: optionalText,
};

export const productSchema = z.object({
  id: z.string().optional(),
  slug,
  categoryId: z.string().nullable(),
  nameEn: requiredText(),
  nameFr: optionalText,
  shortDescriptionEn: optionalText,
  shortDescriptionFr: optionalText,
  descriptionEn: optionalText,
  descriptionFr: optionalText,
  benefitsEn: list,
  benefitsFr: list,
  howToUseEn: optionalText,
  howToUseFr: optionalText,
  keyIngredientsEn: optionalText,
  keyIngredientsFr: optionalText,
  inci: optionalText,
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  isBestseller: z.boolean(),
  isNew: z.boolean(),
  sortOrder: z.number().int(),
  ...seo,
  variants: z
    .array(
      z
        .object({
          id: z.string().optional(),
          labelEn: requiredText(80),
          labelFr: optionalText,
          priceXaf: price,
          compareAtPriceXaf: price,
          inStock: z.boolean(),
        })
        .refine((v) => v.compareAtPriceXaf == null || (v.priceXaf != null && v.compareAtPriceXaf > v.priceXaf), {
          error: "The old price must be higher than the price",
          path: ["compareAtPriceXaf"],
        }),
    )
    .min(1, { error: "Add at least one size" })
    .max(12),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        key: mediaKey("products"),
        width: z.number().int().positive(),
        height: z.number().int().positive(),
        altEn: optionalText,
        altFr: optionalText,
      }),
    )
    .max(12),
  concernIds: z.array(z.string()).max(30),
  skinTypeIds: z.array(z.string()).max(30),
  pairingIds: z.array(z.string()).max(8),
  setItems: z.array(z.object({ productId: z.string(), quantity: z.number().int().min(1).max(20) })).max(12),
});

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  id: z.string().optional(),
  slug,
  nameEn: requiredText(80),
  nameFr: optionalText,
  introEn: optionalText,
  introFr: optionalText,
  imageKey: mediaKey("categories").nullable(),
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
  ...seo,
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const termSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(["concern", "skinType"]),
  slug,
  nameEn: requiredText(80),
  nameFr: optionalText,
  sortOrder: z.number().int(),
});

export type TermInput = z.infer<typeof termSchema>;

export const serviceSchema = z.object({
  id: z.string().optional(),
  slug,
  nameEn: requiredText(),
  nameFr: optionalText,
  shortDescriptionEn: optionalText,
  shortDescriptionFr: optionalText,
  descriptionEn: optionalText,
  descriptionFr: optionalText,
  whatToExpectEn: optionalText,
  whatToExpectFr: optionalText,
  preparationEn: optionalText,
  preparationFr: optionalText,
  aftercareEn: optionalText,
  aftercareFr: optionalText,
  durationMinutes: z.number().int().min(5).max(600).nullable(),
  priceXaf: price,
  priceType: z.enum(["fixed", "from", "consultation"]),
  mode: z.enum(["in_shop", "online", "both"]),
  imageKey: mediaKey("services").nullable(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int(),
  ...seo,
});

export type ServiceInput = z.infer<typeof serviceSchema>;

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const settingsSchema = z.object({
  businessName: requiredText(120),
  sloganEn: optionalText,
  sloganFr: optionalText,
  announcementEn: optionalText,
  announcementFr: optionalText,
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || (v.length >= 8 && v.length <= 15), { error: "Enter the full number with country code" })
    .transform((v) => v || null),
  phone: optionalText,
  email: z.union([z.literal(""), z.email({ error: "Enter a valid email" })]).transform((v) => v || null),
  streetAddress: optionalText,
  landmarkEn: optionalText,
  landmarkFr: optionalText,
  city: requiredText(80),
  region: requiredText(80),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  mapUrl: z.union([z.literal(""), z.url({ error: "Enter a full link starting with https://" })]).transform((v) => v || null),
  shopPhotoKey: mediaKey("site").nullable(),
  openingHours: z
    .array(z.object({ opens: hhmm, closes: hhmm }).nullable())
    .length(7)
    .refine((days) => days.every((d) => d == null || d.opens < d.closes), { error: "Closing time must be after opening time" }),
  socials: z.object({
    facebook: z.union([z.literal(""), z.url()]).optional(),
    tiktok: z.union([z.literal(""), z.url()]).optional(),
    instagram: z.union([z.literal(""), z.url()]).optional(),
  }),
  ...seo,
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export const brandSchema = z.object({
  ceoName: optionalText,
  ceoTitleEn: optionalText,
  ceoTitleFr: optionalText,
  portraitKey: mediaKey("brand").nullable(),
  shortBioEn: optionalText,
  shortBioFr: optionalText,
  storyEn: optionalText,
  storyFr: optionalText,
  quoteEn: optionalText,
  quoteFr: optionalText,
  brandStoryEn: optionalText,
  brandStoryFr: optionalText,
  foundedYear: z.number().int().min(1990).max(2100).nullable(),
  ceoSocials: z.object({
    facebook: z.union([z.literal(""), z.url()]).optional(),
    tiktok: z.union([z.literal(""), z.url()]).optional(),
    instagram: z.union([z.literal(""), z.url()]).optional(),
  }),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const faqSchema = z.object({
  id: z.string().optional(),
  topic: z.enum(faqs.topic.enumValues),
  questionEn: requiredText(300),
  questionFr: optionalText,
  answerEn: requiredText(3000),
  answerFr: optionalText,
  sortOrder: z.number().int(),
  isPublished: z.boolean(),
});

export type FaqInput = z.infer<typeof faqSchema>;

export const contentPageSchema = z.object({
  slug: z.enum(contentPageSlugs),
  titleEn: requiredText(150),
  titleFr: optionalText,
  bodyEn: requiredText(20000),
  bodyFr: optionalText,
});

export type ContentPageInput = z.infer<typeof contentPageSchema>;

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!(key in errors)) errors[key] = issue.message;
  }
  return errors;
}
