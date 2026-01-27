'use client';

import IntakeForm from '@/components/IntakeForm';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about your travel preferences and we will discover the best
            places for you to explore.
          </p>
        </div>
        <IntakeForm />
      </div>
    </main>
  );
}
