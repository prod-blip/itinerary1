'use client';

import { useRef, useEffect, useMemo, useCallback } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from '@mapbox/polyline';
import { Location, Itinerary, DAY_COLORS } from '@/types';
import { useTripStore } from '@/stores/tripStore';
import MapDaySelector from './MapDaySelector';

/**
 * Decode a Google-encoded polyline string to array of [lng, lat] coordinates.
 * Note: Google returns [lat, lng], but GeoJSON needs [lng, lat].
 */
function decodePolyline(encoded: string): [number, number][] {
  const decoded = polyline.decode(encoded);
  return decoded.map(([lat, lng]) => [lng, lat] as [number, number]);
}

interface MapViewProps {
  locations: Location[];
  itinerary?: Itinerary | null;
  selectedDay?: number | null;
  highlightedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
}

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

// Numbered marker component for better visibility and touch targets
function NumberedMarker({
  number,
  color,
  isHighlighted,
  isUserAdded,
  locationName,
  onClick,
  onHover,
  onLeave,
}: {
  number: number | string;
  color: string;
  isHighlighted: boolean;
  isUserAdded: boolean;
  locationName: string;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      className={`relative cursor-pointer transition-transform duration-200 ${
        isHighlighted ? 'scale-125 z-10' : 'hover:scale-110'
      }`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      {/* Main marker */}
      <div
        className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-lg text-white text-sm font-semibold ${
          isHighlighted ? 'ring-3 ring-white ring-opacity-70' : ''
        }`}
        style={{ backgroundColor: color }}
      >
        {number}
        {/* User-added badge */}
        {isUserAdded && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </div>
      {/* Pin point */}
      <div
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0
          border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: color }}
      />
      {/* Tooltip on hover */}
      {isHighlighted && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg z-20 max-w-[200px] truncate">
          {locationName}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function MapView({
  locations,
  itinerary,
  selectedDay: selectedDayProp,
  highlightedLocationId: highlightedIdProp,
  onMarkerClick,
}: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const store = useTripStore();

  // Use props if provided, otherwise fall back to store
  const highlightedLocationId = highlightedIdProp ?? store.highlightedLocationId;
  const selectedDay = selectedDayProp ?? store.selectedDay;
  const setHighlightedLocation = store.setHighlightedLocation;

  // Calculate bounds to fit all locations
  const bounds = useMemo(() => {
    if (locations.length === 0) return null;

    let minLng = Infinity;
    let maxLng = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;

    locations.forEach((loc) => {
      minLng = Math.min(minLng, loc.lng);
      maxLng = Math.max(maxLng, loc.lng);
      minLat = Math.min(minLat, loc.lat);
      maxLat = Math.max(maxLat, loc.lat);
    });

    // Add padding
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;

    return {
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
    };
  }, [locations]);

  // Fit bounds when locations change
  useEffect(() => {
    if (bounds && mapRef.current) {
      mapRef.current.fitBounds(
        [
          [bounds.minLng, bounds.minLat],
          [bounds.maxLng, bounds.maxLat],
        ],
        { padding: 50, duration: 1000 }
      );
    }
  }, [bounds]);

  // Generate route lines for itinerary - separate solid (real) and dashed (estimated)
  const { solidRouteGeoJSON, dashedRouteGeoJSON } = useMemo(() => {
    if (!itinerary) return { solidRouteGeoJSON: null, dashedRouteGeoJSON: null };

    type RouteFeature = {
      type: 'Feature';
      properties: { dayNumber: number; color: string };
      geometry: { type: 'LineString'; coordinates: [number, number][] };
    };

    const solidFeatures: RouteFeature[] = [];
    const dashedFeatures: RouteFeature[] = [];

    itinerary.days
      .filter((day) => selectedDay === null || day.day_number === selectedDay)
      .forEach((day) => {
        const dayLocations = day.locations;
        const travelTimes = day.travel_times || [];

        // Create a lookup for location coordinates
        const locLookup: Record<string, { lng: number; lat: number }> = {};
        dayLocations.forEach((loc) => {
          locLookup[loc.id] = { lng: loc.lng, lat: loc.lat };
        });

        travelTimes.forEach((segment) => {
          const fromLoc = locLookup[segment.from_location_id];
          const toLoc = locLookup[segment.to_location_id];

          if (!fromLoc || !toLoc) return;

          if (segment.polyline) {
            // Real route with polyline - solid line
            solidFeatures.push({
              type: 'Feature' as const,
              properties: {
                dayNumber: day.day_number,
                color: getDayColor(day.day_number),
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: decodePolyline(segment.polyline),
              },
            });
          } else {
            // Estimated route without polyline - dashed line
            dashedFeatures.push({
              type: 'Feature' as const,
              properties: {
                dayNumber: day.day_number,
                color: getDayColor(day.day_number),
              },
              geometry: {
                type: 'LineString' as const,
                coordinates: [
                  [fromLoc.lng, fromLoc.lat],
                  [toLoc.lng, toLoc.lat],
                ],
              },
            });
          }
        });

        // If no travel times but we have locations, draw dashed lines between them
        if (travelTimes.length === 0 && dayLocations.length >= 2) {
          const coordinates: [number, number][] = dayLocations.map((loc) => [loc.lng, loc.lat]);
          dashedFeatures.push({
            type: 'Feature' as const,
            properties: {
              dayNumber: day.day_number,
              color: getDayColor(day.day_number),
            },
            geometry: {
              type: 'LineString' as const,
              coordinates,
            },
          });
        }
      });

    return {
      solidRouteGeoJSON: solidFeatures.length > 0 ? { type: 'FeatureCollection' as const, features: solidFeatures } : null,
      dashedRouteGeoJSON: dashedFeatures.length > 0 ? { type: 'FeatureCollection' as const, features: dashedFeatures } : null,
    };
  }, [itinerary, selectedDay]);

  // Handle marker click
  const handleMarkerClick = useCallback(
    (locationId: string) => {
      if (onMarkerClick) {
        onMarkerClick(locationId);
      }
      setHighlightedLocation(locationId);
    },
    [onMarkerClick, setHighlightedLocation]
  );

  // Get visible locations based on selected day
  const visibleLocations = useMemo(() => {
    if (!itinerary || selectedDay === null) return locations;

    const selectedDayPlan = itinerary.days.find((d) => d.day_number === selectedDay);
    return selectedDayPlan ? selectedDayPlan.locations : locations;
  }, [locations, itinerary, selectedDay]);

  // Get location metadata (day number, order) for markers
  const locationMetadata = useMemo(() => {
    const metadata: Record<string, { dayNumber: number; order: number }> = {};

    if (itinerary) {
      itinerary.days.forEach((day) => {
        day.locations.forEach((loc, index) => {
          metadata[loc.id] = { dayNumber: day.day_number, order: index + 1 };
        });
      });
    }

    return metadata;
  }, [itinerary]);

  // Default center (will be overridden by fitBounds)
  const defaultCenter = {
    longitude: locations[0]?.lng || 0,
    latitude: locations[0]?.lat || 0,
  };

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: defaultCenter.longitude,
          latitude: defaultCenter.latitude,
          zoom: locations.length === 0 ? 2 : 12,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      >
        <NavigationControl position="top-right" />

        {/* Solid route lines (real routes with polylines) */}
        {solidRouteGeoJSON && (
          <Source id="solid-routes" type="geojson" data={solidRouteGeoJSON}>
            {itinerary?.days.map((day) => (
              <Layer
                key={`solid-route-${day.day_number}`}
                id={`solid-route-${day.day_number}`}
                type="line"
                filter={['==', ['get', 'dayNumber'], day.day_number]}
                paint={{
                  'line-color': getDayColor(day.day_number),
                  'line-width': 4,
                  'line-opacity': selectedDay === null || selectedDay === day.day_number ? 0.8 : 0.2,
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
            ))}
          </Source>
        )}

        {/* Dashed route lines (estimated routes without polylines) */}
        {dashedRouteGeoJSON && (
          <Source id="dashed-routes" type="geojson" data={dashedRouteGeoJSON}>
            {itinerary?.days.map((day) => (
              <Layer
                key={`dashed-route-${day.day_number}`}
                id={`dashed-route-${day.day_number}`}
                type="line"
                filter={['==', ['get', 'dayNumber'], day.day_number]}
                paint={{
                  'line-color': getDayColor(day.day_number),
                  'line-width': 3,
                  'line-opacity': selectedDay === null || selectedDay === day.day_number ? 0.6 : 0.15,
                  'line-dasharray': [2, 2],
                }}
                layout={{
                  'line-join': 'round',
                  'line-cap': 'round',
                }}
              />
            ))}
          </Source>
        )}

        {/* Location markers */}
        {visibleLocations.map((location) => {
          const meta = locationMetadata[location.id];
          const isHighlighted = highlightedLocationId === location.id;
          const dayColor = meta ? getDayColor(meta.dayNumber) : '#3B82F6';

          return (
            <Marker
              key={location.id}
              longitude={location.lng}
              latitude={location.lat}
              anchor="bottom"
            >
              <NumberedMarker
                number={meta ? meta.order : '?'}
                color={dayColor}
                isHighlighted={isHighlighted}
                isUserAdded={location.user_added}
                locationName={location.name}
                onClick={() => handleMarkerClick(location.id)}
                onHover={() => setHighlightedLocation(location.id)}
                onLeave={() => setHighlightedLocation(null)}
              />
            </Marker>
          );
        })}
      </Map>

      {/* Day selector for multi-day itineraries */}
      {itinerary && itinerary.days.length > 1 && (
        <MapDaySelector
          days={itinerary.days}
          selectedDay={selectedDay}
          onSelectDay={store.setSelectedDay}
        />
      )}

      {/* Empty state overlay */}
      {locations.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 pointer-events-none">
          <div className="text-center px-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              Locations will appear here once discovered
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
