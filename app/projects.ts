export interface Project {
  slug: string;
  title: string;
  years: string;
  description: string;
  technologies: string[];
  github?: string;
  link?: string;
}

export const projects: Project[] = [
  {
    slug: "bedrock",
    title: "Bedrock",
    years: "2025-",
    description: "Level up your notes with the power of Markdown",
    technologies: ["React", "Tailwind", "TypeScript", "Electron"],
    github: "https://github.com/bendsp/bedrock",
    link: "https://bedrock.desprets.net/",
  },
  {
    slug: "fundamental",
    title: "Fundamental",
    years: "2024-2026",
    description: "The easiest wallet in the world!",
    technologies: ["React-Native", "Tailwind", "TypeScript", "Crypto"],
    github: "https://github.com/fdmntl/fundamental-app",
    link: "https://www.fundamentalwallet.com/",
  },
  {
    slug: "imagn",
    title: "imagn.xyz",
    years: "2025-",
    description: "An AI-powered image editor and generator",
    technologies: [
      "Next.js",
      "Tailwind",
      "PostgreSQL",
      "Drizzle ORM",
      "Clerk",
      "Stripe",
    ],
    link: "https://imagn.xyz/",
  },
  {
    slug: "emoji-picker",
    title: "Emoji Color Picker",
    years: "2025",
    description: "Find out which emoji has the closest average RGB value",
    technologies: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/emoji-color-picker",
    link: "https://emoji.desprets.net/",
  },
  {
    slug: "skribbl-chat",
    title: "skribbl.chat",
    years: "2025",
    description: "A Pictochat inspired chatroom",
    technologies: ["React-Native", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/skribbl.chat",
    link: "https://skribbl.chat/",
  },
  {
    slug: "raybeam",
    title: "RayBeam",
    years: "2023",
    description: "C++ raytracer from scratch",
    technologies: ["C++", "SFML", "libconfig"],
    github: "https://github.com/bendsp/RayBeam",
  },
  {
    slug: "desprets-net",
    title: "desprets.net",
    years: "2022-",
    description: "To learn recursion, one must first understand recursion.",
    technologies: ["React", "Tailwind", "TypeScript"],
    github: "https://github.com/bendsp/desprets.net",
    link: "https://desprets.net/",
  },
];

export type ProjectSlug = (typeof projects)[number]["slug"];
