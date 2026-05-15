import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clientWork } from "@/app/client-work";
import { projects } from "@/app/projects";

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
    <table className="project-table compact-table">
      <tbody>
      {projects.map((project) => {
        return (
          <tr key={project.slug}>
            <td className="project-table__years">{project.years}</td>
            <td className="project-table__content">
              <Link href={`/${project.slug}`}>{project.title}</Link>
              <div className="subtle">{project.description}</div>
              <div className="project-table__stack">
                {project.technologies.join(", ")}
              </div>
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}

export function ClientWorkSection() {
  return (
    <table className="project-table compact-table">
      <tbody>
      {clientWork.map((client) => {
        return (
          <tr key={client.slug}>
            <td className="project-table__years">{client.years}</td>
            <td className="project-table__content">
              <Link href={`/${client.slug}`}>{client.title}</Link>
              <div className="subtle">{client.description}</div>
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
