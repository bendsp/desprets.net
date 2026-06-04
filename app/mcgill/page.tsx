import { createPageMetadata } from "@/app/seo";

export const metadata = createPageMetadata({
  title: "McGill",
  description: "Notes on Ben Desprets' management studies at McGill.",
  path: "/mcgill",
});

export default function McGillPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>McGill</h1>
      <p>
        Notes on my management studies at McGill. More detail will live here
        soon.
      </p>
    </article>
  );
}
