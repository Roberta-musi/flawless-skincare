import type { Metadata } from "next";
import { TeamManager } from "@/components/admin/team-manager";
import { AdminHeader } from "@/components/admin/ui";
import { listTeam } from "@/lib/data/admin/team";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
  const members = await listTeam();
  return (
    <>
      <AdminHeader title="Team" description="Give staff their own sign-in instead of sharing yours. Managers can do everything except manage the team." />
      <TeamManager members={members} />
    </>
  );
}
