'use client';

import IntakeForm from '@/components/IntakeForm';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-16">
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
