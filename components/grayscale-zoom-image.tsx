"use client";

import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface GrayscaleZoomImageProps extends ImageProps {
  wrapperClassName?: string;
}

export function GrayscaleZoomImage({
  alt,
  className,
  wrapperClassName,
  ...props
}: GrayscaleZoomImageProps) {
  return (
    <div className={cn("relative overflow-hidden group", wrapperClassName)}>
      <Image
        {...props}
        alt={alt}
        className={cn(
          "object-cover transition-transform duration-500 group-hover:scale-110 grayscale group-hover:grayscale-0",
          className
        )}
      />
    </div>
  );
}
