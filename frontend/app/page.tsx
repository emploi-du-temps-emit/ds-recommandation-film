"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MovieCard from "@/components/MovieCard";
import MovieSearch from "@/components/MovieSearch";
import { api, Movie } from "@/services/api";

const PAGE_SIZE = 12;

export default function Home() {
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.getMovies(0, PAGE_SIZE);
        setMovies(data);
        setHasMore(data.length >= PAGE_SIZE);
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

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const newMovies = await api.getMovies(nextPage * PAGE_SIZE, PAGE_SIZE);
      if (newMovies.length === 0) {
        setHasMore(false);
      } else {
        setMovies((prev) => [...prev, ...newMovies]);
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
      setToastMessage(`Film noté ${rating}/5`);
    } catch {
      setToastMessage("Erreur lors de la notation");
    }
  };

  return (
    <div className="space-y-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800/95 backdrop-blur-md text-white px-5 py-3 rounded-xl shadow-2xl animate-slide-in border border-white/10">
          {toastMessage}
        </div>
      )}

      {/* Hero Section */}
      <section className="text-center py-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
          MovieReco
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Découvrez des films qui correspondent à vos goûts grâce à notre
          système de recommandation intelligent basé sur le Machine Learning.
        </p>
      </section>

      {/* Barre de recherche */}
      <section className="max-w-xl mx-auto animate-fade-in-up animate-delay-100">
        <MovieSearch />
      </section>

      {/* Films */}
      <section className="animate-fade-in-up animate-delay-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Catalogue</h2>
          {!loading && !error && (
            <span className="text-sm text-gray-500">
              {movies.length} films
            </span>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-6 text-center">
            <p className="text-red-400 text-lg mb-2">{error}</p>
            <p className="text-gray-500 text-sm">
              Lancez d&apos;abord le backend avec{" "}
              <code className="bg-gray-800 px-2 py-1 rounded text-purple-400">
                cd backend && uvicorn main:app --reload
              </code>
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie, index) => (
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

            {/* Load more */}
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                             text-white rounded-xl font-medium hover:opacity-90 
                             transition-all duration-200 disabled:opacity-50
                             hover:shadow-lg hover:shadow-purple-500/25"
                >
                  {loadingMore ? (
                    <span className="flex items-center space-x-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Chargement...</span>
                    </span>
                  ) : (
                    "Voir plus de films ↓"
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Section explicative */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in-up animate-delay-300">
        {        [
          {
            emoji: "★",
            title: "Notez des films",
            desc: "Donnez votre avis sur les films que vous avez vus.",
          },
          {
            emoji: "◆",
            title: "L'IA analyse vos goûts",
            desc: "Notre algorithme compare vos notes à celles d'autres utilisateurs.",
          },
          {
            emoji: "▶",
            title: "Recommandations personnalisées",
            desc: "Recevez des suggestions de films adaptées à vos préférences.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105"
          >
            <span className="text-4xl mb-4 block">{item.emoji}</span>
            <h3 className="text-lg font-semibold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
