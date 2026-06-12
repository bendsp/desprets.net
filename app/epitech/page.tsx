import { createPageMetadata } from "@/app/seo";

export const metadata = createPageMetadata({
  title: "Epitech",
  description: "Notes on Ben Desprets' software engineering studies at Epitech.",
  path: "/epitech",
});

export default function EpitechPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>Epitech</h1>
      <p>
        Notes on my software engineering studies at Epitech. More detail will
        live here soon.
      </p>
    </article>
  );
}
