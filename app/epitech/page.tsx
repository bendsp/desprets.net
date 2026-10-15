import { createPageMetadata } from "@/app/seo";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "@/components/homepage-content";

export const metadata = createPageMetadata({
  title: "Epitech",
  description:
    "My Epitech international track, studying in Paris, Berlin, and Montreal before graduating with a master's degree in 2026.",
  path: "/epitech",
});

export default function EpitechPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>Epitech</h1>
      <p>
        I completed Epitech&apos;s international track and graduated with a
        master&apos;s degree in 2026. The school&apos;s approach is built around
        learning through projects, with a strong emphasis on teamwork,
        independent problem-solving, and professional experience. We learned by
        building software and working through problems ourselves. By graduation,
        I had about a year and a half of workplace experience through internships
        and part-time work.
      </p>

      <p>
        I spent my first full year at the Paris campus, working mainly in C.
        After that, I did a six-month internship in France at EssilorLuxottica
        before moving to Berlin for my next year of study.
      </p>

      <p>
        In Berlin, I worked mainly in C++, with some Haskell along the way. Two
        projects that stayed with me were a ray tracer and an entity-component
        system, or ECS, both built from scratch. After the year in Berlin, I
        returned to EssilorLuxottica for a second internship.
      </p>

      <p>
        I then spent an exchange year at <Link href="/mcgill">McGill</Link> in
        Montreal. Alongside my studies there, I continued working on my final
        master&apos;s project with my Epitech team.
      </p>

      <p>
        I completed my final year remotely and started working part-time at{" "}
        <Link href="/teiimo">Teiimo</Link>. After graduating, I moved into a
        full-time role there.
      </p>

      <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
        <figure className="prose-figure">
          <Image
            src="/epitech_paris3.webp"
            alt="Students working together at Epitech's Paris campus"
            width={1600}
            height={1200}
            sizes="(min-width: 640px) 320px, 100vw"
          />
          <figcaption>Paris</figcaption>
        </figure>
        <figure className="prose-figure">
          <Image
            src="/epitech_berlin2.webp"
            alt="A student presenting at a whiteboard at Epitech's Berlin campus"
            width={1600}
            height={1200}
            sizes="(min-width: 640px) 320px, 100vw"
          />
          <figcaption>Berlin</figcaption>
        </figure>
      </div>

      <h2>Fundamental</h2>
      <p>
        For my final master&apos;s project, the Epitech Innovative Project, or EIP,
        I led the team behind <Link href="/fundamental">Fundamental</Link>. We
        aimed to build a complete crypto wallet and financial platform. It
        pushed me beyond development into mobile UI and UX, marketing, and the
        business side of a product. I also learned a lot about leading a team
        through a long project. I&apos;m no longer pursuing it, but I&apos;m
        proud of what we built and of the experience I gained leading it.
      </p>

      <section aria-labelledby="rplace-heading">
        <h2 id="rplace-heading">r/place</h2>
        <p>
          In my first year, I led the campaign to put Epitech&apos;s logo on
          Reddit&apos;s r/place canvas. I drew the pixel art on my laptop,
          configured a bot and accounts to help maintain it, and encouraged
          classmates to take part.
        </p>
        <figure className="prose-figure" style={{ maxWidth: 520 }}>
          <Image
            src="/epitech_paris2.webp"
            alt="A photo of my laptop showing Epitech's blue and white pixel-art logo on the 2022 r/place canvas"
            width={1600}
            height={1200}
            sizes="(min-width: 640px) 520px, 100vw"
          />
          <figcaption>
            Epitech&apos;s logo on r/place in 2022.{' '}
            <ExternalLink href="https://2022.place-atlas.stefanocoding.me/#txhreo">
              View in the atlas
            </ExternalLink>
          </figcaption>
        </figure>
      </section>
    </article>
  );
}
