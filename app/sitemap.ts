import type { MetadataRoute } from "next";
import { clientWork } from "@/app/client-work";
import { projects } from "@/app/projects";
import { absoluteUrl } from "@/lib/site";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/work", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
  { path: "/epitech", priority: 0.5 },
  { path: "/mcgill", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/${project.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...clientWork.map((client) => ({
      url: absoluteUrl(`/${client.slug}`),
      lastModified,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
