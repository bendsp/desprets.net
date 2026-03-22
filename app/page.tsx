import { projects } from "@/app/projects";

const education = [
  {
    years: "2024-2026",
    degree: "Master's in Software Engineering",
    institution: "Epitech",
    notes: "Expected 2026. Focused on full-stack development, software engineering, and production systems.",
  },
  {
    years: "2024-2025",
    degree: "Certificate in Management",
    institution: "McGill University",
    notes: "Project management, leadership, finance, and business strategy.",
  },
  {
    years: "2020-2024",
    degree: "Bachelor's in Software Engineering",
    institution: "Epitech",
    notes: "International Track program with time in Paris, Berlin, and Montreal.",
  },
];

const skillGroups = [
  {
    label: "Languages",
    value: "C, C++, TypeScript, JavaScript, Solidity, Python, Lua",
  },
  {
    label: "Web and product",
    value: "React, React Native, Next.js, Tailwind, Node.js, PostgreSQL, Drizzle ORM, Clerk, Stripe",
  },
  {
    label: "Infrastructure",
    value: "Docker, GitHub Actions, Jenkins, Azure, AWS, Railway, CI/CD",
  },
  {
    label: "Blockchain and AI",
    value: "Foundry, Hardhat, Viem, Ethers.js, OpenZeppelin, OpenAI API, Gemini API, Ollama",
  },
];

const contactLinks = [
  {
    label: "Email",
    href: "mailto:benjamin.desprets@epitech.eu",
    text: "benjamin.desprets@epitech.eu",
    external: false,
  },
  {
    label: "GitHub",
    href: "https://github.com/bendsp",
    text: "github.com/bendsp",
    external: true,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/benjamindesprets",
    text: "linkedin.com/in/benjamindesprets",
    external: true,
  },
  {
    label: "X",
    href: "https://x.com/bendesprets",
    text: "x.com/bendesprets",
    external: true,
  },
];

export default function Home() {
  return (
    <article>
      <section className="page-section" id="about">
        <h1>About me</h1>
        <p className="lede">
          I&apos;m Benjamin Desprets, a full-stack developer focused on building
          clean, useful software.
        </p>
        <p>
          I&apos;m currently completing a master&apos;s degree in software
          engineering at Epitech. I like working across frontend, backend, and
          product, with an emphasis on clarity, maintainability, and calm user
          experiences.
        </p>
      </section>

      <section className="page-section" id="projects">
        <h2>Projects</h2>
        <p className="muted">
          A few things I&apos;ve built or helped build.
        </p>
        <ul className="project-list">
          {projects.map((project) => {
            const primaryHref = project.link ?? project.github ?? "#";

            return (
              <li key={project.slug}>
                <a href={primaryHref} target="_blank" rel="noreferrer">
                  {project.title}
                </a>{" "}
                {"-"} {project.description}
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
      </section>

      <section className="page-section" id="education">
        <h2>Education</h2>
        <table>
          <thead>
            <tr>
              <th scope="col">Years</th>
              <th scope="col">Degree</th>
              <th scope="col">Institution</th>
            </tr>
          </thead>
          <tbody>
            {education.map((item) => (
              <tr key={`${item.years}-${item.degree}`}>
                <td>{item.years}</td>
                <td>
                  <strong>{item.degree}</strong>
                  <br />
                  <span className="muted">{item.notes}</span>
                </td>
                <td>{item.institution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="page-section" id="skills">
        <h2>Skills</h2>
        <ul className="inline-list">
          {skillGroups.map((group) => (
            <li key={group.label}>
              <strong>{group.label}:</strong> {group.value}
            </li>
          ))}
        </ul>
      </section>

      <section className="page-section" id="contact">
        <h2>Elsewhere</h2>
        <p>
          You can reach me by email or find me on the following platforms.
        </p>
        <ul>
          {contactLinks.map((link) => (
            <li key={link.href}>
              {link.label}:{" "}
              <a
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
