import Link from "next/link";

export default function NotFound() {
  return (
    <article>
      <section className="page-section">
        <h1>Not found</h1>
        <p>
          This page is not part of the current public site.
        </p>
        <p>
          <Link href="/">Return home</Link>
        </p>
      </section>
    </article>
  );
}
