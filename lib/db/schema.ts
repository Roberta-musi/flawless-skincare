import { relations } from "drizzle-orm";
import { index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

const seo = {
  seoTitleEn: text("seo_title_en"),
  seoTitleFr: text("seo_title_fr"),
  seoDescriptionEn: text("seo_description_en"),
  seoDescriptionFr: text("seo_description_fr"),
};

export type OpeningHours = ({ opens: string; closes: string } | null)[];
export type Socials = { facebook?: string; tiktok?: string; instagram?: string };
export type PreferredSlot = { date: string; window: "morning" | "afternoon" | "evening" };

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey().default(1),
  businessName: text("business_name").notNull(),
  sloganEn: text("slogan_en"),
  sloganFr: text("slogan_fr"),
  announcementEn: text("announcement_en"),
  announcementFr: text("announcement_fr"),
  whatsapp: text("whatsapp"),
  phone: text("phone"),
  email: text("email"),
  streetAddress: text("street_address"),
  landmarkEn: text("landmark_en"),
  landmarkFr: text("landmark_fr"),
  city: text("city").notNull().default("Limbe"),
  region: text("region").notNull().default("South West"),
  country: text("country").notNull().default("CM"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  mapUrl: text("map_url"),
  shopPhotoKey: text("shop_photo_key"),
  openingHours: text("opening_hours", { mode: "json" }).$type<OpeningHours>(),
  socials: text("socials", { mode: "json" }).$type<Socials>().notNull().default({}),
  ...seo,
  updatedAt: updatedAt(),
});

export const brandProfile = sqliteTable("brand_profile", {
  id: integer("id").primaryKey().default(1),
  ceoName: text("ceo_name"),
  ceoTitleEn: text("ceo_title_en"),
  ceoTitleFr: text("ceo_title_fr"),
  portraitKey: text("portrait_key"),
  shortBioEn: text("short_bio_en"),
  shortBioFr: text("short_bio_fr"),
  storyEn: text("story_en"),
  storyFr: text("story_fr"),
  quoteEn: text("quote_en"),
  quoteFr: text("quote_fr"),
  brandStoryEn: text("brand_story_en"),
  brandStoryFr: text("brand_story_fr"),
  foundedYear: integer("founded_year"),
  ceoSocials: text("ceo_socials", { mode: "json" }).$type<Socials>().notNull().default({}),
  updatedAt: updatedAt(),
});

export const categories = sqliteTable("categories", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  introEn: text("intro_en"),
  introFr: text("intro_fr"),
  imageKey: text("image_key"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
  ...seo,
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const concerns = sqliteTable("concerns", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const skinTypes = sqliteTable("skin_types", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const products = sqliteTable(
  "products",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    nameEn: text("name_en").notNull(),
    nameFr: text("name_fr"),
    shortDescriptionEn: text("short_description_en"),
    shortDescriptionFr: text("short_description_fr"),
    descriptionEn: text("description_en"),
    descriptionFr: text("description_fr"),
    benefitsEn: text("benefits_en", { mode: "json" }).$type<string[]>().notNull().default([]),
    benefitsFr: text("benefits_fr", { mode: "json" }).$type<string[]>().notNull().default([]),
    howToUseEn: text("how_to_use_en"),
    howToUseFr: text("how_to_use_fr"),
    keyIngredientsEn: text("key_ingredients_en"),
    keyIngredientsFr: text("key_ingredients_fr"),
    inci: text("inci"),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    isBestseller: integer("is_bestseller", { mode: "boolean" }).notNull().default(false),
    isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    ...seo,
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productVariants = sqliteTable(
  "product_variants",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    labelEn: text("label_en").notNull(),
    labelFr: text("label_fr"),
    priceXaf: integer("price_xaf"),
    compareAtPriceXaf: integer("compare_at_price_xaf"),
    inStock: integer("in_stock", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_variants_product_idx").on(t.productId)],
);

export const productImages = sqliteTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    altEn: text("alt_en"),
    altFr: text("alt_fr"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const productConcerns = sqliteTable(
  "product_concerns",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    concernId: text("concern_id")
      .notNull()
      .references(() => concerns.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.concernId] })],
);

export const productSkinTypes = sqliteTable(
  "product_skin_types",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    skinTypeId: text("skin_type_id")
      .notNull()
      .references(() => skinTypes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.skinTypeId] })],
);

export const productPairings = sqliteTable(
  "product_pairings",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    pairedProductId: text("paired_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.pairedProductId] })],
);

export const productSetItems = sqliteTable(
  "product_set_items",
  {
    setProductId: text("set_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    itemProductId: text("item_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.setProductId, t.itemProductId] })],
);

export const services = sqliteTable("services", {
  id: id(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameFr: text("name_fr"),
  shortDescriptionEn: text("short_description_en"),
  shortDescriptionFr: text("short_description_fr"),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  whatToExpectEn: text("what_to_expect_en"),
  whatToExpectFr: text("what_to_expect_fr"),
  preparationEn: text("preparation_en"),
  preparationFr: text("preparation_fr"),
  aftercareEn: text("aftercare_en"),
  aftercareFr: text("aftercare_fr"),
  durationMinutes: integer("duration_minutes"),
  priceXaf: integer("price_xaf"),
  priceType: text("price_type", { enum: ["fixed", "from", "consultation"] }).notNull().default("fixed"),
  mode: text("mode", { enum: ["in_shop", "online", "both"] }).notNull().default("in_shop"),
  imageKey: text("image_key"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...seo,
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const bookingStatuses = ["pending", "confirmed", "rejected", "completed", "cancelled"] as const;

export const bookings = sqliteTable(
  "bookings",
  {
    id: id(),
    serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
    serviceName: text("service_name").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    preferredSlots: text("preferred_slots", { mode: "json" }).$type<PreferredSlot[]>().notNull(),
    firstVisit: integer("first_visit", { mode: "boolean" }).notNull().default(true),
    notes: text("notes"),
    locale: text("locale", { enum: ["en", "fr"] }).notNull().default("en"),
    status: text("status", { enum: bookingStatuses }).notNull().default("pending"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp_ms" }),
    adminNote: text("admin_note"),
    policyAcceptedAt: integer("policy_accepted_at", { mode: "timestamp_ms" }).notNull(),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("bookings_status_idx").on(t.status, t.createdAt)],
);

export const reviewStatuses = ["pending", "approved", "rejected"] as const;

export const reviews = sqliteTable(
  "reviews",
  {
    id: id(),
    name: text("name").notNull(),
    location: text("location"),
    rating: integer("rating"),
    body: text("body").notNull(),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    serviceId: text("service_id").references(() => services.id, { onDelete: "set null" }),
    source: text("source", { enum: ["website", "whatsapp", "in_store"] }).notNull().default("website"),
    status: text("status", { enum: reviewStatuses }).notNull().default("pending"),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    locale: text("locale", { enum: ["en", "fr"] }).notNull().default("en"),
    consentAt: integer("consent_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("reviews_status_idx").on(t.status, t.createdAt)],
);

export const messages = sqliteTable("messages", {
  id: id(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  locale: text("locale", { enum: ["en", "fr"] }).notNull().default("en"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  consentAt: integer("consent_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: createdAt(),
});

export const faqs = sqliteTable("faqs", {
  id: id(),
  topic: text("topic", { enum: ["ordering", "delivery", "booking", "products", "general"] })
    .notNull()
    .default("general"),
  questionEn: text("question_en").notNull(),
  questionFr: text("question_fr"),
  answerEn: text("answer_en").notNull(),
  answerFr: text("answer_fr"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
});

export const contentPageSlugs = ["privacy", "booking-policy", "returns"] as const;

export const contentPages = sqliteTable("content_pages", {
  slug: text("slug", { enum: contentPageSlugs }).primaryKey(),
  titleEn: text("title_en").notNull(),
  titleFr: text("title_fr"),
  bodyEn: text("body_en").notNull(),
  bodyFr: text("body_fr"),
  updatedAt: updatedAt(),
});

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role", { enum: ["owner", "manager"] }).notNull().default("manager"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp_ms" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const rateLimit = sqliteTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  variants: many(productVariants),
  images: many(productImages),
  concerns: many(productConcerns),
  skinTypes: many(productSkinTypes),
  pairings: many(productPairings, { relationName: "pairings" }),
  setItems: many(productSetItems, { relationName: "setItems" }),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, { fields: [productVariants.productId], references: [products.id] }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productConcernsRelations = relations(productConcerns, ({ one }) => ({
  product: one(products, { fields: [productConcerns.productId], references: [products.id] }),
  concern: one(concerns, { fields: [productConcerns.concernId], references: [concerns.id] }),
}));

export const productSkinTypesRelations = relations(productSkinTypes, ({ one }) => ({
  product: one(products, { fields: [productSkinTypes.productId], references: [products.id] }),
  skinType: one(skinTypes, { fields: [productSkinTypes.skinTypeId], references: [skinTypes.id] }),
}));

export const productPairingsRelations = relations(productPairings, ({ one }) => ({
  product: one(products, {
    fields: [productPairings.productId],
    references: [products.id],
    relationName: "pairings",
  }),
  pairedProduct: one(products, { fields: [productPairings.pairedProductId], references: [products.id] }),
}));

export const productSetItemsRelations = relations(productSetItems, ({ one }) => ({
  setProduct: one(products, {
    fields: [productSetItems.setProductId],
    references: [products.id],
    relationName: "setItems",
  }),
  itemProduct: one(products, { fields: [productSetItems.itemProductId], references: [products.id] }),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, { fields: [bookings.serviceId], references: [services.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, { fields: [reviews.productId], references: [products.id] }),
  service: one(services, { fields: [reviews.serviceId], references: [services.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));
