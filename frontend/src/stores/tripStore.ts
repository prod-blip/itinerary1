import { create } from 'zustand';
import { Location, TripParameters, Itinerary, TripPhase } from '@/types';

interface TripStore {
  // State
  threadId: string | null;
  tripParams: TripParameters | null;
  locations: Location[];
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
  setItinerary: (itinerary: Itinerary) => void;
  setPhase: (phase: TripPhase) => void;
  setSelectedDay: (day: number | null) => void;
  setHighlightedLocation: (id: string | null) => void;
  reset: () => void;
}

const initialState = {
  threadId: null,
  tripParams: null,
  locations: [],
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

  setLocations: (locations: Location[]) => set({ locations }),

  addLocation: (location: Location) =>
    set((state) => ({
      locations: [...state.locations, location],
    })),

  removeLocation: (id: string) =>
    set((state) => ({
      locations: state.locations.filter((loc) => loc.id !== id),
    })),

  setItinerary: (itinerary: Itinerary) => set({ itinerary }),

  setPhase: (phase: TripPhase) => set({ phase }),

  setSelectedDay: (day: number | null) => set({ selectedDay: day }),

  setHighlightedLocation: (id: string | null) =>
    set({ highlightedLocationId: id }),

  reset: () => set(initialState),
}));
