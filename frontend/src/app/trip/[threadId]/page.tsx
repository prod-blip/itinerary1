'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTripStore } from '@/stores/tripStore';
import { useTripState, useGenerateItinerary } from '@/services/api';
import LocationList from '@/components/LocationList';
import ItineraryView from '@/components/ItineraryView';
import MapView from '@/components/MapView';
import GenerationProgress from '@/components/GenerationProgress';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TripPage() {
  const params = useParams();
  const router = useRouter();
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
    reset,
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-error-100 dark:bg-error-900/30 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {error instanceof Error
              ? error.message
              : 'Failed to load trip data'}
          </p>
          <a
            href="/"
            className="btn-primary inline-flex"
          >
            Start a New Trip
          </a>
        </div>
      </div>
    );
  }

  const showItinerary = phase === 'complete' && itinerary;
  const showGenerateButton = phase === 'discovery' || phase === 'editing';

  const handlePlanNewTrip = () => {
    reset();
    router.push('/');
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {tripState?.trip_params?.destination || 'Your Trip'}
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              {tripState?.trip_params?.num_days} days -{' '}
              {tripState?.trip_params?.travel_style} pace
            </span>
            <ThemeToggle />
            {showItinerary && (
              <button
                onClick={handlePlanNewTrip}
                className="btn-secondary text-sm py-1.5"
              >
                Plan New Trip
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
        {/* Left panel - Location list or Itinerary (below map on mobile) */}
        <div className="flex-1 lg:flex-none lg:w-2/5 overflow-y-auto bg-white dark:bg-neutral-800 lg:border-r border-neutral-200 dark:border-neutral-700">
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
        <div className="bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {locations.length} locations selected
            </p>
            <button
              onClick={handleGenerateItinerary}
              disabled={
                generateItineraryMutation.isPending || locations.length === 0
              }
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  generateItineraryMutation.isPending || locations.length === 0
                    ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
                    : 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 shadow-sm hover:shadow-primary'
                }`}
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
