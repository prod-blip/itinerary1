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
      <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-800 rounded-full shadow-lg px-2 py-1.5 overflow-x-auto max-w-[calc(100vw-2rem)] scrollbar-hide border border-neutral-200/50 dark:border-neutral-700/50">
        {/* All days button */}
        <button
          onClick={() => onSelectDay(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-w-[44px] min-h-[36px] ${
            selectedDay === null
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
              : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
          }`}
        >
          All
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-600 flex-shrink-0" />

        {/* Day buttons */}
        {days.map((day) => {
          const isSelected = selectedDay === day.day_number;
          const color = getDayColor(day.day_number);

          return (
            <button
              key={day.day_number}
              onClick={() => onSelectDay(day.day_number)}
              className={`flex-shrink-0 w-9 h-9 rounded-full text-sm font-semibold transition-all duration-200 flex items-center justify-center min-w-[44px] min-h-[44px] ${
                isSelected
                  ? 'text-white ring-2 ring-offset-2 ring-neutral-400 dark:ring-neutral-500 ring-offset-white dark:ring-offset-neutral-800'
                  : 'text-white hover:ring-2 hover:ring-offset-1 hover:ring-neutral-300 dark:hover:ring-neutral-600 hover:ring-offset-white dark:hover:ring-offset-neutral-800'
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
