"use client";

import { useState } from "react";
import Link from "next/link";
import { Movie } from "@/services/api";
import RatingStars from "./RatingStars";
import { Star } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  predictedRating?: number;
  onRate?: (rating: number) => void;
  userId?: number | null;
}

const GENRE_STYLE = "bg-[var(--color-1)]/10 text-[var(--color-1)] border-[var(--color-1)]/20";

export default function MovieCard({ movie, predictedRating, onRate, userId }: MovieCardProps) {
  const [showRating, setShowRating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extraire l'année du titre
  const yearMatch = movie.title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");

  const genres = movie.genres.split("|").filter(Boolean);

  return (
    <div
      className={`group bg-[var(--card-bg)] backdrop-blur-lg rounded-xl overflow-hidden 
                  shadow-lg border border-[var(--card-border)]
                  transition-all duration-300 
                  ${isHovered ? "shadow-2xl shadow-[var(--color-1)]/10 scale-[1.03] bg-[var(--card-hover)]" : "shadow-lg"}`}
      onMouseEnter={() => { setShowRating(true); setIsHovered(true); }}
      onMouseLeave={() => { setShowRating(false); setIsHovered(false); }}
    >
      {/* Poster */}
      <Link href={`/movies/${movie.id}`}>
        <div className="h-48 relative overflow-hidden bg-[var(--skeleton-bg)]">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={cleanTitle}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold 
                              text-white/50 transition-all duration-500 
                              ${isHovered ? "scale-110 rotate-3 bg-[var(--color-1)]/50" : "bg-[var(--color-1)]/30"}`}
              >
                MR
              </div>
            </div>
          )}

          {/* Overlay sur hover */}
          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`} />
          
          {/* Floating badge on hover */}
          {isHovered && (
            <div className="absolute top-3 left-3 bg-[var(--color-1)] text-white text-[10px] font-medium px-2 py-1 rounded-md animate-scale-in z-10">
              Voir détails
            </div>
          )}

          {/* Prédiction badge */}
          {predictedRating && (
            <div className="absolute top-2 right-2 bg-[var(--color-1)] text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-lg animate-scale-in">
              <Star className="w-3 h-3 inline fill-current" /> {predictedRating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4">
        <Link href={`/movies/${movie.id}`}>
          <h3 className="text-[var(--text-primary)] font-semibold text-sm mb-1 
                         group-hover:text-[var(--color-1)] transition-colors duration-200
                         line-clamp-2 leading-snug min-h-[2.5em]">
            {cleanTitle}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 mb-2.5 text-xs text-[var(--text-muted)]">
          {year && <span>{year}</span>}
          {year && <span className="text-[var(--card-border)]">•</span>}
          <span>ID: {movie.id}</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${GENRE_STYLE}`}
            >
              {genre}
            </span>
          ))}
          {genres.length > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] bg-[var(--skeleton-bg)] text-[var(--text-muted)] border border-[var(--card-border)]">
              +{genres.length - 3}
            </span>
          )}
        </div>

        {/* Notation rapide */}
        {onRate && (
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showRating ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
          }`}>
            <div className="pt-2.5 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[var(--text-muted)]">Noter :</span>
                <RatingStars
                  size="sm"
                  onRate={onRate}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
