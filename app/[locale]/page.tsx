import { Container } from "@/components/ui/layout";
import { getI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { dict } = await getI18n();
  return (
    <Container className="py-32">
      <h1 className="text-6xl">{dict.home.heroTitleFallback}</h1>
    </Container>
  );
}
