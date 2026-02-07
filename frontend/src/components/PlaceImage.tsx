'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PlaceImageProps {
  photoReference?: string;
  placeName: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

export default function PlaceImage({
  photoReference,
  placeName,
  className = '',
  size = 'md',
}: PlaceImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const sizeClass = sizeClasses[size];

  // Generate a consistent gradient based on place name
  const getGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const gradients = [
      'from-primary-400 to-primary-600',
      'from-success-400 to-success-600',
      'from-warning-400 to-warning-600',
      'from-info-400 to-info-600',
      'from-violet-400 to-violet-600',
      'from-pink-400 to-pink-600',
      'from-cyan-400 to-cyan-600',
      'from-orange-400 to-orange-600',
    ];
    return gradients[hash % gradients.length];
  };

  // Fallback UI with gradient and map pin icon
  const Fallback = () => (
    <div
      className={`${sizeClass} ${className} rounded-xl bg-gradient-to-br ${getGradient(placeName)} flex items-center justify-center flex-shrink-0`}
    >
      <svg
        className="w-1/2 h-1/2 text-white/80"
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
  );

  // Loading skeleton with shimmer
  const Skeleton = () => (
    <div
      className={`${sizeClass} ${className} rounded-xl skeleton-shimmer flex-shrink-0`}
    />
  );

  // If no photo reference or error, show fallback
  if (!photoReference || hasError) {
    return <Fallback />;
  }

  // Construct Google Places Photo API URL (via backend proxy if implemented)
  // For now, we'll show fallback since backend proxy isn't implemented yet
  // When backend is ready, use: /api/places/photo/${photoReference}?maxwidth=400
  const photoUrl = `/api/places/photo/${photoReference}?maxwidth=400`;

  return (
    <div className={`${sizeClass} ${className} relative rounded-xl overflow-hidden flex-shrink-0`}>
      {isLoading && <Skeleton />}
      <Image
        src={photoUrl}
        alt={placeName}
        fill
        className={`object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        sizes="(max-width: 768px) 48px, 64px"
      />
    </div>
  );
}
