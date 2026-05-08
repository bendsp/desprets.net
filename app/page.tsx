import AboutContent from "@/content/about.mdx";
import WorkContent from "@/content/work.mdx";
import EducationContent from "@/content/education.mdx";
import ContactContent from "@/content/contact.mdx";

export default function Home() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <section id="about" className="page-scroll-section" aria-label="About">
        <AboutContent />
      </section>
      <section id="work" className="page-scroll-section" aria-label="Work">
        <WorkContent />
      </section>
      <section id="education" className="page-scroll-section" aria-label="Education">
        <EducationContent />
      </section>
      <section id="contact" className="page-scroll-section" aria-label="Contact">
        <ContactContent />
      </section>
    </article>
  );
}
