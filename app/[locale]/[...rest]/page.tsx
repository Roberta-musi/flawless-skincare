import { notFound } from "next/navigation";

// Rendered per request: caching a 404 for every mistyped or scanned URL would fill the page cache.
export const dynamic = "force-dynamic";

export default function UnknownPage() {
  notFound();
}
