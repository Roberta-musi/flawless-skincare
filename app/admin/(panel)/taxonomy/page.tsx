import type { Metadata } from "next";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { AdminHeader } from "@/components/admin/ui";
import { listTaxonomy } from "@/lib/data/admin/catalog";

export const metadata: Metadata = { title: "Categories & filters" };

export default async function TaxonomyPage() {
  const { categories, concerns, skinTypes } = await listTaxonomy();
  return (
    <>
      <AdminHeader title="Categories & filters" description="Organise the shop. Changes appear on the website straight away." />
      <TaxonomyManager categories={categories} concerns={concerns} skinTypes={skinTypes} />
    </>
  );
}
