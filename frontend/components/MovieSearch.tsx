"use client";

import { useState, useEffect, useRef } from "react";
import { api, Movie } from "@/services/api";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const movies = await api.searchMovies(query);
        setResults(movies.slice(0, 8));
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="relative w-full" ref={inputRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Rechercher un film..."
          className="w-full px-5 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl 
                     text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 
                     focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
          {loading ? "⏳" : "🔍"}
        </span>
      </div>

      {/* Dropdown résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((movie) => (
            <button
              key={movie.id}
              className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/5 transition-colors text-left"
              onMouseDown={() => {
                setQuery(movie.title);
                setIsOpen(false);
              }}
            >
              <span className="text-xl">🎬</span>
              <div>
                <p className="text-white text-sm font-medium">
                  {movie.title}
                </p>
                <p className="text-gray-500 text-xs">{movie.genres}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
