import "server-only";
import { revalidatePath } from "next/cache";

export function revalidatePublicSite() {
  revalidatePath("/[locale]", "layout");
  revalidatePath("/sitemap.xml");
}
