import type { Metadata } from "next";
import { BrandEditor } from "@/components/admin/brand-editor";
import { AdminHeader } from "@/components/admin/ui";
import { getBrandForEdit } from "@/lib/data/admin/site";

export const metadata: Metadata = { title: "Brand profile" };

export default async function ProfilePage() {
  const brand = await getBrandForEdit();
  return (
    <>
      <AdminHeader title="Brand profile" description="Your photo and story, shown on the home and about pages." />
      <BrandEditor key={brand.updatedAt.getTime()} brand={brand} />
    </>
  );
}
