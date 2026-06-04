import type { Metadata } from "next";
import { createPageMetadata } from "@/app/seo";
import { StaticRedirect } from "@/components/static-redirect";

export const metadata: Metadata = createPageMetadata({
  title: "Work",
  description:
    "Selected client work and personal projects by full-stack developer Ben Desprets.",
  path: "/",
  index: false,
});

export default function WorkPage() {
  return <StaticRedirect href="/#work" label="Continue to Work" />;
}
