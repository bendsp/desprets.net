"use client";

import Image from "next/image";
import { GraduationCap, MapPin, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type MapLocation } from "./about-map";

interface LocationCardProps {
  location: MapLocation;
}

export const LocationCard = ({ location }: LocationCardProps) => (
  <div className="w-72 overflow-hidden shadow-2xl border-none">
    {location.image && (
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          fill
          src={location.image}
          alt={location.name}
          className="object-cover"
        />
      </div>
    )}
    <div className="p-3 space-y-2 bg-popover text-popover-foreground font-sans">
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
