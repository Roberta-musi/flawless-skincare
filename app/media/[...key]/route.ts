import { readMediaFile } from "@/lib/media/files";

// Keys carry no extension, so the type comes from the file's first bytes.
function contentType(body: Buffer) {
  if (body.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  if (body[0] === 0xff && body[1] === 0xd8) return "image/jpeg";
  if (body.subarray(1, 4).toString("latin1") === "PNG") return "image/png";
  return "application/octet-stream";
}

export async function GET(_request: Request, { params }: RouteContext<"/media/[...key]">) {
  const { key } = await params;
  const body = await readMediaFile(key.join("/")).catch(() => null);
  if (!body) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": contentType(body),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
