"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  showCursor?: boolean;
}

export default function AnimatedText({
  text,
  className = "",
  typingSpeed = 50,
  showCursor = true,
}: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, typingSpeed]);

  return (
    <h1 className={className}>
      {displayedText}
      {showCursor && (
        <span
          className={`inline-block w-[2px] h-[1em] bg-primary ml-1 align-middle ${
            isComplete ? "animate-pulse" : "animate-blink"
          }`}
        ></span>
      )}
    </h1>
  );
}
