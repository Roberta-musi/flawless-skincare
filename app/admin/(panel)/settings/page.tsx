import type { Metadata } from "next";
import { SettingsEditor } from "@/components/admin/settings-editor";
import { AdminHeader } from "@/components/admin/ui";
import { getSettingsForEdit } from "@/lib/data/admin/site";

export const metadata: Metadata = { title: "Business settings" };

export default async function SettingsPage() {
  const settings = await getSettingsForEdit();
  return (
    <>
      <AdminHeader title="Business settings" description="Contact details, address, opening hours and social links used across the website and on Google." />
      <SettingsEditor key={settings.updatedAt.getTime()} settings={settings} />
    </>
  );
}
