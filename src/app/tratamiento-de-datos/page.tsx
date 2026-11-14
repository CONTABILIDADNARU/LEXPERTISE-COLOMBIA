import { LegalPage, legalMetadata } from "@/components/LegalPage";

export const metadata = legalMetadata("tratamiento-de-datos");

export default function Page() {
  return <LegalPage slug="tratamiento-de-datos" />;
}
