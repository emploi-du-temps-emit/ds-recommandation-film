"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import MovieSearch from "@/components/MovieSearch";
import GenreFilter from "@/components/GenreFilter";
import RecommendationsList from "@/components/RecommendationsList";
import { api, Movie } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { AlertTriangle, Search, ChevronDown, Star, Film, TrendingUp } from "lucide-react";

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
      {/* Hero Section avec video background */}
      <section className="relative text-center py-24 md:py-32 overflow-hidden min-h-[70vh] flex items-center">
        {/* Video de fond */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay sombre pour la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90 z-[1]" />

        {/* Contenu */}
        <div className="relative z-10 w-full">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 text-white drop-shadow-lg">
            <span className="text-[var(--color-1)]">Movie</span>Reco
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Découvrez des films qui correspondent à vos goûts grâce à notre
            système de recommandation intelligent basé sur le Machine Learning.
          </p>

          {/* Stats rapides */}
          <div className="flex justify-center space-x-12 text-sm">
            <div className="text-center">
              <span className="block text-3xl font-bold text-white drop-shadow-lg">9 700+</span>
              <span className="text-gray-400">Films</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-white drop-shadow-lg">100K+</span>
              <span className="text-gray-400">Évaluations</span>
            </div>
            <div className="text-center">
              <span className="block text-3xl font-bold text-[var(--color-1)] drop-shadow-lg">IA</span>
              <span className="text-gray-400">Recommandations</span>
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

      {/* Recommandations personnalisées */}
      <RecommendationsList />

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
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-400 text-lg mb-2">{error}</p>
            <p className="text-gray-500 text-sm">
              Lancez d&apos;abord le backend avec{" "}
              <code className="bg-gray-800 px-2 py-1 rounded text-[var(--color-1)]">
                cd backend && uvicorn main:app --reload
              </code>
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredMovies.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 bg-[var(--color-1)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-[var(--text-muted)]" />
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
                  className="px-8 py-3 bg-[var(--color-2)] 
                             text-white rounded-xl font-medium hover:opacity-90 
                             transition-all duration-200 disabled:opacity-50
                             hover:shadow-lg hover:shadow-[var(--color-1)]/25
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
                      <ChevronDown className="w-4 h-4" />
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

      {/* Section explicative améliorée */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 animate-fade-in-up animate-delay-300">
        {[
          {
            icon: <Star className="w-6 h-6" />,
            title: "Notez des films",
            desc: "Donnez votre avis sur les films que vous avez vus. Plus vous notez, meilleures sont les recommandations.",
            gradient: "border-[var(--color-1)]/20",
            iconBg: "bg-[var(--color-1)]",
          },
          {
            icon: <Film className="w-6 h-6" />,
            title: "L'IA analyse vos goûts",
            desc: "Notre algorithme de Machine Learning compare vos notes à celles de milliers d'autres utilisateurs pour comprendre vos préférences.",
            gradient: "border-[var(--color-1)]/20",
            iconBg: "bg-[var(--color-1)]",
          },
          {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Recommandations personnalisées",
            desc: "Recevez des suggestions de films adaptées à vos goûts uniques, avec des prédictions de note pour chaque recommandation.",
            gradient: "border-[var(--color-2)]/20",
            iconBg: "bg-[var(--color-2)]",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`group bg-[var(--card-bg)] backdrop-blur-lg rounded-xl p-6 text-center 
                       hover:bg-[var(--card-hover)] transition-all duration-300 
                       hover:scale-[1.02] border ${item.gradient}`}
          >
            <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center 
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
