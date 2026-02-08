"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { createLucideIcon } from "lucide-react";
import GlyphHeroStatic from "@/components/variants/glyph-hero-static";
import SectionTypingTitle from "@/components/variants/section-typing-title";
import { Button } from "@/components/ui/button";
import SmoothScrollLink from "@/components/smooth-scroll-link";
import {
  aboutParagraphs,
  contactLinks,
  education,
  heroCopy,
  productionTwoProjects,
  skillCategories,
  type ContactKind,
} from "@/components/variants/portfolio-data";
import styles from "@/components/variants/variant-two-production.module.css";

const XIcon = createLucideIcon("X", [
  [
    "path",
    {
      key: "x-icon-path",
      d: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
      stroke: "none",
      fill: "currentColor",
    },
  ],
]);

function contactIcon(kind: ContactKind) {
  if (kind === "mail") return <Mail className={styles.icon} />;
  if (kind === "linkedin") return <Linkedin className={styles.icon} />;
  if (kind === "github") return <Github className={styles.icon} />;
  return <XIcon className={styles.icon} />;
}

export default function VariantTwoProduction() {
  const [expandedProjects, setExpandedProjects] = useState(false);

  const visibleProjects = useMemo(
    () => (expandedProjects ? productionTwoProjects : productionTwoProjects.slice(0, 3)),
    [expandedProjects]
  );

  const canExpand = productionTwoProjects.length > 3;

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={`${styles.hero} ${styles.reveal}`}>
          <GlyphHeroStatic
            title={heroCopy.title}
            subtitle={heroCopy.subtitle}
            className="relative min-h-[330px] md:min-h-[410px] flex items-center justify-center px-5 py-10 md:py-14"
          >
            <div className={styles.heroActions}>
              <SmoothScrollLink href="#about" className="inline-block" title="Jump to About section">
                <Button variant="outline" className={styles.heroButtonOutline}>About Me</Button>
              </SmoothScrollLink>
              <SmoothScrollLink href="#contact" className="inline-block" title="Jump to Contact section">
                <Button className={styles.heroButtonSolid}>Contact Me</Button>
              </SmoothScrollLink>
            </div>
          </GlyphHeroStatic>
        </header>

        <section id="projects" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "70ms" }}>
          <div className={styles.sectionHead}>
            <SectionTypingTitle text="Projects" className={styles.sectionTitle} />
            <span className={styles.sectionNote}>5 selected projects</span>
          </div>

          <div className={styles.projectsGrid}>
            {visibleProjects.map((project) => {
              const image = project.darkImages?.[0] ?? project.images[0];

              return (
                <article key={project.slug} className={styles.projectCard}>
                  <div className={styles.projectMedia}>
                    <Image
                      src={image}
                      alt={`${project.title} screenshot`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover object-top"
                    />
                  </div>
                  <div className={styles.projectBody}>
                    <div className={styles.projectHead}>
                      <h3 className={styles.projectTitle}>{project.title}</h3>
                      <span className={styles.projectTech}>{project.technologies.slice(0, 3).join(" • ")}</span>
                    </div>
                    <p className={styles.projectDesc}>{project.description}</p>
                    <div className={styles.projectLinks}>
                      <Link className={styles.link} href={`/projects/${project.slug}`}>
                        Case Study
                      </Link>
                      {project.github && (
                        <a className={styles.link} href={project.github} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      )}
                      {project.link && (
                        <a className={styles.link} href={project.link} target="_blank" rel="noopener noreferrer">
                          Live
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {canExpand && (
            <div className={styles.projectsToggle}>
              <button
                type="button"
                className={styles.toggleButton}
                aria-expanded={expandedProjects}
                onClick={() => setExpandedProjects((state) => !state)}
              >
                {expandedProjects ? "Show fewer projects" : "Show 2 more projects"}
              </button>
            </div>
          )}
        </section>

        <section id="about" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "110ms" }}>
          <div className={styles.sectionHead}>
            <SectionTypingTitle text="About" className={styles.sectionTitle} />
            <span className={styles.sectionNote}>Who I am</span>
          </div>

          <div className={styles.aboutGrid}>
            <div className={styles.portraitWrap}>
              <Image
                src="/headshot.jpg"
                alt="Benjamin Desprets portrait"
                width={320}
                height={320}
                className="h-auto w-full"
              />
            </div>
            <div className={styles.aboutCopy}>
              {aboutParagraphs.map((paragraph) => (
                <p key={paragraph} className={styles.aboutParagraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section id="education" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "150ms" }}>
          <div className={styles.sectionHead}>
            <SectionTypingTitle text="Education" className={styles.sectionTitle} />
            <span className={styles.sectionNote}>Timeline</span>
          </div>

          <div className={styles.timeline}>
            {education.map((entry) => (
              <article key={entry.degree} className={styles.timelineItem}>
                <h3 className={styles.timelineTitle}>
                  {entry.degree} ({entry.startYear}-{entry.endYear})
                </h3>
                <p className={styles.timelineMeta}>
                  {entry.institution} • {entry.locations.join(" • ")}
                </p>
                <p className={styles.timelineDesc}>{entry.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="skills" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "190ms" }}>
          <div className={styles.sectionHead}>
            <SectionTypingTitle text="Skills" className={styles.sectionTitle} />
            <span className={styles.sectionNote}>Structured by area</span>
          </div>

          <div className={styles.skillsGrid}>
            {skillCategories.map((category) => (
              <article key={category.name} className={styles.skillCard}>
                <h3 className={styles.skillTitle}>{category.name}</h3>
                <div className={styles.skillItems}>
                  {category.items.map((item) => (
                    <span key={item} className={styles.skillItem}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className={styles.skillsLegend}>
            Categories reflect how I structure real product delivery across implementation, interface work, operations, and collaboration.
          </p>
        </section>

        <section id="contact" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "230ms" }}>
          <div className={styles.sectionHead}>
            <SectionTypingTitle text="Contact" className={styles.sectionTitle} />
            <span className={styles.sectionNote}>Open to collaboration</span>
          </div>

          <div className={styles.contactList}>
            {contactLinks.map((contact) => (
              <a
                key={contact.href}
                href={contact.href}
                className={styles.contactItem}
                target={contact.kind === "mail" ? undefined : "_blank"}
                rel={contact.kind === "mail" ? undefined : "noopener noreferrer"}
              >
                {contactIcon(contact.kind)}
                <span>{contact.label}</span>
                {contact.kind !== "mail" && <ExternalLink className={styles.icon} />}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
