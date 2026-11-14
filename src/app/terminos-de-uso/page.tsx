import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("terminos-de-uso");

export default function Page() {
  return <LegalPage slug="terminos-de-uso" />;
}
