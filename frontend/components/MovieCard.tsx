"use client";

import { useState } from "react";
import Link from "next/link";
import { Movie } from "@/services/api";
import RatingStars from "./RatingStars";

interface MovieCardProps {
  movie: Movie;
  predictedRating?: number;
  onRate?: (rating: number) => void;
  userId?: number | null;
}

const genreColors: Record<string, string> = {
  Action: "bg-red-500",
  Adventure: "bg-orange-500",
  Animation: "bg-green-500",
  Children: "bg-teal-500",
  Comedy: "bg-yellow-600",
  Crime: "bg-gray-600",
  Documentary: "bg-blue-900",
  Drama: "bg-purple-500",
  Fantasy: "bg-indigo-500",
  Horror: "bg-gray-800",
  Musical: "bg-pink-500",
  Mystery: "bg-violet-500",
  Romance: "bg-pink-600",
  "Sci-Fi": "bg-cyan-500",
  Thriller: "bg-indigo-600",
  War: "bg-red-700",
  Western: "bg-amber-600",
};

export default function MovieCard({ movie, predictedRating, onRate, userId }: MovieCardProps) {
  const [showRating, setShowRating] = useState(false);

  // Extraire l'année du titre
  const yearMatch = movie.title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");

  const genres = movie.genres.split("|");

  return (
    <div
      className="group bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden shadow-lg 
                 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 
                 hover:scale-[1.02] hover:bg-white/10"
      onMouseEnter={() => setShowRating(true)}
      onMouseLeave={() => setShowRating(false)}
    >
      <Link href={`/movies/${movie.id}`}>
        <div className="h-48 bg-gradient-to-br from-purple-600/30 via-blue-500/20 to-pink-500/30 
                        flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-2xl flex items-center justify-center text-xl font-bold text-white/60 relative z-10 transition-transform duration-300 group-hover:scale-110">
            MR
          </div>
          {predictedRating && (
            <div className="absolute top-2 right-2 bg-yellow-400/90 text-gray-900 text-xs font-bold px-2 py-1 rounded-full z-10">
              ★ {predictedRating.toFixed(1)}
            </div>
          )}
        </div>
      </Link>

      {/* Contenu */}
      <div className="p-4">
        <Link href={`/movies/${movie.id}`}>
          <h3 className="text-white font-semibold text-base mb-1 group-hover:text-yellow-400 transition-colors truncate">
            {cleanTitle}
          </h3>
        </Link>

        <div className="flex items-center space-x-2 mb-3 text-xs text-gray-400">
          {year && <span>{year}</span>}
          <span className="text-gray-600">•</span>
          <span>{movie.id}</span>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium text-white ${
                genreColors[genre] || "bg-gray-500"
              }`}
            >
              {genre}
            </span>
          ))}
          {genres.length > 3 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-700 text-gray-400">
              +{genres.length - 3}
            </span>
          )}
        </div>

        {/* Notation rapide (visible au survol) */}
        {onRate && (
          <div className={`transition-all duration-300 ${showRating ? "opacity-100 max-h-12" : "opacity-0 max-h-0 overflow-hidden"}`}>
            <div className="pt-2 border-t border-white/10">
              <RatingStars
                size="sm"
                onRate={onRate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
