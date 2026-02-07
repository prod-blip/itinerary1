'use client';

import { Itinerary, DayPlan, DAY_COLORS } from '@/types';
import { useTripStore } from '@/stores/tripStore';
import PlaceImage from './PlaceImage';

interface ItineraryViewProps {
  itinerary: Itinerary;
}

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

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'shadow-lg'
          : 'hover:shadow-card-hover'
      }`}
      style={isSelected ? { boxShadow: `0 8px 25px -5px ${color}30` } : undefined}
      onClick={() => setSelectedDay(isSelected ? null : day.day_number)}
    >
      {/* Day header */}
      <div
        className="px-4 py-3 text-white"
        style={{ backgroundColor: color }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Day {day.day_number}</span>
            {day.area_label && (
              <span className="text-sm opacity-80">- {day.area_label}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {day.route_optimized && (
              <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                Route optimized
              </span>
            )}
            <span className="text-sm opacity-90">{day.locations.length} places</span>
          </div>
        </div>
      </div>

      {/* Locations */}
      <div
        className={`p-3 transition-colors duration-200 ${isSelected ? '' : 'bg-white/50 dark:bg-neutral-800/50'}`}
        style={isSelected ? { backgroundColor: `${color}08` } : undefined}
      >
        <div className="space-y-2">
          {day.locations.map((location, index) => {
            const travelTime = day.travel_times.find(
              (t) => t.to_location_id === location.id
            );

            return (
              <div
                key={location.id}
                className="opacity-0 animate-stagger-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Travel time indicator */}
                {index > 0 && travelTime && (
                  <div className="flex items-center gap-2 py-1 px-2">
                    <div
                      className="w-0.5 h-4 rounded-full"
                      style={{
                        backgroundColor: color,
                        opacity: travelTime.polyline ? 0.4 : 0.2,
                      }}
                    />
                    <span className={`text-xs ${travelTime.polyline ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-500 italic'}`}>
                      {!travelTime.polyline && '~'}
                      {formatDuration(travelTime.duration_minutes)} ({travelTime.distance_km.toFixed(1)} km)
                      {!travelTime.polyline && ' est.'}
                    </span>
                  </div>
                )}

                {/* Location with thumbnail */}
                <div
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-neutral-700/80 backdrop-blur-sm hover:shadow-sm transition-all duration-150"
                  onMouseEnter={() => setHighlightedLocation(location.id)}
                  onMouseLeave={() => setHighlightedLocation(null)}
                >
                  {/* Mini thumbnail */}
                  <PlaceImage
                    photoReference={location.photo_reference}
                    placeName={location.name}
                    size="sm"
                    className="flex-shrink-0"
                  />

                  {/* Number badge */}
                  <div
                    className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-medium shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                      {location.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
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
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Your Itinerary</h2>
        <button
          onClick={() => setSelectedDay(null)}
          className={`text-sm px-3 py-1.5 rounded-full transition-all duration-200 ${
            selectedDay === null
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
          }`}
        >
          All Days
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{itinerary.days.length}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Days</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{itinerary.total_locations}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Places</div>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {itinerary.days.reduce((sum, day) =>
              sum + day.travel_times.reduce((tSum, t) => tSum + t.duration_minutes, 0), 0
            )}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Min Travel</div>
        </div>
      </div>

      {/* Validation notes */}
      {itinerary.validation_notes.length > 0 && (
        <div className="glass-card bg-warning-50/80 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800 rounded-xl p-3 mb-4">
          <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200 mb-1">Notes</h4>
          <ul className="text-xs text-warning-700 dark:text-warning-300 space-y-1">
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
