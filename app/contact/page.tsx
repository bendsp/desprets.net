import type { Metadata } from "next";
import { createPageMetadata } from "@/app/seo";
import { StaticRedirect } from "@/components/static-redirect";

export const metadata: Metadata = createPageMetadata({
  title: "Contact",
  description: "Contact Ben Desprets by email or through GitHub, X, and LinkedIn.",
  path: "/",
  index: false,
});

export default function ContactPage() {
  return <StaticRedirect href="/#contact" label="Continue to Contact" />;
}
