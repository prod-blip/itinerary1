'use client';

import { Location, DAY_COLORS } from '@/types';
import PlaceImage from './PlaceImage';

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
  const markerColor = dayNumber ? getDayColor(dayNumber) : '#6366f1';

  return (
    <div
      className={`group relative glass-card rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer
        ${
          isHighlighted
            ? 'ring-2 ring-primary-500 dark:ring-primary-400 shadow-lg'
            : 'hover:shadow-card-hover'
        }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex">
        {/* Thumbnail */}
        <div className="flex-shrink-0 p-3">
          <PlaceImage
            photoReference={location.photo_reference}
            placeName={location.name}
            size="md"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-3 pr-12">
          {/* Header with badge and name */}
          <div className="flex items-center gap-2 mb-1.5">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-sm"
              style={{ backgroundColor: markerColor }}
            >
              {index}
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {location.name}
            </h3>
            {location.user_added && (
              <span className="badge-warning text-xs">Added by you</span>
            )}
          </div>

          {/* Why this fits you */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
            {location.why_this_fits_you}
          </p>

          {/* User note if present */}
          {location.user_note && (
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500 italic flex items-center gap-1">
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

        {/* Remove button - glass effect */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 p-2 text-neutral-400 dark:text-neutral-500 hover:text-error-500 dark:hover:text-error-400
            hover:bg-error-50/80 dark:hover:bg-error-900/30 backdrop-blur-sm
            rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100
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
