'use client';

import { Location, DAY_COLORS } from '@/types';

interface LocationCardProps {
  location: Location;
  index: number;
  isHighlighted: boolean;
  dayNumber?: number | null;
  onRemove: () => void;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

export default function LocationCard({
  location,
  index,
  isHighlighted,
  dayNumber,
  onRemove,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LocationCardProps) {
  const markerColor = dayNumber ? getDayColor(dayNumber) : '#3B82F6';

  return (
    <div
      className={`group relative p-4 bg-white border rounded-xl transition-all duration-200 cursor-pointer
        ${
          isHighlighted
            ? 'border-blue-500 shadow-md ring-1 ring-blue-500'
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-start gap-3">
        {/* Number badge */}
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm"
          style={{ backgroundColor: markerColor }}
        >
          {index}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          {/* Name and badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">
              {location.name}
            </h3>
            {location.user_added && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                Added by you
              </span>
            )}
          </div>

          {/* Why this fits you */}
          <p className="mt-1.5 text-sm text-gray-600 line-clamp-2">
            {location.why_this_fits_you}
          </p>

          {/* User note if present */}
          {location.user_note && (
            <p className="mt-2 text-xs text-gray-500 italic flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                />
              </svg>
              {location.user_note}
            </p>
          )}
        </div>

        {/* Remove button - appears on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-3 right-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50
            rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100
            min-w-[44px] min-h-[44px] flex items-center justify-center"
          title="Remove location"
          aria-label={`Remove ${location.name}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
