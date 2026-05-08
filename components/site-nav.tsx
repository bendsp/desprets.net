"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/#about", label: "about", sectionId: "about", path: "/about" },
  { href: "/#work", label: "work", sectionId: "work", path: "/work" },
  { href: "/#education", label: "education", sectionId: "education", path: "/education" },
  { href: "/#contact", label: "contact", sectionId: "contact", path: "/contact" },
];

function getSectionIdForPathname(pathname: string) {
  return navItems.find((item) => item.path === pathname)?.sectionId ?? "about";
}

export function SiteNav() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState(() =>
    getSectionIdForPathname(pathname),
  );

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(getSectionIdForPathname(pathname));
      return;
    }

    const sectionElements = navItems
      .map((item) => document.getElementById(item.sectionId))
      .filter((section): section is HTMLElement => Boolean(section));

    let animationFrame = 0;

    const updateActiveSection = () => {
      const lastSection = sectionElements[sectionElements.length - 1];
      const isAtPageBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

      if (isAtPageBottom && lastSection) {
        setActiveSection(lastSection.id);
        return;
      }

      const header = document.querySelector(".site-header");
      const headerHeight =
        header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
      const marker = headerHeight + 48;
      const currentSection =
        sectionElements
          .map((section) => ({
            id: section.id,
            distance: Math.abs(section.getBoundingClientRect().top - marker),
          }))
          .sort((a, b) => a.distance - b.distance)[0]?.id ?? "about";

      setActiveSection(currentSection);
    };

    const requestActiveSectionUpdate = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateActiveSection);
    };

    requestActiveSectionUpdate();
    window.addEventListener("scroll", requestActiveSectionUpdate, {
      passive: true,
    });
    window.addEventListener("resize", requestActiveSectionUpdate);
    window.addEventListener("hashchange", requestActiveSectionUpdate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestActiveSectionUpdate);
      window.removeEventListener("resize", requestActiveSectionUpdate);
      window.removeEventListener("hashchange", requestActiveSectionUpdate);
    };
  }, [pathname]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (pathname !== "/") {
      return;
    }

    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    event.preventDefault();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    section.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", `#${sectionId}`);
    setActiveSection(sectionId);
  };

  return (
    <nav aria-label="Primary" className="site-nav">
      {navItems.map((item, index) => (
        <span key={item.href} className="site-nav-item">
          {index > 0 ? <span aria-hidden="true">/</span> : null}
          <Link
            href={item.href}
            data-active={activeSection === item.sectionId}
            aria-current={activeSection === item.sectionId ? "location" : undefined}
            onClick={(event) => handleNavClick(event, item.sectionId)}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
