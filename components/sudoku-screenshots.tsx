"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const screenshots = [
  {
    name: "gameplay",
    alt: "An Easy Sudoku puzzle with a number pad and undo, redo, erase, notes, and hint controls",
  },
  {
    name: "pencilmarks",
    alt: "Pencil marks in the Sudoku grid, with Notes mode selected",
  },
];

export function SudokuScreenshots() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Static export cannot know the saved theme. Reserve image space, then request
  // only the selected pair after hydration; no light-image preload in dark mode.
  const dark = resolvedTheme === "dark";

  return (
    <div className="sudoku-screenshots not-prose">
      {screenshots.map(({ name, alt }) => (
        <div key={name} className="sudoku-screenshot">
          {mounted ? (
            <Image
              src={`/sudoku/${name}${dark ? "-dark" : ""}.webp`}
              alt={alt}
              width={600}
              height={1304}
            />
          ) : null}
          <noscript>
            {/* Native fallback avoids a theme-blind Next image preload. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/sudoku/${name}.webp`} alt={alt} width={600} height={1304} loading="lazy" />
          </noscript>
        </div>
      ))}
    </div>
  );
}
