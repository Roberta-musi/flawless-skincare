import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/product-editor";
import { AdminHeader } from "@/components/admin/ui";
import { getCatalogOptions } from "@/lib/data/admin/catalog";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const options = await getCatalogOptions();
  return (
    <>
      <AdminHeader title="New product" back={{ href: "/admin/products", label: "Products" }} />
      <ProductEditor product={null} options={options} />
    </>
  );
}
