"use client";

import { motion } from "framer-motion";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapControls,
} from "@/components/ui/map";

const locations = [
  {
    name: "Montreal, Canada",
    coordinates: [-73.5673, 45.5017] as [number, number],
    description: "Master's at Epitech & McGill University",
  },
  {
    name: "Paris, France",
    coordinates: [2.3522, 48.8566] as [number, number],
    description: "Bachelor's at Epitech",
  },
  {
    name: "Berlin, Germany",
    coordinates: [13.405, 52.52] as [number, number],
    description: "International Track at Epitech Berlin",
  },
];

export default function AboutMap() {
  return (
    <motion.div
      className="mt-8 h-[300px] w-full md:w-2/3 mx-auto border border-border overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Map
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
}
