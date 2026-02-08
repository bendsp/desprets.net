import { projects, type Project } from "@/app/projects";

export interface HeroCopy {
  title: string;
  subtitle: string;
  intro: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  locations: string[];
  startYear: string;
  endYear: string;
  description: string;
}

export interface SkillCategory {
  name: string;
  items: string[];
}

export type ContactKind = "mail" | "linkedin" | "github" | "x";

export interface ContactLink {
  kind: ContactKind;
  label: string;
  href: string;
}

export const heroCopy: HeroCopy = {
  title: "Benjamin Desprets",
  subtitle: "Full-stack developer",
  intro:
    "I design and ship expressive products across web, mobile, and AI-powered systems.",
};

export const aboutParagraphs = [
  "I'm a passionate developer with a focus on creating clean, efficient, and user-friendly applications. With expertise in both frontend and backend technologies, I enjoy building complete solutions that solve real-world problems.",
  "I'm currently completing my master's degree in computer science at Epitech. My academic journey has equipped me with a strong foundation in software development, problem-solving, and leadership skills.",
];

export const education: EducationItem[] = [
  {
    degree: "Master's in Software Engineering (Expected)",
    institution: "Epitech",
    locations: ["Montreal, Canada", "Paris, France"],
    startYear: "2024",
    endYear: "2026",
    description:
      "Specialized in software engineering, full-stack development, and maintaining production systems.",
  },
  {
    degree: "Certificate in Management",
    institution: "McGill University",
    locations: ["Montreal, Canada"],
    startYear: "2024",
    endYear: "2025",
    description:
      "Focused on project management, leadership, finance, and business strategy.",
  },
  {
    degree: "Bachelor's in Software Engineering",
    institution: "Epitech",
    locations: ["Paris, France", "Berlin, Germany"],
    startYear: "2020",
    endYear: "2024",
    description:
      "Part of the International Track program. Foundation in programming fundamentals, algorithms, and software development methodologies.",
  },
];

export const skillCategories: SkillCategory[] = [
  {
    name: "Languages",
    items: ["TypeScript", "JavaScript", "Python", "C", "C++", "Solidity", "Lua"],
  },
  {
    name: "Frontend",
    items: ["React", "Next.js", "Tailwind", "React Native", "Three.js"],
  },
  {
    name: "Backend & Infra",
    items: ["Node.js", "SQL", "Docker", "AWS", "Azure", "Railway", "CI/CD"],
  },
  {
    name: "Data & AI",
    items: ["Pandas", "NumPy", "Ollama", "OpenAI API", "Gemini API"],
  },
  {
    name: "Blockchain",
    items: ["Foundry", "Hardhat", "Viem", "Ethers.js", "OpenZeppelin"],
  },
  {
    name: "Team Skills",
    items: ["Project Management", "Leadership", "Teamwork", "Adaptability", "Client Relations"],
  },
];

export const contactLinks: ContactLink[] = [
  {
    kind: "mail",
    label: "benjamin.desprets@epitech.eu",
    href: "mailto:benjamin.desprets@epitech.eu",
  },
  {
    kind: "linkedin",
    label: "linkedin.com/in/benjamindesprets",
    href: "https://www.linkedin.com/in/benjamindesprets",
  },
  {
    kind: "github",
    label: "github.com/bendsp",
    href: "https://github.com/bendsp",
  },
  {
    kind: "x",
    label: "x.com/bendesprets",
    href: "https://x.com/bendesprets",
  },
];

export const portfolioProjects = projects;

export const featuredProjects = projects.filter((project) =>
  ["bedrock", "fundamental", "imagn"].includes(project.slug)
);

export const productionTwoProjects: Project[] = [
  "bedrock",
  "fundamental",
  "imagn",
  "emoji-picker",
  "skribbl-chat",
]
  .map((slug) => projects.find((project) => project.slug === slug))
  .filter((project): project is Project => Boolean(project));
