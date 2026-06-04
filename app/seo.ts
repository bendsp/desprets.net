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
      canonical: path,
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${title} | ${site.name}`,
      description,
      url: path,
      images: [
        {
          url: "/headshot.jpg",
          width: 400,
          height: 400,
          alt: site.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${title} | ${site.name}`,
      description,
      creator: "@bendesprets",
      images: ["/headshot.jpg"],
    },
    robots: {
      index,
      follow: true,
    },
  };
}
