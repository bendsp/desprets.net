import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ExternalLink } from "@/components/homepage-content";
import { projects, type ProjectSlug } from "@/app/projects";
import { projectArticles } from "@/content/projects";
import { getProjectStructuredData } from "@/lib/structured-data";
import { absoluteUrl, site } from "@/lib/site";

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMetadata(slug: ProjectSlug): Metadata {
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  const canonical = `/${project.slug}`;
  const image = absoluteUrl(project.ogImage ?? site.image);

  return {
    title: project.title,
    description: project.description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: absoluteUrl(canonical),
      siteName: site.name,
      title: `${project.title} | ${site.name}`,
      description: project.description,
      images: [
        {
          url: image,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} | ${site.name}`,
      description: project.description,
      images: [image],
    },
  };
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

  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <JsonLd data={getProjectStructuredData(project)} />
      <h1>{project.title}</h1>
      <dl className="project-meta">
        <div>
          <dt>Years</dt>
          <dd>{project.years}</dd>
        </div>
        <div>
          <dt>Stack</dt>
          <dd>{project.technologies.join(", ")}</dd>
        </div>
        {(project.link || project.github) && (
          <div>
            <dt>Links</dt>
            <dd>
              {project.link && <ExternalLink href={project.link}>Website</ExternalLink>}
              {project.link && project.github && <span aria-hidden="true"> / </span>}
              {project.github && <ExternalLink href={project.github}>Source</ExternalLink>}
            </dd>
          </div>
        )}
      </dl>
      <Content />
    </article>
  );
}
