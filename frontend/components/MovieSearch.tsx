"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, Movie } from "@/services/api";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
        setResults(movies);
        setIsOpen(movies.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Fermer au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Rechercher un film par titre..."
          className="w-full px-5 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl 
                     text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 
                     focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
          {loading ? (
            <svg className="w-5 h-5 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </span>
      </div>

      {/* Dropdown résultats */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((movie) => {
            const yearMatch = movie.title.match(/\((\d{4})\)/);
            const year = yearMatch ? yearMatch[1] : "";
            const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
            return (
              <button
                key={movie.id}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                onClick={() => {
                  setQuery(movie.title);
                  setIsOpen(false);
                  router.push(`/movies/${movie.id}`);
                }}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-white/60 shrink-0">MR</div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {cleanTitle}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {movie.genres.split("|").join(", ")}
                    {year && ` • ${year}`}
                  </p>
                </div>
              </button>
            );
          })}
          {results.length === 10 && (
            <div className="px-4 py-2 text-center text-xs text-gray-500">
              Affinez votre recherche pour plus de résultats
            </div>
          )}
        </div>
      )}
    </div>
  );
}
