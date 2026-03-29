import type { ComponentType } from "react";
import type { Metadata } from "next";
import { ExternalLink } from "@/components/homepage-content";
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
      <div className="subtle project-summary">{project.description}</div>
      <p className="project-meta">
        <span>{project.years}</span>
        <span>/</span>
        <span>{project.technologies.join(", ")}</span>
      </p>
      {(project.link || project.github) && (
        <p className="project-actions">
          {project.link ? (
            <ExternalLink href={project.link}>live</ExternalLink>
          ) : null}
          {project.github ? (
            <ExternalLink href={project.github}>github</ExternalLink>
          ) : null}
        </p>
      )}
      <Content />
    </article>
  );
}
