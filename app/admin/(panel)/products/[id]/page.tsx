import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { AdminHeader } from "@/components/admin/ui";
import { getCatalogOptions, getProductForEdit } from "@/lib/data/admin/catalog";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const [product, options] = await Promise.all([getProductForEdit(id), getCatalogOptions()]);
  if (!product) notFound();
  return (
    <>
      <AdminHeader title={product.nameEn} back={{ href: "/admin/products", label: "Products" }} />
      <ProductEditor key={product.updatedAt.getTime()} product={product} options={options} />
    </>
  );
}
