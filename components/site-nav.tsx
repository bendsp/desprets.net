"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="site-nav">
      {navItems.map((item, index) => (
        <span key={item.href} className="site-nav-item">
          {index > 0 ? <span aria-hidden="true"> / </span> : null}
          <Link
            href={item.href}
            data-active={pathname === item.href}
            aria-current={pathname === item.href ? "page" : undefined}
          >
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
