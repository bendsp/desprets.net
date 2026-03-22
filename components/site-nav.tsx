"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navItems = [
  { href: "/", label: "home" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
];

export function SiteNav() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return (
    <nav aria-label="Primary" className="site-nav">
      {navItems.map((item, index) => (
        <span key={item.href} className="site-nav-item">
          {index > 0 ? <span aria-hidden="true"> / </span> : null}
          <Link href={item.href} data-active={pathname === item.href}>
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
