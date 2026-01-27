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
          <h2 className="text-lg font-semibold text-gray-900">Discovering Places</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 bg-white border border-gray-200 rounded-xl animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                  <div className="h-4 bg-gray-100 rounded w-2/3 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500 text-center">
          Finding amazing places for your trip...
        </p>
      </div>
    );
  }

  // Empty state
  if (locations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No locations yet
        </h3>
        <p className="text-gray-600 mb-6">
          Add some places to get started!
        </p>
        <button
          onClick={() => setIsAddingPlace(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white
            rounded-lg hover:bg-blue-600 transition-colors font-medium"
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
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
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
        <h2 className="text-lg font-semibold text-gray-900">
          Discovered Places
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {locations.length} {locations.length === 1 ? 'location' : 'locations'}
        </span>
      </div>

      {/* Location list - scrollable */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
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
      <div className="flex-shrink-0 pt-4 border-t border-gray-200 space-y-3">
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
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPlace(true)}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg
              text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors
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
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all min-h-[56px]
            ${
              locations.length === 0 || isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow'
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
        <p className="text-xs text-gray-500 text-center">
          Remove places you do not want, add your favorites, then generate your itinerary.
        </p>
      </div>
    </div>
  );
}
