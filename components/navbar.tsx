"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import SmoothScrollLink from "@/components/smooth-scroll-link";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default function Navbar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <header className="container mx-auto py-6 px-4 sticky top-0 z-50 backdrop-blur-lg bg-background/50 border-b border-border">
      <nav className="flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-primary transition-colors">
          Benjamin Desprets
        </Link>
        <div className="ml-auto flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-6">
            <SmoothScrollLink
              href="#projects"
              className="hover:text-primary transition-colors"
            >
              Projects
            </SmoothScrollLink>
            <SmoothScrollLink
              href="#about"
              className="hover:text-primary transition-colors"
            >
              About
            </SmoothScrollLink>
            <SmoothScrollLink
              href="#education"
              className="hover:text-primary transition-colors"
            >
              Education
            </SmoothScrollLink>
            <SmoothScrollLink
              href="#skills"
              className="hover:text-primary transition-colors"
            >
              Skills
            </SmoothScrollLink>
            <SmoothScrollLink
              href="#contact"
              className="hover:text-primary transition-colors"
            >
              Contact
            </SmoothScrollLink>
            {/* <Link
                href="/blog"
                className="hover:text-primary transition-colors"
              >
                Blog
              </Link> */}
          </div>
          <ThemeToggle />
        </div>
      </nav>
      {/* Thinner Scroll Progress Bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
        style={{ scaleX, transformOrigin: "0%" }}
      />
    </header>
  );
}
