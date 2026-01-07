"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
  type MapRef,
} from "@/components/ui/map";

export interface MapLocation {
  name: string;
  coordinates: [number, number];
  description: string;
}

export const defaultLocations: MapLocation[] = [
  {
    name: "McGill University",
    coordinates: [-73.57494517996066, 45.5039191858195],
    description: "Certificate in Management, 1 year exchange (2024-2025)",
  },
  {
    name: "Epitech Paris",
    coordinates: [2.3630611581062637, 48.815358261085045],
    description: "Bachelor's and Master's in Software Engineering",
  },
  {
    name: "Epitech Berlin",
    coordinates: [13.329241150011002, 52.508337785627134],
    description: "1 year exchange (2023-2024)",
  },
];

interface AboutMapProps {
  locations?: MapLocation[];
}

const AboutMap = forwardRef<MapRef, AboutMapProps>(({ locations = defaultLocations }, ref) => {
  return (
    <motion.div
      className="mt-8 h-[400px] w-full md:w-2/3 mx-auto border border-border overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Map
        ref={ref}
        center={[-30, 40]}
        zoom={1.8}
        dragRotate={false}
        pitchWithRotate={false}
      >
        <MapControls position="bottom-right" showZoom={true} />
        {locations.map((loc, idx) => (
          <MapMarker
            key={idx}
            longitude={loc.coordinates[0]}
            latitude={loc.coordinates[1]}
          >
            <MarkerContent>
              <div className="h-5 w-5 rounded-full bg-primary border-2 border-background shadow-md" />
            </MarkerContent>
            <MarkerTooltip className="bg-popover text-popover-foreground border border-border px-3 py-1.5 rounded-none font-mono text-xs">
              <div className="font-bold">{loc.name}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {loc.description}
              </div>
            </MarkerTooltip>
          </MapMarker>
        ))}
      </Map>
    </motion.div>
  );
});

AboutMap.displayName = "AboutMap";

export default AboutMap;
