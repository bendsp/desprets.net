"use client";

import { motion } from "framer-motion";
import {
  forwardRef,
  useState,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import {
  RotateCcw,
  GraduationCap,
  MapPin,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapPopup,
  MapControls,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LocationCard } from "./location-card";

export const MAP_CENTER_OFFSET = 0.025; // Adjusted for taller 4:3 image cards

export const getCheatedCenter = (
  coordinates: [number, number]
): [number, number] => {
  return [coordinates[0], coordinates[1] + MAP_CENTER_OFFSET];
};

export interface AboutMapRef {
  map: MapRef | null;
  openLocation: (locationId: string) => void;
}

export interface MapLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  description: string;
  images?: string[];
  category: string;
  period: string;
  link?: string;
}

export const defaultLocations: MapLocation[] = [
  {
    id: "mcgill",
    name: "McGill University",
    coordinates: [-73.57494517996066, 45.5039191858195],
    description: "Certificate in Management, 1 year exchange",
    images: [
      "/mcgill1.webp",
      "/mcgill2.webp",
      "/mcgill3.webp",
      "/mcgill4.webp",
      "/mcgill5.webp",
    ],
    category: "Education",
    period: "2024-2025",
    link: "https://www.mcgill.ca/",
  },
  {
    id: "epitech-paris",
    name: "Epitech Paris",
    coordinates: [2.3630611581062637, 48.815358261085045],
    description: "Bachelor's and Master's in Software Engineering",
    images: [
      "/epitech_paris1.webp",
      "/epitech_paris2.webp",
      "/epitech_paris3.webp",
      "/epitech_paris4.webp",
      "/epitech_paris5.webp",
    ],
    category: "Education",
    period: "2021-2026",
    link: "https://www.epitech.eu/paris/",
  },
  {
    id: "epitech-berlin",
    name: "Epitech Berlin",
    coordinates: [13.329241150011002, 52.508337785627134],
    description: "1 year exchange program",
    images: [
      "https://images.unsplash.com/photo-1585202900225-6d3ac20a6962?auto=format&fit=crop&q=80&w=400",
    ],
    category: "Education",
    period: "2023-2024",
    link: "https://www.epitech.eu/berlin/",
  },
];

interface AboutMapProps {
  locations?: MapLocation[];
}

const ResetButton = ({ onReset }: { onReset?: () => void }) => {
  const { map } = useMap();
  return (
    <div className="absolute bottom-[110px] right-2 z-10 flex flex-col rounded-none border border-primary bg-background shadow-sm overflow-hidden">
      <button
        onClick={() => {
          onReset?.();
          map?.flyTo({
            center: [-30, 45],
            zoom: 1.5,
            duration: 1500,
            essential: true,
          });
        }}
        className="flex items-center justify-center size-8 text-primary hover:bg-primary/10 transition-colors"
        title="Reset map view"
      >
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
};

const AboutMap = forwardRef<AboutMapRef, AboutMapProps>(
  ({ locations = defaultLocations }, ref) => {
    const [selectedLocation, setSelectedLocation] =
      useState<MapLocation | null>(null);
    const [mounted, setMounted] = useState(false);
    const mapInstanceRef = useRef<MapRef | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        map: mapInstanceRef.current,
        openLocation: (locationId: string) => {
          const location = locations.find((loc) => loc.id === locationId);
          if (location) {
            setSelectedLocation(location);
            mapInstanceRef.current?.flyTo({
              center: getCheatedCenter(location.coordinates),
              zoom: 12,
              duration: 2000,
              essential: true,
            });
          }
        },
      }),
      [locations]
    );

    return (
      <motion.div
        className="mt-8 h-[600px] w-full mx-auto border border-border overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {!mounted ? (
          <div className="w-full h-full animate-pulse bg-muted flex items-center justify-center">
            <span className="text-muted-foreground font-mono">
              Loading Map...
            </span>
          </div>
        ) : (
          <Map
            ref={mapInstanceRef}
            center={[-30, 45]}
            zoom={1.5}
            dragRotate={false}
            pitchWithRotate={false}
            onClick={() => setSelectedLocation(null)}
          >
            <MapControls position="bottom-right" showZoom={true} />
            <ResetButton onReset={() => setSelectedLocation(null)} />

            {locations.map((loc, idx) => (
              <MapMarker
                key={idx}
                longitude={loc.coordinates[0]}
                latitude={loc.coordinates[1]}
                onClick={(e) => {
                  // Prevent map click from closing this immediately
                  e.stopPropagation();
                  setSelectedLocation(loc);
                  mapInstanceRef.current?.flyTo({
                    center: getCheatedCenter(loc.coordinates),
                    zoom: 12,
                    duration: 2000,
                    essential: true,
                  });
                }}
              >
                <MarkerContent className="group">
                  <div className="h-5 w-5 rounded-full bg-primary border-2 border-background shadow-md hover:scale-110 transition-transform cursor-pointer" />
                  <MarkerLabel
                    position="bottom"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono mt-1 font-bold text-primary bg-background/80 px-1 py-0.5 rounded-none border border-primary/20 pointer-events-none"
                  >
                    {loc.name}
                  </MarkerLabel>
                </MarkerContent>
              </MapMarker>
            ))}

            {selectedLocation && (
              <MapPopup
                longitude={selectedLocation.coordinates[0]}
                latitude={selectedLocation.coordinates[1]}
                onClose={() => setSelectedLocation(null)}
                className="p-0 shadow-2xl border-none"
                anchor="bottom"
                offset={20}
              >
                <LocationCard
                  key={selectedLocation.name}
                  location={selectedLocation}
                />
              </MapPopup>
            )}
          </Map>
        )}
      </motion.div>
    );
  }
);

AboutMap.displayName = "AboutMap";

export default AboutMap;
