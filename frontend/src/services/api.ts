import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  TripParameters,
  Location,
  Itinerary,
  TripState,
  LocationEditDiff,
  PlacePrediction,
  StartTripResponse,
  GenerateItineraryResponse,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * API Functions
 */

async function startTrip(
  tripParams: TripParameters
): Promise<StartTripResponse> {
  const response = await fetch(`${API_URL}/trip/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trip_params: tripParams }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to start trip');
  }

  return response.json();
}

async function generateItinerary(
  threadId: string,
  edits?: LocationEditDiff
): Promise<GenerateItineraryResponse> {
  const response = await fetch(`${API_URL}/trip/${threadId}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ edits: edits || { removed_ids: [], added_locations: [] } }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to generate itinerary');
  }

  return response.json();
}

async function getTripState(threadId: string): Promise<TripState> {
  const response = await fetch(`${API_URL}/trip/${threadId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to get trip state');
  }

  return response.json();
}

async function placesAutocomplete(input: string): Promise<PlacePrediction[]> {
  if (!input || input.length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/places/autocomplete?input=${encodeURIComponent(input)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch place suggestions');
  }

  const data = await response.json();
  return data.predictions || [];
}

async function getPlaceDetails(
  placeId: string
): Promise<Omit<Location, 'id' | 'why_this_fits_you' | 'user_added'>> {
  const response = await fetch(
    `${API_URL}/places/details?place_id=${encodeURIComponent(placeId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'Failed to fetch place details');
  }

  return response.json();
}

/**
 * React Query Hooks
 */

export function useStartTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startTrip,
    onSuccess: (data) => {
      // Invalidate any existing trip queries
      queryClient.invalidateQueries({ queryKey: ['tripState'] });
      return data;
    },
  });
}

export function useGenerateItinerary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      threadId,
      edits,
    }: {
      threadId: string;
      edits?: LocationEditDiff;
    }) => generateItinerary(threadId, edits),
    onSuccess: (data, variables) => {
      // Invalidate the trip state query to refetch
      queryClient.invalidateQueries({
        queryKey: ['tripState', variables.threadId],
      });
      return data;
    },
  });
}

export function useTripState(threadId: string | null) {
  return useQuery({
    queryKey: ['tripState', threadId],
    queryFn: () => getTripState(threadId!),
    enabled: !!threadId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePlacesAutocomplete(input: string) {
  return useQuery({
    queryKey: ['placesAutocomplete', input],
    queryFn: () => placesAutocomplete(input),
    enabled: input.length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

export function usePlaceDetails(placeId: string | null) {
  return useQuery({
    queryKey: ['placeDetails', placeId],
    queryFn: () => getPlaceDetails(placeId!),
    enabled: !!placeId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
}
