import type { Metadata } from "next";
import { AccountEditor } from "@/components/admin/account-editor";
import { AdminHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { user } = await requireAdmin();
  return (
    <>
      <AdminHeader title="My account" description="Your name and password for this admin panel." />
      <AccountEditor key={user.name} user={user} />
    </>
  );
}
