import ContactContent from "@/content/contact.mdx";

export const metadata = {
  title: "Contact",
  description:
    "Contact Ben Desprets by email, GitHub, LinkedIn, or X.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <ContactContent />
    </article>
  );
}
