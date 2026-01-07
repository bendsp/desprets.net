"use client";

import Image from "next/image";
import {
  GraduationCap,
  MapPin,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type MapLocation } from "./about-map";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LocationCardProps {
  location: MapLocation;
}

export const LocationCard = ({ location }: LocationCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPaused, setIsPaused] = useState(false);
  const images = location.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = useCallback(
    (manual = false) => {
      if (manual) setIsPaused(true);
      setDirection(1);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  const prevImage = useCallback(() => {
    setIsPaused(true);
    setDirection(-1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!hasMultipleImages || isAutoPaused) return;

    const interval = setInterval(() => nextImage(false), 5000);
    return () => clearInterval(interval);
  }, [hasMultipleImages, nextImage, isAutoPaused]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  return (
    <div className="w-72 overflow-hidden shadow-2xl border-none">
      {images.length > 0 && (
        <div className="relative aspect-[4/3] w-full overflow-hidden group/card bg-muted">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentImageIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute inset-0"
            >
              <Image
                fill
                src={images[currentImageIndex]}
                alt={`${location.name} - Image ${currentImageIndex + 1}`}
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {hasMultipleImages && (
            <>
              {/* Overlay Navigation Buttons */}
              <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none bg-background/40 hover:bg-background/60 text-foreground backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-none bg-background/40 hover:bg-background/60 text-foreground backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage(true);
                  }}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              {/* Progress Indicators */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 transition-all duration-300",
                      i === currentImageIndex
                        ? "w-4 bg-primary"
                        : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      <div className="p-3 space-y-2 bg-popover text-popover-foreground font-sans text-left">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
            <GraduationCap className="size-3" />
            {location.category}
          </div>
          <h3 className="font-bold text-sm leading-tight">{location.name}</h3>
        </div>

        <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <Calendar className="size-3" />
            <span>{location.period}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="size-3 mt-0.5 shrink-0" />
            <span className="leading-tight">{location.description}</span>
          </div>
        </div>

        <div className="pt-1">
          {location.link && (
            <Button
              size="sm"
              className="w-full h-7 text-[10px] font-mono"
              onClick={() => window.open(location.link!, "_blank")}
            >
              Visit Website
              <ExternalLink className="size-2.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
