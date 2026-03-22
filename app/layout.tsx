import type { Metadata } from "next";
import type React from "react";
import Link from "next/link";
import "@/app/globals.css";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Ben Desprets",
  description: "I'm Ben, a full-stack developer with a focus on data and engaging design.",
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
              <p>Benjamin Desprets / 2021 - {currentYear}</p>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
