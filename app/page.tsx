import HomePageContent from "@/content/homepage.mdx";
import WorkContent from "@/content/work.mdx";
import AboutContent from "@/content/about.mdx";
import ContactContent from "@/content/contact.mdx";

export default function Home() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <section id="home" className="page-scroll-section" aria-label="Home">
        <HomePageContent />
      </section>
      <section id="work" className="page-scroll-section" aria-label="Work">
        <WorkContent />
      </section>
      <section id="about" className="page-scroll-section" aria-label="About">
        <AboutContent />
      </section>
      <section id="contact" className="page-scroll-section" aria-label="Contact">
        <ContactContent />
      </section>
    </article>
  );
}
