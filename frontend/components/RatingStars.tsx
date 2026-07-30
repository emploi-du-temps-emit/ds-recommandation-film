"use client";

import { useState } from "react";

interface RatingStarsProps {
  initialRating?: number;
  onRate: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function RatingStars({
  initialRating = 0,
  onRate,
  readOnly = false,
  size = "md",
  showLabel = false,
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [animating, setAnimating] = useState<number | null>(null);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const handleClick = (value: number) => {
    if (!readOnly) {
      const newRating = value === rating ? 0 : value;
      setRating(newRating);
      setAnimating(value);
      setTimeout(() => setAnimating(null), 400);
      onRate(newRating);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        const isAnimating = animating === star;
        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`${sizeClasses[size]} transition-all duration-150 select-none ${
              !readOnly
                ? "cursor-pointer hover:scale-125 active:scale-150"
                : "cursor-default"
            } ${filled ? "text-[var(--color-1)] scale-110" : "text-[var(--text-muted)] opacity-40"}`}
            disabled={readOnly}
            aria-label={`Noter ${star} étoile${star > 1 ? "s" : ""}`}
          >
            <span className={isAnimating ? "animate-star-pop inline-block" : ""}>
              {filled ? "★" : "☆"}
            </span>
          </button>
        );
      })}
      {showLabel && rating > 0 && (
        <span className="ml-2 text-sm text-[var(--text-secondary)]">
          {rating}/5
        </span>
      )}
    </div>
  );
}
