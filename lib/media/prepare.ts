import { imageWidths } from "./url";

async function encode(canvas: HTMLCanvasElement, preferred: "image/webp" | "image/jpeg", quality: number) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, preferred, quality));
  // Older iPhone Safari returns PNG when asked for WebP; fall back to JPEG to keep files small.
  if (blob && blob.type === preferred) return blob;
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/jpeg", quality));
}

function draw(source: ImageBitmap, width: number, height: number, crop?: { sx: number; sy: number; sw: number; sh: number }) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  if (crop) ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height);
  else ctx.drawImage(source, 0, 0, width, height);
  return canvas;
}

export async function prepareImage(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const form = new FormData();
  for (const target of imageWidths) {
    const width = Math.min(target, bitmap.width);
    const height = Math.round((bitmap.height / bitmap.width) * width);
    form.append(`w${target}`, await encode(draw(bitmap, width, height), "image/webp", 0.82));
  }
  const ratio = 1200 / 630;
  const sw = Math.min(bitmap.width, bitmap.height * ratio);
  const sh = sw / ratio;
  form.append("og", await encode(draw(bitmap, 1200, 630, { sx: (bitmap.width - sw) / 2, sy: (bitmap.height - sh) / 2, sw, sh }), "image/jpeg", 0.85));
  form.append("width", String(Math.min(1600, bitmap.width)));
  form.append("height", String(Math.round((bitmap.height / bitmap.width) * Math.min(1600, bitmap.width))));
  bitmap.close();
  return form;
}

export async function uploadImage(file: File, folder: "products" | "categories" | "services" | "site" | "brand") {
  const form = await prepareImage(file);
  form.append("folder", folder);
  const response = await fetch("/api/admin/media", { method: "POST", body: form });
  const body = (await response.json()) as { key?: string; width?: number; height?: number; error?: string };
  if (!response.ok || !body.key) throw new Error(body.error ?? "Upload failed");
  return { key: body.key, width: body.width!, height: body.height! };
}
