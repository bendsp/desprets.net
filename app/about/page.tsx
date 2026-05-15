import AboutContent from "@/content/about.mdx";

export const metadata = {
  title: "About",
  description:
    "About Ben Desprets, a full-stack developer focused on clean, useful software.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <AboutContent />
    </article>
  );
}
