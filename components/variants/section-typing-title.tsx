"use client";

import { useEffect, useRef, useState, type ElementType } from "react";

interface SectionTypingTitleProps {
  text: string;
  as?: "h2" | "h3";
  className?: string;
  typingSpeed?: number;
  once?: boolean;
}

export default function SectionTypingTitle({
  text,
  as = "h2",
  className = "",
  typingSpeed = 26,
  once = true,
}: SectionTypingTitleProps) {
  const Element = as as ElementType;
  const rootRef = useRef<HTMLElement | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            if (!once) {
              setIsVisible(false);
              setDisplayedText("");
            }
            continue;
          }

          setIsVisible(true);
          setHasTriggered(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, [once]);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplayedText(text);
      return;
    }

    let i = 0;
    setDisplayedText("");

    const timer = window.setInterval(() => {
      i += 1;
      setDisplayedText(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(timer);
      }
    }, typingSpeed);

    return () => window.clearInterval(timer);
  }, [isVisible, text, typingSpeed]);

  const shouldShowCursor = (isVisible || hasTriggered) && displayedText.length < text.length;

  return (
    <Element ref={rootRef} className={className} aria-label={text}>
      {displayedText}
      {shouldShowCursor && <span className="ml-1 inline-block h-[0.95em] w-[2px] animate-pulse bg-current align-middle" />}
    </Element>
  );
}
