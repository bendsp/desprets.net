import { createPageMetadata } from "@/app/seo";
import Link from "next/link";
import { ExternalLink } from "@/components/homepage-content";
import { Figure } from "@/components/figure";

// Match the site shell's padding and the two-column gallery's gap.
const pairedPhotoSizes =
  "(max-width: 639px) calc(50vw - 23.6px), (max-width: 720px) calc(50vw - 27.6px), (max-width: 767px) calc(50vw - 34px), 350px";
const portraitPhotoSizes =
  "(max-width: 475px) calc(100vw - 2.2rem), 440px";

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
        I studied software engineering through Epitech&apos;s international track
        and graduated with a master&apos;s degree in 2026.
      </p>

      <section aria-labelledby="paris-heading" className="mt-10">
        <h2 id="paris-heading">Paris</h2>
        <p>
          I spent my first full year at the Paris campus, working mainly in C.
          After that, I did a six-month internship in France at EssilorLuxottica
          before moving to Berlin for my next year of study.
        </p>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5">
          <Figure
            src="/epitech-paris-year-one-1"
            alt="A classroom selfie with classmates during my first year in Paris"
            width={350}
            height={466}
            sizes={pairedPhotoSizes}
          />
          <Figure
            src="/epitech-paris-year-one-2"
            alt="Classmates posing together during my first year in Paris"
            width={350}
            height={467}
            sizes={pairedPhotoSizes}
          />
        </div>

        <div className="mt-7">
          <p>
            I led the campaign to put Epitech&apos;s logo on
            Reddit&apos;s r/place canvas. I drew the pixel art on my laptop,
            configured a bot and accounts to help maintain it, and encouraged
            classmates to take part.
          </p>
          <Figure
            src="/epitech-rplace-2022"
            alt="A photo of my laptop showing Epitech's blue and white pixel-art logo on the 2022 r/place canvas"
            width={440}
            height={587}
            sizes={portraitPhotoSizes}
          >
            Epitech&apos;s logo on r/place in 2022.{" "}
            <ExternalLink href="https://2022.place-atlas.stefanocoding.me/#txhreo">
              View in the atlas
            </ExternalLink>
          </Figure>
        </div>
        <p>
          There was also Unison, a student association that organized
          school-sanctioned raves in the huge basement beneath the campus. It
          felt like a mini Batcave, tucked underneath the whole school.
        </p>
        <Figure
          src="/epitech-paris-unison"
          alt="A crowd at a Unison rave beneath the Paris campus, lit by purple lights and lasers"
          width={440}
          height={587}
          sizes={portraitPhotoSizes}
        />
      </section>

      <section aria-labelledby="berlin-heading" className="mt-10">
        <h2 id="berlin-heading">Berlin</h2>
        <p>
          In Berlin, I worked mainly in C++, with some Haskell. Standout projects
          included{" "}
          <ExternalLink href="https://github.com/bendsp/RayBeam">
            RayBeam
          </ExternalLink>
          , a ray tracer built from scratch with reflections, shadows, and an
          interactive camera. I also built an entity-component system, or ECS,
          from scratch. I then returned to EssilorLuxottica for a second
          internship.
        </p>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5">
          <Figure
            src="/epitech-berlin-whiteboard"
            alt="A student standing at a whiteboard at the Berlin campus"
            width={350}
            height={467}
            sizes={pairedPhotoSizes}
          />
          <Figure
            src="/epitech-berlin-winter"
            alt="A snowy view outside the Berlin campus"
            width={350}
            height={467}
            sizes={pairedPhotoSizes}
          />
        </div>
        <Figure
          src="/epitech-berlin-common-room"
          alt="The common room at the Berlin campus"
          width={600}
          height={450}
          sizes="(max-width: 635px) calc(100vw - 2.2rem), 600px"
        />
      </section>

      <section aria-labelledby="montreal-heading" className="mt-10">
        <h2 id="montreal-heading">Montreal</h2>
        <p>
          I then spent an exchange year at <Link href="/mcgill">McGill</Link> in
          Montreal, where I studied business management and math. Alongside my
          studies there, I continued working on my final
          master&apos;s project with my Epitech team.
        </p>
        <div className="grid grid-cols-2 gap-x-3 sm:gap-x-5">
          <Figure
            src="/epitech-montreal-winter"
            alt="Two people holding coffee on a snowy campus in Montreal"
            width={350}
            height={467}
            sizes={pairedPhotoSizes}
          />
          <Figure
            src="/epitech-montreal-finals"
            alt="A student at a whiteboard during finals week at McGill"
            width={350}
            height={467}
            sizes={pairedPhotoSizes}
          />
        </div>
        <Figure
          src="/epitech-montreal-student-card"
          alt="Holding my McGill student card"
          width={440}
          height={587}
          sizes={portraitPhotoSizes}
        />
      </section>

      <section aria-labelledby="final-year-heading" className="mt-10">
        <h2 id="final-year-heading">Final year</h2>
        <p>
          I completed my final year remotely and started working part-time at{" "}
          <Link href="/teiimo">Teiimo</Link>. By graduation, I had about a year and
          a half of workplace experience through internships and part-time work.
          I then moved into a full-time role there.
        </p>

        <h3>Fundamental</h3>
        <p>
          For my final master&apos;s project, the Epitech Innovative Project, or EIP,
          I led the team behind <Link href="/fundamental">Fundamental</Link>. We
          aimed to build a complete crypto wallet and financial platform. It
          pushed me beyond development into mobile UI and UX, marketing, and the
          business side of a product. I also learned a lot about leading a team
          through a long project. I&apos;m no longer pursuing it, but I&apos;m
          proud of what we built and of the experience I gained leading it.
        </p>
      </section>
    </article>
  );
}
