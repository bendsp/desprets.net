import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Github, Mail, Linkedin, ArrowUpRight } from "lucide-react";
import { projects } from "@/app/projects";

type IconName = "mail" | "github" | "linkedin" | "external";

const icons: Record<IconName, typeof Mail> = {
  mail: Mail,
  github: Github,
  linkedin: Linkedin,
  external: ArrowUpRight,
};

interface SubtleProps {
  children: ReactNode;
}

export function Subtle({ children }: SubtleProps) {
  return <div className="subtle">{children}</div>;
}

interface InlineIconProps {
  name: IconName;
  label?: string;
}

export function InlineIcon({ name, label }: InlineIconProps) {
  const Icon = icons[name];

  return (
    <span className="inline-icon" aria-label={label ?? name}>
      <Icon aria-hidden="true" strokeWidth={1.75} />
    </span>
  );
}

type LinkProps = ComponentPropsWithoutRef<"a">;

export function ExternalLink(props: LinkProps) {
  return <a {...props} target="_blank" rel="noreferrer" />;
}

export function ProjectsSection() {
  return (
    <ul className="project-list">
      {projects.map((project) => {
        const primaryHref = project.link ?? project.github ?? "#";

        return (
          <li key={project.slug}>
            <a href={primaryHref} target="_blank" rel="noreferrer">
              {project.title}
            </a>{" "}
            - {project.description}
            {project.github && project.link ? (
              <>
                {" "}
                <span className="project-links">
                  (
                  <a href={project.github} target="_blank" rel="noreferrer">
                    code
                  </a>
                  )
                </span>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
