import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ProductList } from "@/components/admin/product-list";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { listAdminProducts } from "@/lib/data/admin/catalog";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const products = await listAdminProducts();
  return (
    <>
      <AdminHeader
        title="Products"
        description="Tap “Live” to hide or show a product instantly. Open a product to edit its details, photos and prices."
        actions={
          <ButtonLink href="/admin/products/new" size="sm">
            <Plus />
            Add product
          </ButtonLink>
        }
      />
      <ProductList products={products} />
    </>
  );
}
