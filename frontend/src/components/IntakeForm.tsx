'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  TripParameters,
  TravelStyle,
  INTEREST_OPTIONS,
  CONSTRAINT_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
} from '@/types';
import { useStartTrip } from '@/services/api';
import { useTripStore } from '@/stores/tripStore';
import PlaceSearch from './PlaceSearch';

interface FormData {
  destination: string;
  num_days: number;
  travel_style: TravelStyle;
  interests: string[];
  constraints: string[];
  notes: string;
}

const initialFormData: FormData = {
  destination: '',
  num_days: 3,
  travel_style: 'balanced',
  interests: [],
  constraints: [],
  notes: '',
};

export default function IntakeForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const { mutate: startTrip, isPending, error: mutationError } = useStartTrip();
  const { setThreadId, setLocations, setTripParams, setPhase } = useTripStore();

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination';
    }

    if (formData.num_days < 1 || formData.num_days > 14) {
      newErrors.num_days = 'Trip duration must be between 1 and 14 days';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const tripParams: TripParameters = {
      destination: formData.destination,
      num_days: formData.num_days,
      travel_style: formData.travel_style,
      interests: formData.interests,
      constraints: formData.constraints,
      notes: formData.notes || undefined,
    };

    startTrip(tripParams, {
      onSuccess: (data) => {
        setThreadId(data.thread_id);
        setTripParams(tripParams);
        setLocations(data.locations);
        setPhase('editing');
        router.push(`/trip/${data.thread_id}`);
      },
    });
  };

  const handleDestinationSelect = (place: { name: string; lat: number; lng: number }) => {
    setFormData((prev) => ({ ...prev, destination: place.name }));
    setErrors((prev) => ({ ...prev, destination: undefined }));
  };

  const handleDestinationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, destination: value }));
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, destination: undefined }));
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const numDays = isNaN(value) || value < 1 ? 1 : Math.min(14, value);
    setFormData((prev) => ({ ...prev, num_days: numDays }));
    setErrors((prev) => ({ ...prev, num_days: undefined }));
  };

  const handleStyleChange = (style: TravelStyle) => {
    setFormData((prev) => ({ ...prev, travel_style: style }));
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
    setErrors((prev) => ({ ...prev, interests: undefined }));
  };

  const toggleConstraint = (constraint: string) => {
    setFormData((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(constraint)
        ? prev.constraints.filter((c) => c !== constraint)
        : [...prev.constraints, constraint],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Destination */}
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Where are you going?
            </label>
            <PlaceSearch
              onSelect={handleDestinationSelect}
              onChange={handleDestinationChange}
              placeholder="Search for a city or region..."
              initialValue={formData.destination}
              hasError={!!errors.destination}
            />
            {errors.destination && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.destination}</p>
            )}
          </div>

          {/* Number of Days */}
          <div>
            <label
              htmlFor="num_days"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              How many days?
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                id="num_days"
                min={1}
                max={14}
                value={formData.num_days}
                onChange={handleDaysChange}
                className={`w-24 px-4 py-3 border rounded-lg text-center text-lg font-medium
                  bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100
                  focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400
                  transition-all duration-200
                  ${errors.num_days ? 'border-error-500 dark:border-error-400' : 'border-neutral-200 dark:border-neutral-700'}`}
              />
              <span className="text-neutral-500 dark:text-neutral-400">
                {formData.num_days === 1 ? 'day' : 'days'}
              </span>
            </div>
            {errors.num_days && (
              <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.num_days}</p>
            )}
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              What is your travel style?
            </label>
            <div className="grid gap-3">
              {TRAVEL_STYLE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`relative flex items-start p-4 cursor-pointer rounded-lg border-2 transition-all duration-200
                    ${
                      formData.travel_style === option.value
                        ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-primary-950/30'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="travel_style"
                    value={option.value}
                    checked={formData.travel_style === option.value}
                    onChange={() => handleStyleChange(option.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <span
                      className={`block font-medium ${
                        formData.travel_style === option.value
                          ? 'text-primary-900 dark:text-primary-100'
                          : 'text-neutral-900 dark:text-neutral-100'
                      }`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`block text-sm mt-1 ${
                        formData.travel_style === option.value
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    >
                      {option.description}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                      ${
                        formData.travel_style === option.value
                          ? 'border-primary-500 dark:border-primary-400'
                          : 'border-neutral-300 dark:border-neutral-600'
                      }`}
                  >
                    {formData.travel_style === option.value && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500 dark:bg-primary-400" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              What interests you?
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    min-h-[44px] min-w-[44px]
                    ${
                      formData.interests.includes(interest)
                        ? 'bg-primary-500 dark:bg-primary-600 text-white shadow-sm hover:bg-primary-600 dark:hover:bg-primary-500'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {errors.interests && (
              <p className="mt-2 text-sm text-error-600 dark:text-error-400">{errors.interests}</p>
            )}
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Any special considerations?
              <span className="font-normal text-neutral-500 dark:text-neutral-500 ml-1">(optional)</span>
            </label>
            <div className="space-y-3">
              {CONSTRAINT_OPTIONS.map((constraint) => (
                <label
                  key={constraint}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                      ${
                        formData.constraints.includes(constraint)
                          ? 'bg-primary-500 dark:bg-primary-600 border-primary-500 dark:border-primary-600'
                          : 'border-neutral-300 dark:border-neutral-600 group-hover:border-neutral-400 dark:group-hover:border-neutral-500'
                      }`}
                  >
                    {formData.constraints.includes(constraint) && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.constraints.includes(constraint)}
                    onChange={() => toggleConstraint(constraint)}
                    className="sr-only"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">{constraint}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2"
            >
              Anything else we should know?
              <span className="font-normal text-neutral-500 dark:text-neutral-500 ml-1">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Special occasions, places you have already visited, specific preferences..."
              className="input resize-none"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500 text-right">
              {formData.notes.length}/500
            </p>
          </div>

          {/* Error Message */}
          {mutationError && (
            <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
              <p className="text-sm text-error-700 dark:text-error-300">
                {mutationError instanceof Error
                  ? mutationError.message
                  : 'Something went wrong. Please try again.'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200
              min-h-[56px]
              ${
                isPending
                  ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 active:scale-[0.98] shadow-sm hover:shadow-primary'
              }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Discovering places...
              </span>
            ) : (
              'Start Planning'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
