import type { Metadata } from "next";
import { ServiceEditor } from "@/components/admin/service-editor";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "New service" };

export default async function NewServicePage() {
  await requireAdmin();
  return (
    <>
      <AdminHeader title="New service" back={{ href: "/admin/services", label: "Services" }} />
      <ServiceEditor service={null} />
    </>
  );
}
