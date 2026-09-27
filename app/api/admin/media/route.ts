import { getAdminSession } from "@/lib/auth";
import { putMedia } from "@/lib/media/storage";
import { imageWidths, ogKey, variantKey } from "@/lib/media/url";

const folders = ["products", "categories", "services", "site", "brand"];
const types = ["image/webp", "image/jpeg", "image/png"];
const maxBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getAdminSession())) return Response.json({ error: "Not signed in" }, { status: 401 });

  const form = await request.formData();
  const folder = String(form.get("folder"));
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  if (!folders.includes(folder) || !(width > 0) || !(height > 0)) return Response.json({ error: "Invalid upload" }, { status: 400 });

  const files = [...imageWidths.map((w) => `w${w}`), "og"].map((field) => form.get(field));
  if (files.some((file) => !(file instanceof File) || !types.includes(file.type) || file.size > maxBytes || file.size === 0)) {
    return Response.json({ error: "Each image must be a WebP, JPEG or PNG under 4 MB" }, { status: 400 });
  }

  const key = `${folder}/${crypto.randomUUID()}`;
  const [small, medium, large, og] = files as File[];
  await Promise.all([
    putMedia(variantKey(key, 400), await small.arrayBuffer(), small.type),
    putMedia(variantKey(key, 800), await medium.arrayBuffer(), medium.type),
    putMedia(variantKey(key, 1600), await large.arrayBuffer(), large.type),
    putMedia(ogKey(key), await og.arrayBuffer(), og.type),
  ]);
  return Response.json({ key, width, height });
}
