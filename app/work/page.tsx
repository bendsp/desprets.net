import WorkContent from "@/content/work.mdx";

export const metadata = {
  title: "Work",
  description:
    "Selected client work and software projects by Ben Desprets.",
  alternates: {
    canonical: "/work",
  },
};

export default function WorkPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <WorkContent />
    </article>
  );
}
