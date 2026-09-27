import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceEditor } from "@/components/admin/service-editor";
import { AdminHeader } from "@/components/admin/ui";
import { getServiceForEdit } from "@/lib/data/admin/services";

export const metadata: Metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  const service = await getServiceForEdit((await params).id);
  if (!service) notFound();
  return (
    <>
      <AdminHeader title={service.nameEn} back={{ href: "/admin/services", label: "Services" }} />
      <ServiceEditor key={service.updatedAt.getTime()} service={service} />
    </>
  );
}
