import { ExternalLink } from "@/components/homepage-content";

export const metadata = {
  title: "ETH Investors Club | Ben Desprets",
  description: "Client work for ETH Investors Club.",
};

export default function EICPage() {
  return (
    <article className="document-prose prose prose-neutral dark:prose-invert">
      <h1>ETH Investors Club</h1>
      <p>2024 - 2025</p>
      <p>
        <ExternalLink href="https://www.ethinvestorsclub.com/">
          ETH Investors Club
        </ExternalLink>{" "}
        was a quarterly magazine publishing articles, interviews, and analyses
        around the <ExternalLink href="https://ethereum.org/">Ethereum</ExternalLink>{" "}
        ecosystem and its community.
      </p>
      <p>
        I worked as a contract web and onchain developer, maintaining the
        website and deploying an onchain article minting system that generated
        more than $150k in revenue.
      </p>
    </article>
  );
}
