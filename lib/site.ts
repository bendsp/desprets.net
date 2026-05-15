export const site = {
  name: "Ben Desprets",
  legalName: "Benjamin Desprets",
  url: "https://desprets.net",
  description:
    "Ben Desprets is a full-stack developer focused on data, product engineering, and calm user experiences.",
  email: "benjamin.desprets@epitech.eu",
  image: "/headshot.jpg",
  sameAs: [
    "https://github.com/bendsp",
    "https://www.linkedin.com/in/benjamindesprets",
    "https://x.com/bendesprets",
  ],
  skills: [
    "Full-stack development",
    "Frontend engineering",
    "Product engineering",
    "Data science",
    "AI applications",
    "React",
    "Next.js",
    "TypeScript",
    "React Native",
    "PostgreSQL",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, site.url).toString();
}
