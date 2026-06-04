"use client";

import { useEffect } from "react";

interface StaticRedirectProps {
  href: string;
  label: string;
}

export function StaticRedirect({ href, label }: StaticRedirectProps) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>Redirecting</h1>
      <p>
        <a href={href}>{label}</a>
      </p>
    </article>
  );
}
