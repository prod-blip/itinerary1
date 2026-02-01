'use client';

import { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';

interface MapBackgroundProps {
  center?: [number, number];
  zoom?: number;
}

export default function MapBackground({
  center = [73.8567, 15.2993], // Default to Goa
  zoom = 10,
}: MapBackgroundProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center,
      zoom,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Map container */}
      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'blur(3px)',
          transform: 'scale(1.1)', // Prevent blur edges showing
        }}
      />
      {/* Light mode overlay - more transparent to show map */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-50/70 via-neutral-50/60 to-neutral-50/75 dark:hidden" />
      {/* Dark mode overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/75 via-neutral-950/65 to-neutral-950/80 hidden dark:block" />
    </div>
  );
}
