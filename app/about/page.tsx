import type { Metadata } from "next";
import { createPageMetadata } from "@/app/seo";
import { StaticRedirect } from "@/components/static-redirect";

export const metadata: Metadata = createPageMetadata({
  title: "About",
  description:
    "About Ben Desprets, a full-stack developer focused on clean, useful software.",
  path: "/",
  index: false,
});

export default function AboutPage() {
  return <StaticRedirect href="/#about" label="Continue to About" />;
}
