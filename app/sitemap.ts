import type { MetadataRoute } from "next";
import { clientWork } from "@/app/client-work";
import { projects } from "@/app/projects";
import { siteUrl } from "@/lib/site";

const staticRoutes = ["", "/epitech", "/mcgill"];

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...staticRoutes,
    ...clientWork.map((client) => `/${client.slug}`),
    ...projects.map((project) => `/${project.slug}`),
  ];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
