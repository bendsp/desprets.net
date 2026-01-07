"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import { RotateCcw, GraduationCap, MapPin, Calendar, ExternalLink } from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MapControls,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const MAP_CENTER_OFFSET = 0.015; // Roughly 1.5km north at mid latitudes

export const getCheatedCenter = (coordinates: [number, number]): [number, number] => {
  return [coordinates[0], coordinates[1] + MAP_CENTER_OFFSET];
};

export interface MapLocation {
  name: string;
  coordinates: [number, number];
  description: string;
  image?: string;
  category: string;
  period: string;
  link?: string;
}

export const defaultLocations: MapLocation[] = [
  {
    name: "McGill University",
    coordinates: [-73.57494517996066, 45.5039191858195],
    description: "Certificate in Management, 1 year exchange",
    image: "https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=400",
    category: "Education",
    period: "2024-2025",
    link: "https://www.mcgill.ca/",
  },
  {
    name: "Epitech Paris",
    coordinates: [2.3630611581062637, 48.815358261085045],
    description: "Bachelor's and Master's in Software Engineering",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400",
    category: "Education",
    period: "2021-2026",
    link: "https://www.epitech.eu/paris/",
  },
  {
    name: "Epitech Berlin",
    coordinates: [13.329241150011002, 52.508337785627134],
    description: "1 year exchange program",
    image: "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?auto=format&fit=crop&q=80&w=400",
    category: "Education",
    period: "2023-2024",
    link: "https://www.epitech.eu/berlin/",
  },
];

interface AboutMapProps {
  locations?: MapLocation[];
}

const ResetButton = () => {
  const { map } = useMap();
  return (
    <div className="absolute bottom-[110px] right-2 z-10 flex flex-col rounded-md border border-border bg-background shadow-sm overflow-hidden">
      <button
        onClick={() =>
          map?.flyTo({
            center: [-30, 40],
            zoom: 1.5,
            duration: 1500,
            essential: true,
          })
        }
        className="flex items-center justify-center size-8 hover:bg-accent dark:hover:bg-accent/40 transition-colors"
        title="Reset map view"
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
};

const AboutMap = forwardRef<MapRef, AboutMapProps>(
  ({ locations = defaultLocations }, ref) => {
    return (
      <motion.div
        className="mt-8 h-[600px] w-full md:w-2/3 mx-auto border border-border overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Map
          ref={ref}
          center={[-30, 40]}
          zoom={1.5}
          dragRotate={false}
          pitchWithRotate={false}
        >
          <MapControls position="bottom-right" showZoom={true} />
          <ResetButton />
          {locations.map((loc, idx) => (
            <MapMarker
              key={idx}
              longitude={loc.coordinates[0]}
              latitude={loc.coordinates[1]}
              onClick={() => {
                if (ref && "current" in ref && ref.current) {
                  ref.current.flyTo({
                    center: getCheatedCenter(loc.coordinates),
                    zoom: 12,
                    duration: 2000,
                    essential: true,
                  });
                }
              }}
            >
              <MarkerContent>
                <div className="h-5 w-5 rounded-full bg-primary border-2 border-background shadow-md hover:scale-110 transition-transform cursor-pointer" />
                <MarkerLabel position="bottom" className="text-[10px] font-mono mt-1 font-bold text-primary bg-background/80 px-1 py-0.5 rounded-none border border-primary/20">
                  {loc.name.split(" ")[0]}
                </MarkerLabel>
              </MarkerContent>
              <MarkerPopup className="p-0 w-72 overflow-hidden shadow-2xl border-none">
                {loc.image && (
                  <div className="relative h-24 w-full overflow-hidden">
                    <Image
                      fill
                      src={loc.image}
                      alt={loc.name}
                      className="object-cover transition-transform duration-500 hover:scale-110 grayscale hover:grayscale-0"
                    />
                  </div>
                )}
                <div className="p-3 space-y-2 bg-popover text-popover-foreground font-sans">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase tracking-[0.2em]">
                      <GraduationCap className="size-3" />
                      {loc.category}
                    </div>
                    <h3 className="font-bold text-sm leading-tight">
                      {loc.name}
                    </h3>
                  </div>
                  
                  <div className="space-y-1 text-[11px] text-muted-foreground font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3" />
                      <span>{loc.period}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="size-3 mt-0.5 shrink-0" />
                      <span className="leading-tight">{loc.description}</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    {loc.link && (
                      <Button 
                        size="sm" 
                        className="w-full h-7 text-[10px] font-mono"
                        onClick={() => window.open(loc.link, "_blank")}
                      >
                        Visit Website
                        <ExternalLink className="size-2.5 ml-1.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </MarkerPopup>
            </MapMarker>
          ))}
        </Map>
      </motion.div>
    );
  }
);

AboutMap.displayName = "AboutMap";

export default AboutMap;
