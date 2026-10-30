import type { Metadata } from "next";
import { ContentEditor } from "@/components/admin/content-editor";
import { AdminHeader } from "@/components/admin/ui";
import { listContentForEdit } from "@/lib/data/admin/site";

export const metadata: Metadata = { title: "FAQ & pages" };

export default async function ContentPage() {
  const { faqs, pages } = await listContentForEdit();
  return (
    <>
      <AdminHeader title="FAQ & pages" description="Questions and policies customers read before they order or book." />
      <ContentEditor faqs={faqs} pages={pages} />
    </>
  );
}
