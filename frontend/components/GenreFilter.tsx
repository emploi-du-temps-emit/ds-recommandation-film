"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GENRES = [
  "Tous",
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
];

interface GenreFilterProps {
  selected: string;
  onSelect: (genre: string) => void;
  movieCount?: number;
}

export default function GenreFilter({ selected, onSelect, movieCount }: GenreFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 200;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full 
                     bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)]
                     flex items-center justify-center text-[var(--text-secondary)]
                     hover:text-[var(--text-primary)] transition-all shadow-lg"
          aria-label="Défiler à gauche"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Genres scrollable */}
      <div
        ref={scrollRef}
        className="flex items-center space-x-2 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium 
                       transition-all duration-200 border ${
              selected === genre
                ? "bg-[var(--color-2)] text-white border-transparent shadow-lg shadow-[var(--color-1)]/20"
                : "bg-[var(--card-bg)] text-[var(--text-secondary)] border-[var(--card-border)] hover:border-[var(--color-1)]/30 hover:text-[var(--text-primary)]"
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full
                     bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)]
                     flex items-center justify-center text-[var(--text-secondary)]
                     hover:text-[var(--text-primary)] transition-all shadow-lg"
          aria-label="Défiler à droite"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Count badge */}
      {movieCount !== undefined && (
        <span className="ml-2 text-xs text-[var(--text-muted)]">
          {movieCount} film{movieCount > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
