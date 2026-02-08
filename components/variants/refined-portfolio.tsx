import Link from "next/link";
import { ExternalLink, Github, Linkedin, Mail } from "lucide-react";
import { createLucideIcon } from "lucide-react";
import PixelHero from "@/components/pixel-hero";
import {
  aboutParagraphs,
  contactLinks,
  education,
  featuredProjects,
  heroCopy,
  skillCategories,
  type ContactKind,
} from "@/components/variants/portfolio-data";
import styles from "@/components/variants/refined-portfolio.module.css";

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

type VariantTone = "v1" | "v2" | "v3" | "v4" | "v5";
type HeroMode = "static" | "glyph";

interface RefinedVariantProps {
  variantName: string;
  tone: VariantTone;
  heroMode: HeroMode;
  heroHint: string;
  sectionNote: string;
}

function contactIcon(kind: ContactKind) {
  if (kind === "mail") return <Mail className={styles.icon} />;
  if (kind === "linkedin") return <Linkedin className={styles.icon} />;
  if (kind === "github") return <Github className={styles.icon} />;
  return <XIcon className={styles.icon} />;
}

export default function RefinedPortfolioVariant({
  variantName,
  tone,
  heroMode,
  heroHint,
  sectionNote,
}: RefinedVariantProps) {
  return (
    <main className={`${styles.page} ${styles[tone]}`}>
      <div className={styles.shell}>
        {heroMode === "glyph" ? (
          <header className={styles.reveal}>
            <PixelHero
              text={heroCopy.title}
              className={`${styles.heroGlyph} pt-16 md:pt-20 pb-10 md:pb-14 min-h-[320px] md:min-h-[390px]`}
            >
              <div className={styles.heroInner}>
                <span className={styles.heroBadge}>
                  <span className={styles.heroBadgeDot} />
                  {variantName}
                </span>
                <p className={styles.heroGlyphTitle}>{heroCopy.subtitle}</p>
                <p className={styles.heroGlyphIntro}>{heroHint}</p>
                <div className={styles.heroGlyphMeta}>
                  <span className={styles.metaChip}>Selected work only</span>
                  <span className={styles.metaChip}>Clear skill map</span>
                  <span className={styles.metaChip}>Pixel refinement</span>
                </div>
              </div>
            </PixelHero>
          </header>
        ) : (
          <header className={`${styles.heroStatic} ${styles.reveal}`}>
            <span className={styles.heroBadge}>
              <span className={styles.heroBadgeDot} />
              {variantName}
            </span>
            <h1 className={styles.heroTitle}>{heroCopy.title}</h1>
            <p className={styles.heroSubtitle}>{heroCopy.subtitle}</p>
            <p className={styles.heroIntro}>{heroHint}</p>
            <div className={styles.heroMeta}>
              <span className={styles.metaChip}>Focused narrative</span>
              <span className={styles.metaChip}>3 featured builds</span>
              <span className={styles.metaChip}>Low-noise sections</span>
            </div>
          </header>
        )}

        <section id="projects" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "70ms" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Projects</h2>
            <span className={styles.sectionNote}>{sectionNote}</span>
          </div>
          <div className={styles.projectList}>
            {featuredProjects.map((project) => (
              <article key={project.slug} className={styles.projectRow}>
                <div className={styles.projectHead}>
                  <h3 className={styles.projectTitle}>{project.title}</h3>
                  <span className={styles.projectTech}>{project.technologies.slice(0, 4).join(" • ")}</span>
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
              </article>
            ))}
          </div>
        </section>

        <section id="about" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "110ms" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>About</h2>
            <span className={styles.sectionNote}>Concise profile</span>
          </div>
          <div className={styles.aboutGrid}>
            {aboutParagraphs.map((paragraph) => (
              <p key={paragraph} className={styles.aboutParagraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section id="education" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "150ms" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Education</h2>
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
            <h2 className={styles.sectionTitle}>Skills</h2>
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
            Signal: categories show how I typically organize work delivery, from core implementation and interface work to operations, AI integration, and team execution.
          </p>
        </section>

        <section id="contact" className={`${styles.section} ${styles.reveal}`} style={{ animationDelay: "230ms" }}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Contact</h2>
            <span className={styles.sectionNote}>Open to work</span>
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
