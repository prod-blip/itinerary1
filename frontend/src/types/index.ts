/**
 * TypeScript types mirroring backend schemas
 */

export type TravelStyle = 'relaxed' | 'balanced' | 'packed';

export interface TripParameters {
  destination: string;
  num_days: number;
  travel_style: TravelStyle;
  interests: string[];
  constraints: string[];
  notes?: string;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  why_this_fits_you: string;
  place_id?: string;
  user_added: boolean;
  user_note?: string;
}

export interface TravelSegment {
  from_location_id: string;
  to_location_id: string;
  duration_minutes: number;
  distance_km: number;
  polyline?: string;
}

export interface DayPlan {
  day_number: number;
  locations: Location[];
  travel_times: TravelSegment[];
  route_optimized?: boolean;
  area_label?: string;
}

export interface Itinerary {
  days: DayPlan[];
  total_locations: number;
  validation_notes: string[];
}

export interface LocationEditDiff {
  removed_ids: string[];
  added_locations: Location[];
}

export type TripPhase = 'discovery' | 'editing' | 'generating' | 'complete';

export interface TripState {
  thread_id: string;
  phase: TripPhase;
  trip_params?: TripParameters;
  locations: Location[];
  itinerary?: Itinerary;
}

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface StartTripResponse {
  thread_id: string;
  locations: Location[];
}

export interface GenerateItineraryResponse {
  itinerary: Itinerary;
  final_locations: Location[];
  validation_passed: boolean;
  validation_errors: string[];
  route_warnings?: string[];
}

// Interest options for intake form
export const INTEREST_OPTIONS = [
  'Culture & History',
  'Food & Dining',
  'Nature & Outdoors',
  'Shopping',
  'Nightlife',
  'Art & Museums',
  'Adventure',
  'Relaxation',
] as const;

export type Interest = (typeof INTEREST_OPTIONS)[number];

// Constraint options for intake form
export const CONSTRAINT_OPTIONS = [
  'Limited mobility',
  'Budget-conscious',
  'Traveling with kids',
  'Vegetarian/Vegan friendly',
] as const;

export type Constraint = (typeof CONSTRAINT_OPTIONS)[number];

// Travel style descriptions
export const TRAVEL_STYLE_OPTIONS: {
  value: TravelStyle;
  label: string;
  description: string;
}[] = [
  {
    value: 'relaxed',
    label: 'Relaxed',
    description: 'Fewer stops, more time at each place. Perfect for leisurely exploration.',
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'A good mix of activities and downtime. See the highlights without rushing.',
  },
  {
    value: 'packed',
    label: 'Packed',
    description: 'Maximize your time. Great for short trips or ambitious travelers.',
  },
];

// Day colors for map visualization
export const DAY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // violet
  '#E11D48', // rose
  '#0EA5E9', // sky
];
