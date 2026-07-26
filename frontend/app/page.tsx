"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import MovieSearch from "@/components/MovieSearch";
import GenreFilter from "@/components/GenreFilter";
import RecommendationsList from "@/components/RecommendationsList";
import { api, Movie } from "@/services/api";
import { useToast } from "@/context/ToastContext";

const PAGE_SIZE = 12;

export default function Home() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("Tous");
  const [totalCount, setTotalCount] = useState(0);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Récupérer tous les films une fois pour le filtre
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        // Fetch first 100 movies for a good selection
        const data = await api.getMovies(0, 100);
        setMovies(data);
        setTotalCount(data.length);
        setHasMore(data.length >= 100);
      } catch (err) {
        setError(
          "Impossible de charger les films. Vérifiez que le backend est lancé."
        );
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Filtrer par genre
  useEffect(() => {
    if (selectedGenre === "Tous") {
      setFilteredMovies(movies);
    } else {
      setFilteredMovies(
        movies.filter((m) => m.genres.split("|").includes(selectedGenre))
      );
    }
  }, [selectedGenre, movies]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const newMovies = await api.getMovies(nextPage * PAGE_SIZE, PAGE_SIZE);
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        const updated = [...movies, ...newMovies];
        setMovies(updated);
        setPage(nextPage);
        setHasMore(newMovies.length >= PAGE_SIZE);
      }
    } catch {
      // Silently handle
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRate = async (movieId: number, rating: number) => {
    if (!userId) {
      router.push("/login");
      return;
    }
    try {
      await api.rateMovie(parseInt(userId), movieId, rating);
      if (rating === 0) {
        toastError("Note retirée");
      } else {
        success(`Film noté ${rating}/5`);
      }
    } catch {
      toastError("Erreur lors de la notation");
    }
  };

  const displayedMovies = filteredMovies.slice(0, (page + 1) * PAGE_SIZE);

  return (
    <div className="space-y-8">
      {/* Hero Section améliorée */}
      <section className="relative text-center py-16 md:py-20 overflow-hidden animate-fade-in-up">
        {/* Background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-6 animate-fade-in-down">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-400 font-medium">
              Système de recommandation intelligent
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            MovieReco
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Découvrez des films qui correspondent à vos goûts grâce à notre
            système de recommandation intelligent basé sur le Machine Learning.
          </p>

          {/* Stats rapides */}
          <div className="flex justify-center space-x-8 text-sm">
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">9 700+</span>
              <span className="text-[var(--text-muted)]">Films</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">100K+</span>
              <span className="text-[var(--text-muted)]">Évaluations</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-bold text-[var(--text-primary)]">IA</span>
              <span className="text-[var(--text-muted)]">Recommandations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barre de recherche */}
      <section className="max-w-xl mx-auto animate-fade-in-up animate-delay-100">
        <MovieSearch />
      </section>

      {/* Filtres par genre */}
      {!loading && !error && (
        <section className="animate-fade-in-up animate-delay-200">
          <GenreFilter
            selected={selectedGenre}
            onSelect={setSelectedGenre}
            movieCount={filteredMovies.length}
          />
        </section>
      )}

      {/* Films */}
      <section className="animate-fade-in-up animate-delay-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {selectedGenre === "Tous" ? "Catalogue" : selectedGenre}
          </h2>
          {!loading && !error && (
            <span className="text-sm text-[var(--text-muted)]">
              {filteredMovies.length} film{filteredMovies.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Loading skeletons améliorés */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden">
                <div className="h-48 skeleton-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 skeleton-pulse rounded" />
                  <div className="h-3 w-1/3 skeleton-pulse rounded" />
                  <div className="flex gap-2">
                    <div className="h-5 w-12 skeleton-pulse rounded-md" />
                    <div className="h-5 w-14 skeleton-pulse rounded-md" />
                    <div className="h-5 w-10 skeleton-pulse rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-8 text-center animate-scale-in">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-400 text-lg mb-2">{error}</p>
            <p className="text-gray-500 text-sm">
              Lancez d&apos;abord le backend avec{" "}
              <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">
                cd backend && uvicorn main:app --reload
              </code>
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredMovies.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-[var(--text-secondary)]">Aucun film trouvé pour ce genre</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedMovies.map((movie, index) => (
                  <div
                    key={movie.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(index % PAGE_SIZE) * 50}ms` }}
                  >
                    <MovieCard
                      movie={movie}
                      onRate={(rating) => handleRate(movie.id, rating)}
                      userId={userId ? parseInt(userId) : null}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && displayedMovies.length < filteredMovies.length && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-amber-700 
                             text-white rounded-xl font-medium hover:opacity-90 
                             transition-all duration-200 disabled:opacity-50
                             hover:shadow-lg hover:shadow-yellow-500/25
                             active:scale-95"
                >
                  {loadingMore ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <span>Voir plus de films</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Fin du catalogue */}
            {!hasMore && filteredMovies.length > 0 && (
              <div className="text-center mt-10 text-sm text-[var(--text-muted)]">
                <span className="inline-flex items-center space-x-2">
                  <span className="w-8 h-px bg-[var(--card-border)]" />
                  <span>Fin du catalogue</span>
                  <span className="w-8 h-px bg-[var(--card-border)]" />
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {/* Recommandations personnalisées */}
      <section className="animate-fade-in-up animate-delay-300">
        <RecommendationsList />
      </section>

      {/* Section explicative améliorée */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in-up animate-delay-300">
        {[
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            ),
            title: "Notez des films",
            desc: "Donnez votre avis sur les films que vous avez vus. Plus vous notez, meilleures sont les recommandations.",
            gradient: "from-yellow-500/20 to-amber-500/20 border-yellow-500/20",
            iconBg: "from-yellow-500 to-amber-500",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            title: "L'IA analyse vos goûts",
            desc: "Notre algorithme de Machine Learning compare vos notes à celles de milliers d'autres utilisateurs pour comprendre vos préférences.",
            gradient: "from-yellow-500/20 to-amber-500/20 border-yellow-500/20",
            iconBg: "from-yellow-500 to-amber-600",
          },
          {
            icon: (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            title: "Recommandations personnalisées",
            desc: "Recevez des suggestions de films adaptées à vos goûts uniques, avec des prédictions de note pour chaque recommandation.",
            gradient: "from-amber-500/20 to-orange-500/20 border-amber-500/20",
            iconBg: "from-amber-500 to-orange-600",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`group bg-[var(--card-bg)] backdrop-blur-lg rounded-xl p-6 text-center 
                       hover:bg-[var(--card-hover)] transition-all duration-300 
                       hover:scale-[1.02] border ${item.gradient}`}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${item.iconBg} rounded-xl flex items-center justify-center 
                            text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
