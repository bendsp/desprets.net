import { projects, type Project } from "@/app/projects";
import { absoluteUrl, site } from "@/lib/site";

const personId = `${site.url}/#person`;

export function getSiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.legalName,
        alternateName: site.name,
        url: site.url,
        image: absoluteUrl(site.image),
        email: `mailto:${site.email}`,
        jobTitle: "Full-Stack Developer",
        sameAs: site.sameAs,
        knowsAbout: site.skills,
        affiliation: [
          {
            "@type": "Organization",
            name: "Teiimo",
            url: "https://teiimo.com/",
          },
          {
            "@type": "CollegeOrUniversity",
            name: "Epitech",
            url: "https://www.epitech.eu/",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        description: site.description,
        inLanguage: "en",
        author: {
          "@id": personId,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${site.url}/#projects`,
        name: "Software projects by Ben Desprets",
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/${project.slug}`),
          name: project.title,
        })),
      },
    ],
  };
}

export function getProjectStructuredData(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": project.schemaType ?? "SoftwareApplication",
    "@id": `${site.url}/${project.slug}#software`,
    name: project.title,
    description: project.description,
    url: project.link ?? absoluteUrl(`/${project.slug}`),
    codeRepository: project.github,
    programmingLanguage: project.languages,
    keywords: project.technologies,
    author: {
      "@id": personId,
    },
    creator: {
      "@id": personId,
    },
    mainEntityOfPage: absoluteUrl(`/${project.slug}`),
  };
}
