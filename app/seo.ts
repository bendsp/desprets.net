import type { Metadata } from "next";
import { site } from "@/lib/site";

type PageMetadata = {
  title: string;
  description: string;
  path: `/${string}`;
  index?: boolean;
};

export function createPageMetadata({
  title,
  description,
  path,
  index = true,
}: PageMetadata): Metadata {
  return {
    title,
    description,
    alternates: {
      // null blocks the canonical inherited from the root layout
      canonical: index ? path : null,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description: site.description,
      url: path,
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description: site.description,
      creator: "@bendesprets",
      images: ["/og.jpg"],
    },
    robots: {
      index,
      follow: true,
    },
  };
}
