"use client";

import { useState } from "react";

interface RatingStarsProps {
  initialRating?: number;
  onRate: (rating: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  initialRating = 0,
  onRate,
  readOnly = false,
  size = "md",
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const handleClick = (value: number) => {
    if (!readOnly) {
      const newRating = value === rating ? 0 : value;
      setRating(newRating);
      onRate(newRating);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`${sizeClasses[size]} transition-all duration-150 ${
              !readOnly
                ? "cursor-pointer hover:scale-125 active:scale-150"
                : "cursor-default"
            } ${filled ? "scale-110" : "opacity-30 grayscale"}`}
            disabled={readOnly}
            aria-label={`Noter ${star} étoile${star > 1 ? "s" : ""}`}
          >
            {filled ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
