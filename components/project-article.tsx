import type { ComponentType } from "react";
import type { Metadata } from "next";
import { projects, type ProjectSlug } from "@/app/projects";
import { projectArticles } from "@/content/projects";

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMetadata(slug: ProjectSlug): Metadata {
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} | Ben Desprets`,
    description: project.description,
  };
}

interface ProjectArticleProps {
  slug: ProjectSlug;
}

export function ProjectArticle({ slug }: ProjectArticleProps) {
  const project = getProject(slug);
  const Content = projectArticles[slug] as ComponentType | undefined;

  if (!project || !Content) {
    return null;
  }

  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>{project.title}</h1>
      <Content />
    </article>
  );
}
