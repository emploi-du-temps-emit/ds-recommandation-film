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

const genreColors: Record<string, string> = {
  Action: "bg-red-500/20 text-red-400 border-red-500/30",
  Adventure: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Animation: "bg-green-500/20 text-green-400 border-green-500/30",
  Children: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  Comedy: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Crime: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  Documentary: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Drama: "bg-[var(--color-1)]/20 text-[var(--color-1)] border-[var(--color-1)]/30",
  Fantasy: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Horror: "bg-gray-700/30 text-gray-300 border-gray-600/30",
  Musical: "bg-[var(--color-2)]/20 text-[var(--color-2)] border-[var(--color-2)]/30",
  Mystery: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  Romance: "bg-[var(--color-2)]/20 text-[var(--color-2)] border-[var(--color-2)]/30",
  "Sci-Fi": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Thriller: "bg-indigo-600/20 text-indigo-400 border-indigo-600/30",
  War: "bg-red-700/20 text-red-400 border-red-700/30",
  Western: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "(no genres listed)": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function getGenreColor(genre: string): string {
  return genreColors[genre] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
}

export default function MovieCard({ movie, predictedRating, onRate, userId }: MovieCardProps) {
  const [showRating, setShowRating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extraire l'année du titre
  const yearMatch = movie.title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");

  const genres = movie.genres.split("|").filter(Boolean);

  // Générer une couleur de fond unique basée sur l'ID du film
  const hue1 = ((movie.id * 137.508) % 360);
  const hue2 = ((movie.id * 237.508 + 60) % 360);

  return (
    <div
      className={`group bg-[var(--card-bg)] backdrop-blur-lg rounded-xl overflow-hidden 
                  shadow-lg border border-[var(--card-border)]
                  transition-all duration-300 
                  ${isHovered ? "shadow-2xl shadow-[var(--color-1)]/10 scale-[1.03] bg-[var(--card-hover)]" : "shadow-lg"}`}
      onMouseEnter={() => { setShowRating(true); setIsHovered(true); }}
      onMouseLeave={() => { setShowRating(false); setIsHovered(false); }}
    >
      {/* Poster placeholder avec gradient dynamique */}
      <Link href={`/movies/${movie.id}`}>
        <div
          className="h-48 flex items-center justify-center relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsla(${hue1}, 70%, 40%, 0.3), hsla(${hue2}, 70%, 50%, 0.2))`,
          }}
        >
          {/* Animated overlay on hover */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-80"}`} />
          
          {/* Floating badge on hover */}
          {isHovered && (
            <div className="absolute top-3 left-3 bg-[var(--color-1)] text-white text-[10px] font-medium px-2 py-1 rounded-md animate-scale-in z-10">
              Voir détails
            </div>
          )}

          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold 
                          text-white/50 relative z-10 transition-all duration-500 
                          ${isHovered ? "scale-110 rotate-3 bg-[var(--color-1)]/50" : "bg-[var(--color-1)]/30"}`}
          >
            MR
          </div>

          {/* Prédiction badge */}
          {predictedRating && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full z-10 shadow-lg animate-scale-in">
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
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${getGenreColor(genre)}`}
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
