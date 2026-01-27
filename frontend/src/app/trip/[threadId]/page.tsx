'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTripStore } from '@/stores/tripStore';
import { useTripState, useGenerateItinerary } from '@/services/api';
import LocationList from '@/components/LocationList';
import ItineraryView from '@/components/ItineraryView';
import MapView from '@/components/MapView';
import GenerationProgress from '@/components/GenerationProgress';

export default function TripPage() {
  const params = useParams();
  const threadId = params.threadId as string;

  const {
    setThreadId,
    setLocations,
    setItinerary,
    setPhase,
    setTripParams,
    phase,
    locations,
    itinerary,
  } = useTripStore();

  const { data: tripState, isLoading, error } = useTripState(threadId);
  const generateItineraryMutation = useGenerateItinerary();
  const [generationStep, setGenerationStep] = useState<'organizing' | 'routing' | 'finishing'>('organizing');
  const generationStartTime = useRef<number | null>(null);

  // Sync trip state from API to store
  useEffect(() => {
    if (tripState) {
      setThreadId(tripState.thread_id);
      setLocations(tripState.locations);
      setPhase(tripState.phase);
      if (tripState.trip_params) {
        setTripParams(tripState.trip_params);
      }
      if (tripState.itinerary) {
        setItinerary(tripState.itinerary);
      }
    }
  }, [tripState, setThreadId, setLocations, setPhase, setTripParams, setItinerary]);

  const handleGenerateItinerary = async () => {
    setPhase('generating');
    setGenerationStep('organizing');
    generationStartTime.current = Date.now();

    // Progress simulation based on elapsed time
    const progressInterval = setInterval(() => {
      if (!generationStartTime.current) return;
      const elapsed = Date.now() - generationStartTime.current;
      if (elapsed > 5000) {
        setGenerationStep('finishing');
      } else if (elapsed > 2000) {
        setGenerationStep('routing');
      }
    }, 500);

    try {
      const result = await generateItineraryMutation.mutateAsync({
        threadId,
        edits: {
          removed_ids: [],
          added_locations: [],
        },
      });
      setItinerary(result.itinerary);
      setPhase('complete');

      // Show warning if some routes failed
      if (result.route_warnings && result.route_warnings.length > 0) {
        toast.warning('Some routes could not be calculated', {
          description: 'Travel times shown are estimates',
        });
      }
    } catch (err) {
      setPhase('editing');
      toast.error('Failed to generate itinerary', {
        description: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      clearInterval(progressInterval);
      generationStartTime.current = null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {error instanceof Error
              ? error.message
              : 'Failed to load trip data'}
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start a New Trip
          </a>
        </div>
      </div>
    );
  }

  const showItinerary = phase === 'complete' && itinerary;
  const showGenerateButton = phase === 'discovery' || phase === 'editing';

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            {tripState?.trip_params?.destination || 'Your Trip'}
          </h1>
          <span className="text-sm text-gray-500">
            {tripState?.trip_params?.num_days} days -{' '}
            {tripState?.trip_params?.travel_style} pace
          </span>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
        {/* Left panel - Location list or Itinerary (below map on mobile) */}
        <div className="flex-1 lg:flex-none lg:w-2/5 overflow-y-auto bg-white lg:border-r border-gray-200">
          <div className="p-4">
            {showItinerary ? (
              <ItineraryView itinerary={itinerary} />
            ) : (
              <LocationList locations={locations} />
            )}
          </div>
        </div>

        {/* Right panel - Map (on top on mobile, takes 50vh) */}
        <div className="h-[50vh] lg:h-auto lg:flex-1 relative flex-shrink-0">
          <MapView
            locations={locations}
            itinerary={showItinerary ? itinerary : undefined}
          />
        </div>
      </div>

      {/* Bottom action bar */}
      {showGenerateButton && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {locations.length} locations selected
            </p>
            <button
              onClick={handleGenerateItinerary}
              disabled={
                generateItineraryMutation.isPending || locations.length === 0
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {generateItineraryMutation.isPending
                ? 'Generating...'
                : 'Generate Itinerary'}
            </button>
          </div>
        </div>
      )}

      {/* Generating overlay with progress */}
      {phase === 'generating' && <GenerationProgress currentStep={generationStep} />}
    </div>
  );
}
