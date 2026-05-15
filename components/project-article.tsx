import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { projects, type ProjectSlug } from "@/app/projects";
import { projectArticles } from "@/content/projects";
import { getProjectStructuredData } from "@/lib/structured-data";
import { absoluteUrl, site } from "@/lib/site";

const projectImageSlugs = new Set<ProjectSlug>([
  "bedrock",
  "desprets-net",
  "emoji-picker",
  "imagn",
  "skribbl-chat",
]);

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug);
}

export function getProjectMetadata(slug: ProjectSlug): Metadata {
  const project = getProject(slug);

  if (!project) {
    return {};
  }

  const canonical = `/${project.slug}`;
  const image = projectImageSlugs.has(slug)
    ? absoluteUrl(`/assets/projects/${project.slug}/01-hero-desktop.webp`)
    : absoluteUrl(site.image);

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
              {project.link && <a href={project.link}>Website</a>}
              {project.link && project.github && <span aria-hidden="true"> / </span>}
              {project.github && <a href={project.github}>Source</a>}
            </dd>
          </div>
        )}
      </dl>
      <Content />
    </article>
  );
}
