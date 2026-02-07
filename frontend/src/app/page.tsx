'use client';

import { useRef } from 'react';
import IntakeForm from '@/components/IntakeForm';
import { ThemeToggle } from '@/components/ThemeToggle';
import MapBackground from '@/components/MapBackground';
import HeroMockup from '@/components/HeroMockup';

export default function HomePage() {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors relative">
      {/* Hazy map background */}
      <MapBackground />

      {/* Header with glassmorphism */}
      <header className="glass-strong sticky top-0 z-20 transition-colors">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Travel Planner
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero section */}
      <section className="min-h-[85vh] flex items-center relative">
        <div className="mx-auto max-w-6xl px-4 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Hook/Value proposition */}
            <div className="animate-fade-up">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-neutral-900 dark:text-neutral-50 leading-tight mb-6">
                Your Perfect Trip,{' '}
                <span className="text-gradient">Visualized</span>
              </h1>
              <p className="text-lg lg:text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-lg">
                Discover amazing places. Get a day-by-day plan. See your journey
                before you go.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToForm}
                  className="btn-primary text-lg px-8 py-4 shadow-primary-lg hover:scale-[1.02] transition-transform"
                >
                  Start Planning
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
                <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-medium text-primary-600 dark:text-primary-300">
                      JD
                    </div>
                    <div className="w-8 h-8 rounded-full bg-success-100 dark:bg-success-900 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-medium text-success-600 dark:text-success-300">
                      SK
                    </div>
                    <div className="w-8 h-8 rounded-full bg-warning-100 dark:bg-warning-900 border-2 border-white dark:border-neutral-900 flex items-center justify-center text-xs font-medium text-warning-600 dark:text-warning-300">
                      MR
                    </div>
                  </div>
                  <span className="text-sm">500+ trips planned</span>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">AI</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Powered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">14</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Day Plans</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Free</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">To Use</div>
                </div>
              </div>
            </div>

            {/* Right: Product mockup */}
            <div className="lg:pl-8">
              <HeroMockup />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
          <button
            onClick={scrollToForm}
            className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            aria-label="Scroll to form"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Form section - seamless continuation */}
      <section
        ref={formRef}
        id="plan-form"
        className="relative scroll-mt-16"
      >
        {/* Visual connector from hero to form */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary-300 to-primary-500 dark:via-primary-700 dark:to-primary-500 hidden lg:block" />

        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/5 dark:bg-primary-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-success-500/5 dark:bg-success-400/5 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-2xl px-4 py-12 lg:py-16 relative">
          {/* Section header with icon */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 mb-5">
              <svg
                className="w-7 h-7 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-3">
              Plan Your Adventure
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              Tell us your preferences and let AI craft your perfect itinerary
            </p>
          </div>

          <IntakeForm />

          {/* Trust indicators below form */}
          <div className="mt-8 pt-6 border-t border-neutral-200/50 dark:border-neutral-700/50">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AI-powered suggestions</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-neutral-200/50 dark:border-neutral-800/50">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Built with AI to help you explore the world
        </div>
      </footer>
    </main>
  );
}
