import { create } from 'zustand';
import { Location, TripParameters, Itinerary, TripPhase } from '@/types';

interface TripStore {
  // State
  threadId: string | null;
  tripParams: TripParameters | null;
  locations: Location[];
  originalLocations: Location[]; // Original locations from LLM (for tracking removals)
  removedIds: string[]; // IDs of locations removed by user
  itinerary: Itinerary | null;
  phase: TripPhase;
  selectedDay: number | null; // null means "all days"
  highlightedLocationId: string | null;

  // Actions
  setThreadId: (id: string) => void;
  setTripParams: (params: TripParameters) => void;
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  getRemovedIds: () => string[];
  setItinerary: (itinerary: Itinerary) => void;
  setPhase: (phase: TripPhase) => void;
  setSelectedDay: (day: number | null) => void;
  setHighlightedLocation: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  threadId: null,
  tripParams: null,
  locations: [] as Location[],
  originalLocations: [] as Location[],
  removedIds: [] as string[],
  itinerary: null,
  phase: 'discovery' as TripPhase,
  selectedDay: null,
  highlightedLocationId: null,
};

export const useTripStore = create<TripStore>((set) => ({
  // Initial state
  ...initialState,

  // Actions
  setThreadId: (id: string) => set({ threadId: id }),

  setTripParams: (params: TripParameters) => set({ tripParams: params }),

  setLocations: (locations: Location[]) =>
    set((state) => ({
      locations,
      // Only set originalLocations if it's empty (first time setting)
      originalLocations: state.originalLocations.length === 0 ? locations : state.originalLocations,
      // Reset removedIds when setting new locations initially
      removedIds: state.originalLocations.length === 0 ? [] : state.removedIds,
    })),

  addLocation: (location: Location) =>
    set((state) => ({
      locations: [...state.locations, location],
    })),

  removeLocation: (id: string) =>
    set((state) => {
      // Only track as removed if it was an original location (not user-added)
      const isOriginalLocation = state.originalLocations.some((loc) => loc.id === id);
      return {
        locations: state.locations.filter((loc) => loc.id !== id),
        removedIds: isOriginalLocation && !state.removedIds.includes(id)
          ? [...state.removedIds, id]
          : state.removedIds,
      };
    }),

  getRemovedIds: () => {
    // This is a getter, but Zustand prefers using selectors outside
    // We'll access removedIds directly from state instead
    return [];
  },

  setItinerary: (itinerary: Itinerary) => set({ itinerary }),

  setPhase: (phase: TripPhase) => set({ phase }),

  setSelectedDay: (day: number | null) => set({ selectedDay: day }),

  setHighlightedLocation: (id: string | null) =>
    set({ highlightedLocationId: id }),

  reset: () => set(initialState),
}));
