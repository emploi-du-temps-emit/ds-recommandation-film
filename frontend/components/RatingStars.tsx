"use client";

import { useState } from "react";
import { Star } from "lucide-react";

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

  const iconSizes = {
    sm: 16,
    md: 22,
    lg: 30,
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
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || rating);
        const isAnimating = animating === star;
        return (
          <button
            key={star}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={`transition-all duration-150 select-none ${
              !readOnly
                ? "cursor-pointer hover:scale-125 active:scale-150"
                : "cursor-default"
            } ${filled ? "scale-110" : "opacity-30"}`}
            disabled={readOnly}
            aria-label={`Noter ${star} étoile${star > 1 ? "s" : ""}`}
          >
            <span className={isAnimating ? "animate-star-pop inline-block" : "inline-block"}>
              <Star
                size={iconSizes[size]}
                className={`transition-colors duration-150 ${
                  filled ? "text-yellow-400 fill-yellow-400" : "text-[var(--text-muted)]"
                }`}
              />
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
