import { readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/d1";
import sharp from "sharp";
import { getPlatformProxy } from "wrangler";
import * as schema from "../lib/db/schema.ts";

// Local demo data only. Names and prices come from the product labels and the old Wix
// site; descriptions are placeholders for the client to replace. No reviews are seeded.

if (!process.argv.includes("--local")) {
  console.error("The demo seed only runs against the local database: npm run db:seed");
  process.exit(1);
}

const photos = "docs/assets-to-upload";
const widths = [400, 800, 1600] as const;

const { env, dispose } = await getPlatformProxy<CloudflareEnv>();
const db = drizzle(env.DB, { schema });

async function upload(key: string, file: string) {
  const input = await readFile(`${photos}/${file}`);
  const meta = await sharp(input).rotate().metadata();
  for (const width of widths) {
    const body = await sharp(input).rotate().resize({ width, withoutEnlargement: false }).webp({ quality: 80 }).toBuffer();
    await env.MEDIA.put(`${key}-${width}.webp`, body, { httpMetadata: { contentType: "image/webp" } });
  }
  const og = await sharp(input).rotate().resize({ width: 1200, height: 630, fit: "cover" }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  await env.MEDIA.put(`${key}-og.jpg`, og, { httpMetadata: { contentType: "image/jpeg" } });
  const w = meta.autoOrient?.width ?? meta.width ?? 1;
  const h = meta.autoOrient?.height ?? meta.height ?? 1;
  return { key, width: 1600, height: Math.round((h / w) * 1600) };
}

const {
  categories,
  concerns,
  skinTypes,
  products,
  productVariants,
  productImages,
  productConcerns,
  productSkinTypes,
  productPairings,
  productSetItems,
  services,
  faqs,
  settings,
  brandProfile,
} = schema;

for (const table of [productPairings, productSetItems, productConcerns, productSkinTypes, productImages, productVariants, products, categories, concerns, skinTypes, services, faqs]) {
  await db.delete(table);
}

await db
  .update(settings)
  .set({
    whatsapp: "237673222029",
    phone: "+237 673 222 029",
    email: "musingefor25@gmail.com",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Limbe%2C%20Cameroon",
    openingHours: [
      { opens: "09:00", closes: "21:00" },
      { opens: "09:00", closes: "21:00" },
      { opens: "09:00", closes: "21:00" },
      { opens: "09:00", closes: "21:00" },
      { opens: "09:00", closes: "21:00" },
      null,
      null,
    ],
    socials: {
      facebook: "https://www.facebook.com/share/1DHBJMB1QZ/",
      tiktok: "https://www.tiktok.com/@flawlessskincare2",
    },
    shopPhotoKey: (await upload("site/shop", "77c3a98b-57c3-469c-ba2f-e4fc7bcf4c16.jpg")).key,
  });

await db.update(brandProfile).set({
  ceoName: "Musi Daphne-Nora Ngefor",
  ceoTitleEn: "Founder & CEO",
  ceoTitleFr: "Fondatrice et directrice générale",
  foundedYear: 2020,
  shortBioEn: "Founder of Flawless Skin Care, caring for customers' skin in Limbe for more than six years.",
  shortBioFr: "Fondatrice de Flawless Skin Care, elle prend soin de la peau de ses clients à Limbe depuis plus de six ans.",
  brandStoryEn:
    "Flawless Skin Care began in Limbe more than six years ago with a simple idea: honest, personal skincare advice and products people love to use.\n\nToday we welcome customers in our shop and serve clients across Cameroon and abroad.",
  brandStoryFr:
    "Flawless Skin Care est née à Limbe il y a plus de six ans d'une idée simple : des conseils de soin sincères et personnalisés, et des produits que l'on prend plaisir à utiliser.\n\nAujourd'hui, nous accueillons nos clients en boutique et servons une clientèle partout au Cameroun et à l'étranger.",
});

const categoryImages = {
  face: await upload("categories/face-care", "4e1eff83-f2f9-4adb-b050-cbae5ab3e228.jpg"),
  body: await upload("categories/body-care", "9c741b22-9f58-4043-8db8-df031fe107f3.jpg"),
  soaps: await upload("categories/soaps", "f6da431b-5f90-40a8-b59e-b4a5dbd6ce0a.jpg"),
  scrubs: await upload("categories/scrubs", "f0a05bd8-6801-4864-a7cc-d82dbc25c8b7.jpg"),
  sets: await upload("categories/sets", "059520c0-e148-45d1-85af-9f2a74fd4e6d.jpg"),
};

await db.insert(categories).values([
  { id: "face", slug: "face-care", nameEn: "Face care", nameFr: "Soins du visage", introEn: "Creams and serums for a bright, even-looking complexion.", introFr: "Crèmes et sérums pour un teint lumineux et plus uniforme.", imageKey: categoryImages.face.key, sortOrder: 1 },
  { id: "body", slug: "body-care", nameEn: "Body care", nameFr: "Soins du corps", introEn: "Creams, lotions and butters that leave skin soft and radiant.", introFr: "Crèmes, laits et beurres pour une peau douce et lumineuse.", imageKey: categoryImages.body.key, sortOrder: 2 },
  { id: "soaps", slug: "soaps", nameEn: "Soaps", nameFr: "Savons", introEn: "Cleansing soaps for face and body.", introFr: "Des savons nettoyants pour le visage et le corps.", imageKey: categoryImages.soaps.key, sortOrder: 3 },
  { id: "scrubs", slug: "scrubs", nameEn: "Scrubs", nameFr: "Gommages", introEn: "Exfoliating scrubs for smoother-feeling skin.", introFr: "Des gommages exfoliants pour une peau plus lisse au toucher.", imageKey: categoryImages.scrubs.key, sortOrder: 4 },
  { id: "sets", slug: "sets", nameEn: "Sets", nameFr: "Coffrets", introEn: "Routines put together for you.", introFr: "Des routines composées pour vous.", imageKey: categoryImages.sets.key, sortOrder: 5 },
]);

await db.insert(concerns).values([
  { id: "dark-spots", slug: "dark-spots", nameEn: "Dark spots", nameFr: "Taches brunes", sortOrder: 1 },
  { id: "uneven-tone", slug: "uneven-tone", nameEn: "Uneven tone", nameFr: "Teint irrégulier", sortOrder: 2 },
  { id: "dullness", slug: "dull-skin", nameEn: "Dull skin", nameFr: "Teint terne", sortOrder: 3 },
  { id: "stretch-marks", slug: "stretch-marks", nameEn: "Stretch marks", nameFr: "Vergetures", sortOrder: 4 },
  { id: "dry-skin", slug: "dry-rough-skin", nameEn: "Dry, rough skin", nameFr: "Peau sèche et rugueuse", sortOrder: 5 },
  { id: "dark-knuckles", slug: "dark-knuckles", nameEn: "Dark knuckles & elbows", nameFr: "Articulations foncées", sortOrder: 6 },
]);

await db.insert(skinTypes).values([
  { id: "all", slug: "all-skin-types", nameEn: "All skin types", nameFr: "Tous types de peau", sortOrder: 1 },
  { id: "dry", slug: "dry", nameEn: "Dry", nameFr: "Sèche", sortOrder: 2 },
  { id: "oily", slug: "oily", nameEn: "Oily", nameFr: "Grasse", sortOrder: 3 },
  { id: "combination", slug: "combination", nameEn: "Combination", nameFr: "Mixte", sortOrder: 4 },
  { id: "sensitive", slug: "sensitive", nameEn: "Sensitive", nameFr: "Sensible", sortOrder: 5 },
]);

type Demo = {
  id: string;
  nameEn: string;
  nameFr: string;
  categoryId: string;
  shortEn: string;
  shortFr: string;
  benefitsEn?: string[];
  benefitsFr?: string[];
  keyIngredientsEn?: string;
  keyIngredientsFr?: string;
  photo?: string;
  imageKey?: string;
  variants: { labelEn: string; labelFr: string; priceXaf: number | null; compareAtPriceXaf?: number }[];
  concerns: string[];
  skinTypes: string[];
  flags?: Partial<{ isFeatured: boolean; isBestseller: boolean; isNew: boolean }>;
};

const standard = { labelEn: "Standard size", labelFr: "Format standard" };

const demo: Demo[] = [
  {
    id: "brightening-face-cream",
    nameEn: "Flawless Brightening Face Cream",
    nameFr: "Crème visage éclat Flawless",
    categoryId: "face",
    shortEn: "A daily face cream for a brighter, more even-looking complexion.",
    shortFr: "Une crème visage quotidienne pour un teint plus lumineux et plus uniforme.",
    benefitsEn: ["Helps reduce the look of dark spots", "Brighter-looking complexion"],
    benefitsFr: ["Aide à atténuer l'apparence des taches brunes", "Un teint d'apparence plus lumineuse"],
    photo: "4e1eff83-f2f9-4adb-b050-cbae5ab3e228.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["dark-spots", "uneven-tone"],
    skinTypes: ["all"],
    flags: { isFeatured: true },
  },
  {
    id: "dark-spots-corrector-cream",
    nameEn: "Dark Spots Corrector Cream",
    nameFr: "Crème correctrice taches brunes",
    categoryId: "face",
    shortEn: "A targeted cream for areas with dark spots.",
    shortFr: "Une crème ciblée pour les zones présentant des taches brunes.",
    photo: "1cedd3ef-f469-4fc3-a0a5-24957727e87f.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["dark-spots"],
    skinTypes: ["all"],
    flags: { isNew: true },
  },
  {
    id: "multi-face-vitamin",
    nameEn: "Flawless Multi Face Vitamin",
    nameFr: "Sérum multivitaminé Flawless",
    categoryId: "face",
    shortEn: "A face serum with vitamins C, E and D and niacinamide.",
    shortFr: "Un sérum visage aux vitamines C, E et D et au niacinamide.",
    keyIngredientsEn: "Vitamins C, E and D, niacinamide",
    keyIngredientsFr: "Vitamines C, E et D, niacinamide",
    photo: "485d6804-078e-4536-9c03-49a163d70c42.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["dullness", "uneven-tone"],
    skinTypes: ["all"],
    flags: { isFeatured: true },
  },
  {
    id: "metis-body-cream",
    nameEn: "Metis Body Cream",
    nameFr: "Crème corporelle Metis",
    categoryId: "body",
    shortEn: "A body cream from the Metis range for smooth, even-looking skin.",
    shortFr: "Une crème corporelle de la gamme Metis pour une peau douce et uniforme.",
    photo: "059520c0-e148-45d1-85af-9f2a74fd4e6d.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["uneven-tone", "dark-spots"],
    skinTypes: ["all"],
  },
  {
    id: "metis-body-lotion",
    nameEn: "Metis Body Lotion",
    nameFr: "Lait corporel Metis",
    categoryId: "body",
    shortEn: "A lightweight body lotion from the Metis range.",
    shortFr: "Un lait corporel léger de la gamme Metis.",
    variants: [{ ...standard, priceXaf: 15000 }],
    concerns: ["uneven-tone"],
    skinTypes: ["all"],
  },
  {
    id: "brightening-body-butter",
    nameEn: "Brightening Body Butter",
    nameFr: "Beurre corporel éclat",
    categoryId: "body",
    shortEn: "A rich body butter for dry, rough-feeling skin.",
    shortFr: "Un beurre corporel riche pour les peaux sèches et rugueuses.",
    benefitsEn: ["Rich, nourishing texture", "Helps even out the look of skin tone"],
    benefitsFr: ["Une texture riche et nourrissante", "Aide à unifier l'apparence du teint"],
    photo: "e8159cc8-fd73-412f-ab76-011005861a23.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["dry-skin", "stretch-marks", "uneven-tone"],
    skinTypes: ["dry", "all"],
    flags: { isBestseller: true },
  },
  {
    id: "dark-knuckle-cleanser",
    nameEn: "Dark Knuckle Cleanser",
    nameFr: "Nettoyant articulations foncées",
    categoryId: "body",
    shortEn: "A cleanser for knuckles, elbows and knees.",
    shortFr: "Un nettoyant pour les articulations des doigts, les coudes et les genoux.",
    variants: [{ ...standard, priceXaf: 7000 }],
    concerns: ["dark-knuckles"],
    skinTypes: ["all"],
  },
  {
    id: "brightening-black-soap",
    nameEn: "Brightening Black Soap",
    nameFr: "Savon noir éclat",
    categoryId: "soaps",
    shortEn: "An herbal black soap for all skin types.",
    shortFr: "Un savon noir aux plantes pour tous les types de peau.",
    photo: "f6da431b-5f90-40a8-b59e-b4a5dbd6ce0a.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["uneven-tone"],
    skinTypes: ["all"],
  },
  {
    id: "molato-soap",
    nameEn: "5D Molato Soap",
    nameFr: "Savon Molato 5D",
    categoryId: "soaps",
    shortEn: "A cleansing soap from the Molato range.",
    shortFr: "Un savon nettoyant de la gamme Molato.",
    photo: "ab6cbf58-9bba-4c91-a9a8-5622d80c9594.jpg",
    variants: [{ labelEn: "Big size", labelFr: "Grand format", priceXaf: 10000 }],
    concerns: ["uneven-tone", "dark-spots"],
    skinTypes: ["all"],
    flags: { isBestseller: true },
  },
  {
    id: "super-whitening-soap",
    nameEn: "Super Whitening Soap",
    nameFr: "Savon Super Whitening",
    categoryId: "soaps",
    shortEn: "A cleansing soap for face and body.",
    shortFr: "Un savon nettoyant pour le visage et le corps.",
    photo: "77c3a98b-57c3-469c-ba2f-e4fc7bcf4c16.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["uneven-tone"],
    skinTypes: ["all"],
  },
  {
    id: "turmeric-scrub",
    nameEn: "Turmeric Scrub",
    nameFr: "Gommage au curcuma",
    categoryId: "scrubs",
    shortEn: "An exfoliating body scrub with turmeric.",
    shortFr: "Un gommage exfoliant pour le corps au curcuma.",
    keyIngredientsEn: "Turmeric",
    keyIngredientsFr: "Curcuma",
    photo: "f0a05bd8-6801-4864-a7cc-d82dbc25c8b7.jpg",
    variants: [{ ...standard, priceXaf: null }],
    concerns: ["dullness", "dark-spots"],
    skinTypes: ["all"],
    flags: { isFeatured: true },
  },
  {
    id: "coffee-scrub",
    nameEn: "Exfoliating Coffee Scrub",
    nameFr: "Gommage exfoliant au café",
    categoryId: "scrubs",
    shortEn: "An exfoliating scrub made with coffee.",
    shortFr: "Un gommage exfoliant au café.",
    keyIngredientsEn: "Coffee",
    keyIngredientsFr: "Café",
    variants: [{ ...standard, priceXaf: 5000 }],
    concerns: ["dullness", "dry-skin"],
    skinTypes: ["all"],
    flags: { isBestseller: true },
  },
  {
    id: "hot-chocolate-body-set",
    nameEn: "Hot Chocolate Body Set",
    nameFr: "Coffret corps Hot Chocolate",
    categoryId: "sets",
    shortEn: "A body care set from the Hot Chocolate range.",
    shortFr: "Un coffret de soins du corps de la gamme Hot Chocolate.",
    variants: [{ labelEn: "Set", labelFr: "Coffret", priceXaf: 30000 }],
    concerns: [],
    skinTypes: ["all"],
  },
  {
    id: "metis-body-set",
    nameEn: "Metis Body Set",
    nameFr: "Coffret corps Metis",
    categoryId: "sets",
    shortEn: "A body care set from the Metis range.",
    shortFr: "Un coffret de soins du corps de la gamme Metis.",
    imageKey: categoryImages.sets.key,
    variants: [{ labelEn: "Set", labelFr: "Coffret", priceXaf: 38000, compareAtPriceXaf: 40000 }],
    concerns: ["uneven-tone"],
    skinTypes: ["all"],
    flags: { isFeatured: true },
  },
];

const day = 24 * 60 * 60 * 1000;
for (const [index, p] of demo.entries()) {
  await db.insert(products).values({
    id: p.id,
    slug: p.id,
    categoryId: p.categoryId,
    nameEn: p.nameEn,
    nameFr: p.nameFr,
    shortDescriptionEn: p.shortEn,
    shortDescriptionFr: p.shortFr,
    benefitsEn: p.benefitsEn ?? [],
    benefitsFr: p.benefitsFr ?? [],
    keyIngredientsEn: p.keyIngredientsEn,
    keyIngredientsFr: p.keyIngredientsFr,
    isPublished: true,
    sortOrder: index,
    createdAt: new Date(Date.now() - index * day),
    ...p.flags,
  });
  await db.insert(productVariants).values(p.variants.map((v, i) => ({ productId: p.id, sortOrder: i, ...v })));
  const image = p.photo ? await upload(`products/${p.id}`, p.photo) : p.imageKey ? categoryImages.sets : null;
  if (image) {
    await db.insert(productImages).values({
      productId: p.id,
      key: image.key,
      width: image.width,
      height: image.height,
      altEn: p.nameEn,
      altFr: p.nameFr,
    });
  }
  if (p.concerns.length) await db.insert(productConcerns).values(p.concerns.map((concernId) => ({ productId: p.id, concernId })));
  if (p.skinTypes.length) await db.insert(productSkinTypes).values(p.skinTypes.map((skinTypeId) => ({ productId: p.id, skinTypeId })));
}

const pairings: [string, string][] = [
  ["brightening-face-cream", "multi-face-vitamin"],
  ["multi-face-vitamin", "brightening-face-cream"],
  ["dark-spots-corrector-cream", "brightening-face-cream"],
  ["turmeric-scrub", "brightening-body-butter"],
  ["brightening-black-soap", "brightening-body-butter"],
  ["brightening-body-butter", "turmeric-scrub"],
  ["brightening-body-butter", "metis-body-lotion"],
];
await db.insert(productPairings).values(pairings.map(([productId, pairedProductId], sortOrder) => ({ productId, pairedProductId, sortOrder })));

await db.insert(services).values([
  {
    slug: "skin-consultation",
    nameEn: "Skin consultation",
    nameFr: "Consultation de peau",
    shortDescriptionEn: "A one-to-one look at your skin, your routine and the products that suit you.",
    shortDescriptionFr: "Un rendez-vous individuel pour faire le point sur votre peau, votre routine et les produits qui vous conviennent.",
    whatToExpectEn: "We talk through your skin concerns, your current routine and your goals, then suggest products and treatments that fit.",
    whatToExpectFr: "Nous faisons le point sur vos préoccupations, votre routine actuelle et vos objectifs, puis nous vous proposons les produits et soins adaptés.",
    preparationEn: "If you can, come with clean skin and bring the products you use now, or photos of them.",
    preparationFr: "Si possible, venez la peau propre et apportez les produits que vous utilisez, ou des photos de ceux-ci.",
    durationMinutes: 30,
    mode: "both",
    isPublished: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: "acne-facial",
    nameEn: "Acne facial",
    nameFr: "Soin visage peau à imperfections",
    shortDescriptionEn: "A deep-cleansing facial for skin prone to breakouts.",
    shortDescriptionFr: "Un soin du visage nettoyant en profondeur pour les peaux sujettes aux imperfections.",
    durationMinutes: 60,
    mode: "in_shop",
    isPublished: true,
    sortOrder: 2,
  },
  {
    slug: "stretch-mark-care",
    nameEn: "Stretch mark care",
    nameFr: "Soin vergetures",
    shortDescriptionEn: "A body treatment focused on the look of stretch marks.",
    shortDescriptionFr: "Un soin du corps axé sur l'apparence des vergetures.",
    priceType: "consultation",
    mode: "in_shop",
    isPublished: true,
    sortOrder: 3,
  },
]);

await db.insert(faqs).values([
  {
    topic: "ordering",
    questionEn: "How do I place an order?",
    questionFr: "Comment passer commande ?",
    answerEn: "Add the products you like to your bag, then tap “Send order on WhatsApp”. Your list opens in WhatsApp, ready to send, and we confirm availability, payment and pickup or delivery with you there.",
    answerFr: "Ajoutez les produits qui vous plaisent au panier, puis touchez « Envoyer la commande sur WhatsApp ». Votre liste s'ouvre dans WhatsApp, prête à être envoyée, et nous confirmons avec vous la disponibilité, le paiement et le retrait ou la livraison.",
    sortOrder: 1,
  },
  {
    topic: "ordering",
    questionEn: "Are the prices on the website final?",
    questionFr: "Les prix affichés sont-ils définitifs ?",
    answerEn: "Prices are shown in FCFA as a guide. We confirm the final price with you on WhatsApp before you pay.",
    answerFr: "Les prix sont indiqués en FCFA à titre indicatif. Nous vous confirmons le prix final sur WhatsApp avant le paiement.",
    sortOrder: 2,
  },
  {
    topic: "booking",
    questionEn: "How do I book a treatment?",
    questionFr: "Comment réserver un soin ?",
    answerEn: "Choose a service, give us up to three preferred days and send your request. We contact you on WhatsApp to confirm the appointment.",
    answerFr: "Choisissez un soin, proposez-nous jusqu'à trois jours et envoyez votre demande. Nous vous contactons sur WhatsApp pour confirmer le rendez-vous.",
    sortOrder: 3,
  },
  {
    topic: "booking",
    questionEn: "Can I have a consultation if I live abroad?",
    questionFr: "Puis-je avoir une consultation si j'habite à l'étranger ?",
    answerEn: "Yes. Skin consultations can take place by WhatsApp video call. Choose the consultation when you book and we'll arrange a time with you.",
    answerFr: "Oui. Les consultations peuvent se faire par appel vidéo WhatsApp. Choisissez la consultation lors de votre demande et nous conviendrons d'un horaire avec vous.",
    sortOrder: 4,
  },
  {
    topic: "general",
    questionEn: "Where is your shop?",
    questionFr: "Où se trouve votre boutique ?",
    answerEn: "Our shop is in Limbe, in Cameroon's South West region. The Contact page has our address, opening hours and directions.",
    answerFr: "Notre boutique se trouve à Limbe, dans la région du Sud-Ouest du Cameroun. La page Contact indique notre adresse, nos horaires et l'itinéraire.",
    sortOrder: 5,
  },
]);

await dispose();
console.log(`Seeded ${demo.length} products, 3 services and 5 FAQs into the local database.`);
