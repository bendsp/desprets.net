import { ExternalLink } from "@/components/homepage-content";

export const metadata = {
  title: "Protocol Guild | Ben Desprets",
  description: "Client work for Protocol Guild.",
};

export default function ProtocolGuildPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>Protocol Guild</h1>
      <p>2025</p>
      <p>
        <ExternalLink href="https://www.protocolguild.org/">
          Protocol Guild
        </ExternalLink>{" "}
        is an independent organization focused on sustainable funding for
        Ethereum core protocol development. Its 187 researchers and developers
        maintain Ethereum's core protocol, and the organization has distributed
        $38M to Ethereum core contributors since 2022.
      </p>
      <p>
        I built their{" "}
        <ExternalLink href="https://www.protocolguild.org/blog">
          blog system and page
        </ExternalLink>
        , letting the team publish governance updates and announcements by
        uploading plain Markdown files. The latest or most important entry can
        be pinned as a highlighted feature, while the rest flow into a two-wide
        grid.
      </p>
    </article>
  );
}
