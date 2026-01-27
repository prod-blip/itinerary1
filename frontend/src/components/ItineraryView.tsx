'use client';

import { Itinerary, DayPlan } from '@/types';
import { useTripStore } from '@/stores/tripStore';

interface ItineraryViewProps {
  itinerary: Itinerary;
}

const DAY_COLORS = [
  'blue',
  'green',
  'purple',
  'orange',
  'pink',
  'teal',
  'indigo',
  'red',
];

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}m`;
}

function DayCard({ day }: { day: DayPlan }) {
  const { selectedDay, setSelectedDay, setHighlightedLocation } = useTripStore();
  const color = getDayColor(day.day_number);
  const isSelected = selectedDay === day.day_number;

  const colorClasses: Record<string, { bg: string; border: string; text: string; light: string }> = {
    blue: { bg: 'bg-blue-600', border: 'border-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
    green: { bg: 'bg-green-600', border: 'border-green-500', text: 'text-green-600', light: 'bg-green-50' },
    purple: { bg: 'bg-purple-600', border: 'border-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
    orange: { bg: 'bg-orange-600', border: 'border-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
    pink: { bg: 'bg-pink-600', border: 'border-pink-500', text: 'text-pink-600', light: 'bg-pink-50' },
    teal: { bg: 'bg-teal-600', border: 'border-teal-500', text: 'text-teal-600', light: 'bg-teal-50' },
    indigo: { bg: 'bg-indigo-600', border: 'border-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
    red: { bg: 'bg-red-600', border: 'border-red-500', text: 'text-red-600', light: 'bg-red-50' },
  };

  const colors = colorClasses[color];

  return (
    <div
      className={`rounded-lg border-2 overflow-hidden transition-all cursor-pointer ${
        isSelected ? `${colors.border} shadow-md` : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedDay(isSelected ? null : day.day_number)}
    >
      {/* Day header */}
      <div className={`px-4 py-2 ${colors.bg} text-white flex items-center justify-between`}>
        <span className="font-semibold">Day {day.day_number}</span>
        <span className="text-sm opacity-90">{day.locations.length} places</span>
      </div>

      {/* Locations */}
      <div className={`p-3 ${isSelected ? colors.light : 'bg-white'}`}>
        <div className="space-y-2">
          {day.locations.map((location, index) => {
            const travelTime = day.travel_times.find(
              (t) => t.to_location_id === location.id
            );

            return (
              <div key={location.id}>
                {/* Travel time indicator */}
                {index > 0 && travelTime && (
                  <div className="flex items-center gap-2 py-1 px-2">
                    <div className={`w-0.5 h-4 ${colors.bg} opacity-30`}></div>
                    <span className="text-xs text-gray-500">
                      {formatDuration(travelTime.duration_minutes)} ({travelTime.distance_km.toFixed(1)} km)
                    </span>
                  </div>
                )}

                {/* Location */}
                <div
                  className="flex items-start gap-3 p-2 rounded hover:bg-white hover:shadow-sm transition-all"
                  onMouseEnter={() => setHighlightedLocation(location.id)}
                  onMouseLeave={() => setHighlightedLocation(null)}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.bg} text-white text-xs flex items-center justify-center font-medium`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">
                      {location.name}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                      {location.why_this_fits_you}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryView({ itinerary }: ItineraryViewProps) {
  const { selectedDay, setSelectedDay } = useTripStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Itinerary</h2>
        <button
          onClick={() => setSelectedDay(null)}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            selectedDay === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All Days
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{itinerary.days.length}</div>
          <div className="text-xs text-gray-500">Days</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{itinerary.total_locations}</div>
          <div className="text-xs text-gray-500">Places</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {itinerary.days.reduce((sum, day) =>
              sum + day.travel_times.reduce((tSum, t) => tSum + t.duration_minutes, 0), 0
            )}
          </div>
          <div className="text-xs text-gray-500">Min Travel</div>
        </div>
      </div>

      {/* Validation notes */}
      {itinerary.validation_notes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            {itinerary.validation_notes.map((note, index) => (
              <li key={index}>- {note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Day cards */}
      <div className="space-y-3">
        {itinerary.days.map((day) => (
          <DayCard key={day.day_number} day={day} />
        ))}
      </div>
    </div>
  );
}
