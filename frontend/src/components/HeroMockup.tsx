'use client';

import { DAY_COLORS } from '@/types';

// Sample data for the mockup - hardcoded 2-day Goa itinerary
const sampleItinerary = {
  destination: 'Goa, India',
  days: [
    {
      day_number: 1,
      locations: [
        { name: 'Basilica of Bom Jesus', why: 'UNESCO World Heritage Site' },
        { name: 'Fort Aguada', why: 'Historic Portuguese fortress' },
        { name: 'Calangute Beach', why: 'Popular beach with local cuisine' },
      ],
    },
    {
      day_number: 2,
      locations: [
        { name: 'Dudhsagar Falls', why: 'Stunning four-tiered waterfall' },
        { name: 'Spice Plantation Tour', why: 'Local culture experience' },
        { name: 'Panjim Old Quarter', why: 'Portuguese colonial architecture' },
      ],
    },
  ],
};

function getDayColor(dayNumber: number): string {
  return DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length];
}

export default function HeroMockup() {
  return (
    <div className="relative animate-fade-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
      {/* Main mockup container with glassmorphism */}
      <div className="glass-card rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto lg:mx-0 animate-hero-float">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-lg">{sampleItinerary.destination}</h3>
              <p className="text-white/80 text-sm">2 days - Balanced pace</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/30" />
              <div className="w-2.5 h-2.5 rounded-full bg-white/80" />
            </div>
          </div>
        </div>

        {/* Mini map preview */}
        <div className="h-28 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 relative overflow-hidden">
          {/* Simplified map illustration */}
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid slice">
            {/* Roads */}
            <path d="M0 60 Q100 30, 200 60 T400 60" stroke="currentColor" strokeWidth="2" fill="none" className="text-neutral-400 dark:text-neutral-500" />
            <path d="M50 20 Q150 80, 250 40 T350 100" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-neutral-400 dark:text-neutral-500" />
            {/* Location markers */}
            <circle cx="80" cy="45" r="6" className="fill-primary-500" />
            <circle cx="180" cy="55" r="6" className="fill-success-500" />
            <circle cx="280" cy="35" r="6" className="fill-primary-500" />
            <circle cx="330" cy="75" r="6" className="fill-success-500" />
          </svg>
          {/* Map label */}
          <div className="absolute bottom-2 right-2 bg-white/80 dark:bg-neutral-800/80 px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400">
            Interactive Map
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-700">
          {sampleItinerary.days.map((day) => (
            <button
              key={day.day_number}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                day.day_number === 1
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Day {day.day_number}
            </button>
          ))}
        </div>

        {/* Location cards - showing Day 1 */}
        <div className="p-4 space-y-2.5 bg-white/50 dark:bg-neutral-800/50">
          {sampleItinerary.days[0].locations.map((location, index) => {
            const color = getDayColor(1);
            return (
              <div
                key={location.name}
                className="flex items-center gap-3 p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 shadow-sm"
              >
                {/* Number badge */}
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: color }}
                >
                  {index + 1}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                    {location.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {location.why}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/80 border-t border-neutral-200/60 dark:border-neutral-700/60">
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
            Click any location to see it on the map
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 dark:bg-primary-400/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-success-500/10 dark:bg-success-400/10 rounded-full blur-2xl" />
    </div>
  );
}
