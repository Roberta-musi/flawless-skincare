import { ContentPage, contentPageMetadata } from "@/components/site/content-page";

export function generateMetadata() {
  return contentPageMetadata("booking-policy");
}

export default function Page() {
  return <ContentPage slug="booking-policy" />;
}
