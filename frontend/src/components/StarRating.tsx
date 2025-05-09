import React from 'react';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, count, size = 24 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg
        key={i}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={i <= rating ? '#FFD700' : '#E5E7EB'}
        stroke="#FFD700"
        strokeWidth="1"
        className="inline-block mx-0.5"
      >
        <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
      </svg>
    );
  }
  return (
    <span className="flex items-center space-x-1">
      <span>{stars}</span>
      {typeof count === 'number' && (
        <span className="ml-2 text-sm text-gray-600">({count})</span>
      )}
    </span>
  );
};
