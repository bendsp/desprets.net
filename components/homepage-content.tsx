import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clientWork } from "@/app/client-work";
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
        return (
          <tr key={project.slug}>
            <td className="project-table__years">{project.years}</td>
            <td className="project-table__content">
              <Link href={`/${project.slug}`}>{project.title}</Link>
              <div className="subtle">{project.description}</div>
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
    <table className="project-table">
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
