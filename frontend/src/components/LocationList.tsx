'use client';

import { useState } from 'react';
import { Location } from '@/types';
import { useTripStore } from '@/stores/tripStore';
import { useGenerateItinerary } from '@/services/api';
import LocationCard from './LocationCard';
import PlaceSearch from './PlaceSearch';

interface LocationListProps {
  locations: Location[];
  isLoading?: boolean;
  onGenerateItinerary?: () => void;
}

export default function LocationList({
  locations,
  isLoading = false,
  onGenerateItinerary,
}: LocationListProps) {
  const [isAddingPlace, setIsAddingPlace] = useState(false);
  const {
    threadId,
    removeLocation,
    addLocation,
    removedIds,
    highlightedLocationId,
    setHighlightedLocation,
    setItinerary,
    setPhase,
  } = useTripStore();

  const { mutate: generateItinerary, isPending: isGenerating } = useGenerateItinerary();

  // Calculate the diff for generating itinerary
  const handleGenerateItinerary = () => {
    if (!threadId) return;

    if (onGenerateItinerary) {
      onGenerateItinerary();
      return;
    }

    // Build the diff - user added locations are already full Location objects
    const addedLocations = locations.filter((loc) => loc.user_added);

    // Pass removed IDs from the store's tracking
    generateItinerary(
      {
        threadId,
        edits: {
          removed_ids: removedIds,
          added_locations: addedLocations,
        },
      },
      {
        onSuccess: (data) => {
          setItinerary(data.itinerary);
          setPhase('complete');
        },
      }
    );
  };

  const handleAddPlace = (place: {
    name: string;
    lat: number;
    lng: number;
    place_id: string;
  }) => {
    // Create a full Location object
    const newLocation: Location = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      why_this_fits_you: 'Added by you',
      place_id: place.place_id,
      user_added: true,
      user_note: '',
    };
    addLocation(newLocation);
    setIsAddingPlace(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Discovering Places</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 skeleton rounded-full" />
                <div className="flex-1">
                  <div className="h-5 skeleton rounded w-3/4 mb-2" />
                  <div className="h-4 skeleton rounded w-full" />
                  <div className="h-4 skeleton rounded w-2/3 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          Finding amazing places for your trip...
        </p>
      </div>
    );
  }

  // Empty state
  if (locations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-neutral-400 dark:text-neutral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No locations yet
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Add some places to get started!
        </p>
        <button
          onClick={() => setIsAddingPlace(true)}
          className="btn-primary"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add a Place
        </button>

        {isAddingPlace && (
          <div className="mt-4">
            <PlaceSearch
              onSelect={handleAddPlace}
              placeholder="Search for a place to add..."
              autoFocus
            />
            <button
              onClick={() => setIsAddingPlace(false)}
              className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Discovered Places
        </h2>
        <span className="badge-neutral">
          {locations.length} {locations.length === 1 ? 'location' : 'locations'}
        </span>
      </div>

      {/* Location list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-thin">
        {locations.map((location, index) => (
          <LocationCard
            key={location.id}
            location={location}
            index={index + 1}
            isHighlighted={highlightedLocationId === location.id}
            onRemove={() => removeLocation(location.id)}
            onClick={() => setHighlightedLocation(location.id)}
            onMouseEnter={() => setHighlightedLocation(location.id)}
            onMouseLeave={() => setHighlightedLocation(null)}
          />
        ))}
      </div>

      {/* Actions footer */}
      <div className="flex-shrink-0 pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
        {/* Add a place */}
        {isAddingPlace ? (
          <div className="space-y-2">
            <PlaceSearch
              onSelect={handleAddPlace}
              placeholder="Search for a place to add..."
              autoFocus
            />
            <button
              onClick={() => setIsAddingPlace(false)}
              className="w-full py-2 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPlace(true)}
            className="w-full py-3 px-4 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg
              text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300
              transition-colors duration-200
              flex items-center justify-center gap-2 min-h-[48px]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add a Place
          </button>
        )}

        {/* Generate itinerary button */}
        <button
          onClick={handleGenerateItinerary}
          disabled={locations.length === 0 || isGenerating}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 min-h-[56px]
            ${
              locations.length === 0 || isGenerating
                ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm hover:shadow-primary'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating Itinerary...
            </span>
          ) : (
            'Generate Itinerary'
          )}
        </button>

        {/* Helper text */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Remove places you do not want, add your favorites, then generate your itinerary.
        </p>
      </div>
    </div>
  );
}
