export interface ClientWork {
  slug: string;
  title: string;
  years: string;
  description: string;
}

export const clientWork: ClientWork[] = [
  {
    slug: "teiimo",
    title: "Teiimo",
    years: "Ongoing",
    description: "AI and data science engineering.",
  },
  {
    slug: "protocol-guild",
    title: "Protocol Guild",
    years: "2025",
    description: "Ethereum protocol funding infrastructure.",
  },
  {
    slug: "eth-investors-club",
    title: "Eth Investors Club",
    years: "2024 - 2025",
    description: "Web and onchain development.",
  },
];
