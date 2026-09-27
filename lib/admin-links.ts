import { siteUrl } from "@/lib/site";

export function safeAdminPath(value: unknown) {
  return typeof value === "string" && value.startsWith("/admin") ? value : "/admin";
}

// Links in notification emails go through the sign-in page, which forwards signed-in admins straight on.
export function adminEntryUrl(path: string) {
  return `${siteUrl()}/admin/login?next=${encodeURIComponent(path)}`;
}
