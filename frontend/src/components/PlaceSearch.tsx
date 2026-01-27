'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePlacesAutocomplete, usePlaceDetails } from '@/services/api';
import { PlacePrediction } from '@/types';

interface PlaceSearchProps {
  onSelect: (place: { name: string; lat: number; lng: number; place_id: string }) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  autoFocus?: boolean;
}

export default function PlaceSearch({
  onSelect,
  onChange,
  placeholder = 'Search for a place...',
  className = '',
  initialValue = '',
  autoFocus = false,
}: PlaceSearchProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedInput, setDebouncedInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInput(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Fetch autocomplete suggestions
  const { data: suggestions, isLoading } = usePlacesAutocomplete(debouncedInput);

  // Fetch place details when a place is selected
  const { data: placeDetails } = usePlaceDetails(selectedPlaceId);

  // Handle place details response
  useEffect(() => {
    if (placeDetails && selectedPlaceId) {
      onSelect({
        name: placeDetails.name,
        lat: placeDetails.lat,
        lng: placeDetails.lng,
        place_id: selectedPlaceId,
      });
      setSelectedPlaceId(null);
      setIsOpen(false);
    }
  }, [placeDetails, selectedPlaceId, onSelect]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length >= 2);
    setHighlightedIndex(-1);
    // Also notify parent of the text change
    onChange?.(value);
  };

  const handleSelectPlace = useCallback((prediction: PlacePrediction) => {
    setInputValue(prediction.structured_formatting?.main_text || prediction.description);
    setSelectedPlaceId(prediction.place_id);
    setIsOpen(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !suggestions?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectPlace(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const showDropdown = isOpen && (isLoading || (suggestions && suggestions.length > 0));

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
            placeholder:text-gray-400 ${className}`}
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <svg
              className="animate-spin h-5 w-5 text-gray-400"
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
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Searching...
            </div>
          ) : suggestions && suggestions.length > 0 ? (
            <ul className="py-1">
              {suggestions.map((prediction, index) => (
                <li key={prediction.place_id}>
                  <button
                    type="button"
                    onClick={() => handleSelectPlace(prediction)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left transition-colors
                      min-h-[44px] flex items-start gap-3
                      ${
                        highlightedIndex === index
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                  >
                    <svg
                      className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </p>
                      {prediction.structured_formatting?.secondary_text && (
                        <p className="text-sm text-gray-500 truncate">
                          {prediction.structured_formatting.secondary_text}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No places found. Try a different search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
