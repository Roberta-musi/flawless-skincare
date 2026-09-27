import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { ServiceList } from "@/components/admin/service-list";
import { AdminHeader } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/button";
import { listAdminServices } from "@/lib/data/admin/services";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const services = await listAdminServices();
  return (
    <>
      <AdminHeader
        title="Services"
        description="Treatments and consultations customers can book on the website."
        actions={
          <ButtonLink href="/admin/services/new" size="sm">
            <Plus />
            Add service
          </ButtonLink>
        }
      />
      <ServiceList services={services} />
    </>
  );
}
