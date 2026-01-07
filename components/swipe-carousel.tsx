"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SwipeCarouselProps {
  images: string[];
  autoPlayInterval?: number;
  aspectRatio?: string;
  className?: string;
}

export function SwipeCarousel({
  images,
  autoPlayInterval = 5000,
  aspectRatio = "aspect-[4/3]",
  className,
}: SwipeCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 30,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAutoPaused, setIsPaused] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const onPointerDown = useCallback(() => {
    setIsPaused(true);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", onPointerDown);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", onPointerDown);
    };
  }, [emblaApi, onSelect, onPointerDown]);

  useEffect(() => {
    if (!emblaApi || images.length <= 1 || isAutoPaused) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, images.length, isAutoPaused, autoPlayInterval]);

  if (images.length === 0) return null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden group/swipe bg-muted",
        aspectRatio,
        className
      )}
    >
      <div className="h-full w-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0 h-full"
            >
              <Image
                fill
                src={src}
                alt={`Carousel image ${index + 1}`}
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <>
          {/* Navigation Buttons */}
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/swipe:opacity-100 transition-opacity z-10 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-none bg-background/40 hover:bg-background/60 text-foreground backdrop-blur-sm pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(true);
                emblaApi?.scrollPrev();
              }}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-none bg-background/40 hover:bg-background/60 text-foreground backdrop-blur-sm pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(true);
                emblaApi?.scrollNext();
              }}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
            {images.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 transition-all duration-300",
                  i === selectedIndex ? "w-4 bg-primary" : "w-1.5 bg-white/50"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
