"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Movie, MovieRecommendation } from "@/services/api";
import RatingStars from "@/components/RatingStars";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = Number(params.id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [showToast, setShowToast] = useState(false);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isAuthenticated = typeof window !== "undefined" ? !!localStorage.getItem("token") : false;

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await api.getMovie(movieId);
        setMovie(data);
      } catch {
        setError("Film non trouvé");
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [movieId]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleRate = async (rating: number) => {
    if (!userId) {
      router.push("/login");
      return;
    }
    try {
      await api.rateMovie(parseInt(userId), movieId, rating);
      setUserRating(rating);
      setShowToast(true);

      // Charger les recommandations après une note
      const recs = await api.getRecommendations(parseInt(userId), 5);
      setRecommendations(recs);
    } catch {
      // Silently handle
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement du film...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🎬</span>
          <h1 className="text-2xl font-bold text-white mt-4 mb-2">Film non trouvé</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  const genres = movie.genres.split("|");
  const yearMatch = movie.title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");

  return (
    <div className="space-y-8">
      {/* Toast notification */}
      {showToast && (
        <div className="fixed top-20 right-4 z-50 bg-green-600/90 text-white px-6 py-3 rounded-xl shadow-2xl animate-slide-in">
          ✅ Note enregistrée ! ({userRating}/5)
        </div>
      )}

      {/* Hero du film */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
        <div className="md:flex">
          {/* Poster */}
          <div className="md:w-80 h-80 md:h-auto bg-gradient-to-br from-purple-600/30 via-blue-500/20 to-pink-500/30 flex items-center justify-center shrink-0">
            <span className="text-8xl">🎬</span>
          </div>

          {/* Infos */}
          <div className="p-8 flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {cleanTitle}
                </h1>
                <div className="flex items-center space-x-3 text-gray-400">
                  {year && <span>{year}</span>}
                  <span className="text-gray-600">•</span>
                  <span>ID: {movie.id}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-purple-600/30 text-purple-300 border border-purple-500/30"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Notation */}
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                {isAuthenticated ? "Votre note" : "Connectez-vous pour noter"}
              </h3>
              <RatingStars
                initialRating={userRating}
                onRate={handleRate}
                size="lg"
              />
              {userRating > 0 && (
                <p className="text-gray-400 text-sm mt-2">
                  Vous avez noté ce film {userRating}/5
                </p>
              )}
            </div>

            {/* Informations additionnelles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <span className="text-gray-500">Genres</span>
                <p className="text-white font-medium">{genres.length}</p>
              </div>
              {movie.release_year && (
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-gray-500">Année</span>
                  <p className="text-white font-medium">{movie.release_year}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations basées sur ce film */}
      {recommendations.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">
            🎯 Films similaires
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendations.map((rec, index) => (
              <div
                key={rec.movie.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MovieCardSimple movie={rec.movie} />
              </div>
            ))}
          </div>
        </section>
      )}

      <button
        onClick={() => router.push("/")}
        className="text-gray-400 hover:text-white transition-colors text-sm"
      >
        ← Retour à l&apos;accueil
      </button>
    </div>
  );
}

// Mini MovieCard pour les recommandations sur la page détail
function MovieCardSimple({ movie }: { movie: Movie }) {
  const router = useRouter();
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
  const genres = movie.genres.split("|").slice(0, 2);
  return (
    <div className="bg-white/5 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onClick={() => router.push(`/movies/${movie.id}`)}
    >
      <div className="h-32 bg-gradient-to-br from-purple-600/30 to-pink-500/30 flex items-center justify-center">
        <span className="text-4xl">🎬</span>
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate">{cleanTitle}</p>
        <p className="text-gray-500 text-xs mt-1">{genres.join(", ")}</p>
      </div>
    </div>
  );
}
