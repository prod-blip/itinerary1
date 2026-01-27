'use client';

import { DayPlan, DAY_COLORS } from '@/types';

interface MapDaySelectorProps {
  days: DayPlan[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

export default function MapDaySelector({
  days,
  selectedDay,
  onSelectDay,
}: MapDaySelectorProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1.5 bg-white rounded-full shadow-lg px-2 py-1.5 overflow-x-auto max-w-[calc(100vw-2rem)] scrollbar-hide">
        {/* All days button */}
        <button
          onClick={() => onSelectDay(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all min-w-[44px] min-h-[36px] ${
            selectedDay === null
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

        {/* Day buttons */}
        {days.map((day) => {
          const isSelected = selectedDay === day.day_number;
          const color = getDayColor(day.day_number);

          return (
            <button
              key={day.day_number}
              onClick={() => onSelectDay(day.day_number)}
              className={`flex-shrink-0 w-9 h-9 rounded-full text-sm font-semibold transition-all flex items-center justify-center min-w-[44px] min-h-[44px] ${
                isSelected
                  ? 'text-white ring-2 ring-offset-2 ring-gray-400'
                  : 'text-white hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
              }`}
              style={{
                backgroundColor: color,
                opacity: isSelected ? 1 : 0.85,
              }}
              title={`Day ${day.day_number}`}
            >
              {day.day_number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
