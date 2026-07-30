"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, Movie } from "@/services/api";
import { Search, X, ChevronRight, Loader2 } from "lucide-react";

export default function MovieSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      setSelectedIndex(-1);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const movies = await api.searchMovies(query);
        setResults(movies);
        setIsOpen(movies.length > 0);
        setSelectedIndex(-1);
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

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.children;
      if (items[selectedIndex]) {
        (items[selectedIndex] as HTMLElement).scrollIntoView({
          block: "nearest",
        });
      }
    }
  }, [selectedIndex]);

  const navigateToMovie = (movie: Movie) => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/movies/${movie.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToMovie(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher un film par titre..."
          className="w-full px-5 py-3.5 pl-12 bg-[var(--input-bg)] border border-[var(--input-border)] 
                     rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--input-focus)] 
                     focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="search-results"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </span>

        {/* Clear button */}
        {query.length > 0 && (
          <button
            onClick={() => { setQuery(""); setResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] 
                       hover:text-[var(--text-primary)] transition-colors p-1"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown résultats */}
      {isOpen && (
        <div
          id="search-results"
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] backdrop-blur-xl 
                     border border-[var(--card-border)] rounded-xl overflow-hidden shadow-2xl 
                     z-50 max-h-80 overflow-y-auto animate-fade-in-down"
          role="listbox"
        >
          {results.length > 0 ? (
            results.map((movie, index) => {
              const yearMatch = movie.title.match(/\((\d{4})\)/);
              const year = yearMatch ? yearMatch[1] : "";
              const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={movie.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full px-4 py-3 flex items-center space-x-3 text-left
                             border-b border-[var(--card-border)] last:border-0
                             transition-all duration-150 ${
                    isSelected
                      ? "bg-[var(--color-1)]/10"
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => navigateToMovie(movie)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                                  text-xs font-bold shrink-0 transition-all duration-300 ${
                    isSelected
                      ? "bg-[var(--color-1)] text-white scale-110"
                      : "bg-[var(--color-1)]/30 text-white/60"
                  }`}>
                    {cleanTitle.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium truncate ${
                      isSelected ? "text-[var(--color-1)]" : "text-[var(--text-primary)]"
                    }`}>
                      {cleanTitle}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {movie.genres.split("|").filter(Boolean).join(", ")}
                      {year && ` • ${year}`}
                    </p>
                  </div>
                  {isSelected && (
                    <ChevronRight className="w-4 h-4 text-[var(--color-1)] shrink-0" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-[var(--text-muted)] text-sm">Aucun film trouvé</p>
              <p className="text-[var(--text-muted)] text-xs mt-1">Essayez un autre terme de recherche</p>
            </div>
          )}

          {results.length > 0 && query.length >= 2 && (
            <div className="px-4 py-2 bg-[var(--nav-bg)] text-center">
              <p className="text-[10px] text-[var(--text-muted)]">
                ↑↓ Navigation &nbsp;•&nbsp; Entrée pour sélectionner &nbsp;•&nbsp; Esc pour fermer
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
