import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, type ProjectSlug } from "@/app/projects";
import { createPageMetadata } from "@/app/seo";
import { projectArticles } from "@/content/projects";

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMetadata(slug: ProjectSlug): Metadata {
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return createPageMetadata({
    title: project.title,
    description: project.description,
    path: `/${project.slug}`,
  });
}

interface ProjectArticleProps {
  slug: ProjectSlug;
}

export function ProjectArticle({ slug }: ProjectArticleProps) {
  const project = getProject(slug);
  const Content = projectArticles[slug] as ComponentType | undefined;

  if (!project || !Content) {
    notFound();
  }

  const projectJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `https://desprets.net/${project.slug}`,
    ...(project.github ? { codeRepository: project.github } : {}),
    ...(project.link ? { sameAs: [project.link] } : {}),
    ...(project.technologies.length > 0
      ? { keywords: project.technologies.join(", ") }
      : {}),
  };

  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <h1>{project.title}</h1>
      <Content />
    </article>
  );
}
