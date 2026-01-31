'use client';

import IntakeForm from '@/components/IntakeForm';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-200/50 dark:border-neutral-800/50">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Travel Planner
          </span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Tell us about your travel preferences and we will discover the best
            places for you to explore.
          </p>
        </div>
        <IntakeForm />
      </div>
    </main>
  );
}
