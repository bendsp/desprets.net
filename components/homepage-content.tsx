import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/app/projects";

interface SubtleProps {
  children: ReactNode;
}

export function Subtle({ children }: SubtleProps) {
  return <div className="subtle">{children}</div>;
}

type LinkProps = ComponentPropsWithoutRef<"a">;

export function ExternalLink({
  children,
  className,
  ...props
}: LinkProps) {
  const classes = className ? `external-link ${className}` : "external-link";

  return (
    <a {...props} className={classes} target="_blank" rel="noreferrer">
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" strokeWidth={1.75} />
    </a>
  );
}

export function ProjectsSection() {
  return (
    <table className="project-table">
      <tbody>
      {projects.map((project) => {
        const primaryHref = project.link ?? project.github ?? "#";

        return (
          <tr key={project.slug}>
            <td className="project-table__years">{project.years}</td>
            <td className="project-table__content">
              <ExternalLink href={primaryHref}>
                {project.title}
              </ExternalLink>
              <div className="subtle">{project.description}</div>
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
