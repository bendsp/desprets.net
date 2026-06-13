import type { ReactNode } from "react";

interface FigureProps {
  /** Base path of the WebP variants made by `pnpm img`, e.g. "/pfp" */
  src: string;
  alt: string;
  /** Display width; `${src}-${width}.webp` and `${src}-${width * 2}.webp` must exist */
  width: number;
  /** Display height matching the image aspect ratio (printed by `pnpm img`) */
  height: number;
  /** Set for above-the-fold images only; below-the-fold ones lazy-load */
  priority?: boolean;
  /** Optional caption; inline content only so it stays valid figcaption markup */
  children?: ReactNode;
}

export function Figure({
  src,
  alt,
  width,
  height,
  priority = false,
  children,
}: FigureProps) {
  const loadingProps = priority
    ? ({ fetchPriority: "high" as const })
    : { loading: "lazy" as const };

  return (
    <figure className="prose-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${src}-${width}.webp`}
        srcSet={`${src}-${width}.webp 1x, ${src}-${width * 2}.webp 2x`}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        {...loadingProps}
      />
      {children ? <figcaption>{children}</figcaption> : null}
    </figure>
  );
}
