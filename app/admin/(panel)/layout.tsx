import { AdminMobileNav, AdminSidebar } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { getAdminCounts } from "@/lib/data/admin/dashboard";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const session = await requireAdmin();
  const counts = await getAdminCounts();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminSidebar counts={counts} user={session.user} />
      <div className="flex min-h-dvh min-w-0 flex-col">
        <AdminMobileNav counts={counts} user={session.user} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-28 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
