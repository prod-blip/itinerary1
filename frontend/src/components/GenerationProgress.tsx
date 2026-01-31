'use client';

type GenerationStep = 'organizing' | 'routing' | 'finishing';

interface GenerationProgressProps {
  currentStep: GenerationStep;
}

const STEPS: { key: GenerationStep; label: string; description: string }[] = [
  { key: 'organizing', label: 'Organizing', description: 'Grouping locations by area...' },
  { key: 'routing', label: 'Routing', description: 'Calculating travel times...' },
  { key: 'finishing', label: 'Finishing', description: 'Optimizing your itinerary...' },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StepIndicator({
  step,
  index,
  isActive,
  isComplete,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {/* Step circle */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
          isComplete
            ? 'bg-success-500 text-white'
            : isActive
            ? 'bg-primary-600 dark:bg-primary-500 text-white ring-4 ring-primary-100 dark:ring-primary-900/50'
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {isComplete ? <CheckIcon /> : index + 1}
      </div>

      {/* Step content */}
      <div className="flex-1">
        <div
          className={`font-medium text-sm ${
            isActive ? 'text-neutral-900 dark:text-neutral-100' : isComplete ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          {step.label}
        </div>
        {isActive && (
          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 animate-pulse">{step.description}</div>
        )}
      </div>
    </div>
  );
}

export default function GenerationProgress({ currentStep }: GenerationProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="overlay-backdrop flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-6 text-center">
          Creating Your Itinerary
        </h3>

        {/* Progress steps */}
        <div className="space-y-4">
          {STEPS.map((step, index) => (
            <StepIndicator
              key={step.key}
              step={step}
              index={index}
              isActive={index === currentIndex}
              isComplete={index < currentIndex}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-600 dark:bg-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center mt-4">
          This may take a moment...
        </p>
      </div>
    </div>
  );
}
