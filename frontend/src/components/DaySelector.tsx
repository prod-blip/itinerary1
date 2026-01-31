'use client';

import { useRef, useEffect } from 'react';
import { DAY_COLORS } from '@/types';

interface DaySelectorProps {
  numDays: number;
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

export default function DaySelector({
  numDays,
  selectedDay,
  onSelectDay,
}: DaySelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll selected day into view
  useEffect(() => {
    if (selectedButtonRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Check if button is out of view
      if (buttonRect.left < containerRect.left || buttonRect.right > containerRect.right) {
        button.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [selectedDay]);

  return (
    <div className="relative">
      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {/* All Days tab */}
        <button
          ref={selectedDay === null ? selectedButtonRef : null}
          onClick={() => onSelectDay(null)}
          className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
            min-h-[44px] min-w-[44px]
            ${
              selectedDay === null
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-sm'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
        >
          All Days
        </button>

        {/* Individual day tabs */}
        {Array.from({ length: numDays }, (_, i) => i + 1).map((dayNumber) => {
          const isSelected = selectedDay === dayNumber;
          const dayColor = getDayColor(dayNumber);

          return (
            <button
              key={dayNumber}
              ref={isSelected ? selectedButtonRef : null}
              onClick={() => onSelectDay(dayNumber)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2 min-h-[44px] min-w-[44px]
                ${
                  isSelected
                    ? 'text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              style={
                isSelected
                  ? { backgroundColor: dayColor }
                  : undefined
              }
            >
              {/* Color indicator when not selected */}
              {!isSelected && (
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dayColor }}
                />
              )}
              Day {dayNumber}
            </button>
          );
        })}
      </div>

      {/* Fade indicators for scroll */}
      <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white dark:from-neutral-900 to-transparent pointer-events-none" />
    </div>
  );
}
