import { ContentPage, contentPageMetadata } from "@/components/site/content-page";

export function generateMetadata() {
  return contentPageMetadata("returns");
}

export default function Page() {
  return <ContentPage slug="returns" />;
}
