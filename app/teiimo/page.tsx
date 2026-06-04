import { createPageMetadata } from "@/app/seo";

export const metadata = createPageMetadata({
  title: "Teiimo",
  description: "Client work for Teiimo.",
  path: "/teiimo",
});

export default function TeiimoPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>Teiimo</h1>
      <p>Ongoing</p>
      <p>
        AI and data science engineering work for Teiimo, focused on practical
        data, AI, and automation systems.
      </p>
    </article>
  );
}
