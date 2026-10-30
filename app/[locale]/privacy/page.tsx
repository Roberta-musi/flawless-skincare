import { ContentPage, contentPageMetadata } from "@/components/site/content-page";

export function generateMetadata() {
  return contentPageMetadata("privacy");
}

export default function Page() {
  return <ContentPage slug="privacy" />;
}
