import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects, type ProjectSlug } from "@/app/projects";
import { createPageMetadata } from "@/app/seo";
import { StaticRedirect } from "@/components/static-redirect";

type ProjectAliasPageProps = {
  params: {
    slug: ProjectSlug;
  };
};

function getProject(slug: ProjectSlug) {
  return projects.find((project) => project.slug === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({
  params,
}: ProjectAliasPageProps): Metadata {
  const project = getProject(params.slug);

  if (!project) {
    return {};
  }

  return createPageMetadata({
    title: project.title,
    description: project.description,
    path: `/${project.slug}`,
    index: false,
  });
}

export default function ProjectAliasPage({ params }: ProjectAliasPageProps) {
  const project = getProject(params.slug);

  if (!project) {
    notFound();
  }

  return <StaticRedirect href={`/${project.slug}`} label={`Continue to ${project.title}`} />;
}
