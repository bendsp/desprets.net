import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import "@/app/globals.css";
import { JsonLd } from "@/components/json-ld";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSiteStructuredData } from "@/lib/structured-data";
import { absoluteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: {
    canonical: "/",
  },
  authors: [{ name: site.legalName, url: site.url }],
  creator: site.legalName,
  keywords: [...site.skills],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: [
      {
        url: absoluteUrl(site.image),
        width: 1200,
        height: 1200,
        alt: site.legalName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    creator: "@bendesprets",
    images: [absoluteUrl(site.image)],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <JsonLd data={getSiteStructuredData()} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="site-shell">
            <header className="site-header">
              <Link href="/" className="site-title">
                Ben Desprets
              </Link>
              <div className="site-header-center">
                <SiteNav />
              </div>
              <div className="site-header-right">
                <ThemeToggle />
              </div>
            </header>

            <main className="site-main">{children}</main>

            <footer className="site-footer">
              <p>Benjamin Desprets / 2022 - {currentYear}</p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
