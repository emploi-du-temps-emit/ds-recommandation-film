"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, Movie, MovieRecommendation } from "@/services/api";
import Image from "next/image";
import RatingStars from "@/components/RatingStars";
import { useToast } from "@/context/ToastContext";

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const movieId = Number(params.id);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);

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

  const handleRate = async (rating: number) => {
    if (!userId) {
      router.push("/login");
      return;
    }
    try {
      await api.rateMovie(parseInt(userId), movieId, rating);
      setUserRating(rating);
      if (rating === 0) {
        toastError("Note retirée");
      } else {
        success(`Film noté ${rating}/5`);

        // Charger les recommandations après une note
        const recs = await api.getRecommendations(parseInt(userId), 6);
        setRecommendations(recs);
      }
    } catch {
      toastError("Erreur lors de la notation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Chargement du film...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white/30 mx-auto mb-6">
            ??
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mt-4 mb-2">Film non trouvé</h1>
          <p className="text-[var(--text-secondary)] mb-8">{error || "Ce film n'existe pas dans notre catalogue."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-amber-700 
                       text-white rounded-xl font-medium hover:opacity-90 
                       transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/25"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  const genres = movie.genres.split("|").filter(Boolean);
  const yearMatch = movie.title.match(/\((\d{4})\)/);
  const year = yearMatch ? yearMatch[1] : "";
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");

  // Générer des couleurs uniques pour le gradient du poster
  const hue1 = ((movie.id * 137.508) % 360);
  const hue2 = ((movie.id * 237.508 + 60) % 360);

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero du film */}
      <div className="bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl overflow-hidden border border-[var(--card-border)]">
        <div className="md:flex">
          {/* Poster avec gradient */}
          <div
            className="md:w-96 h-80 md:h-auto flex items-center justify-center shrink-0 relative"
            style={{
              background: `linear-gradient(135deg, hsla(${hue1}, 60%, 30%, 0.4), hsla(${hue2}, 60%, 40%, 0.3))`,
            }}
          >
            <Image src="/favicon.svg" alt="MovieReco" width={96} height={96} unoptimized className="opacity-60" />
          </div>

          {/* Infos */}
          <div className="p-8 md:p-10 flex-1">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2">
                  {cleanTitle}
                </h1>
                <div className="flex items-center space-x-3 text-sm text-[var(--text-secondary)]">
                  {year && (
                    <>
                      <span>{year}</span>
                      <span className="text-[var(--text-muted)]">•</span>
                    </>
                  )}
                  <span>ID: {movie.id}</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span>{genres.length} genre{genres.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-8">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 rounded-full text-xs font-medium 
                             bg-yellow-500/15 text-yellow-400 
                             border border-yellow-500/20
                             hover:bg-yellow-500/25 transition-colors cursor-default"
                >
                  {genre}
                </span>
              ))}
            </div>

            {/* Notation */}
            <div className="bg-[var(--skeleton-bg)] rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {isAuthenticated ? "Votre note" : "Connectez-vous pour noter"}
                </h3>
                {userRating > 0 && (
                  <span className="text-sm font-medium text-yellow-400">
                    {userRating}/5
                  </span>
                )}
              </div>
              <RatingStars
                initialRating={userRating}
                onRate={handleRate}
                size="lg"
                showLabel
              />
            </div>

            {/* Infos additionnelles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Genres</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">{genres.length}</p>
              </div>
              {year && (
                <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Année</p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{year}</p>
                </div>
              )}
              <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">ID Film</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">#{movie.id}</p>
              </div>
              <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--text-muted)] mb-1">Note des utilisateurs</p>
                <p className="text-lg font-bold text-[var(--text-primary)]">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations basées sur ce film */}
      {recommendations.length > 0 && (
        <section className="animate-fade-in-up animate-delay-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Films similaires
            </h2>
            <span className="text-sm text-[var(--text-muted)]">
              Basés sur vos goûts
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={rec.movie.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <MovieCardSimple movie={rec.movie} predictedRating={rec.predicted_rating} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Retour */}
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center space-x-2 text-[var(--text-secondary)] 
                   hover:text-[var(--text-primary)] transition-colors text-sm group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Retour à l&apos;accueil</span>
      </button>
    </div>
  );
}

// Mini MovieCard pour les recommandations sur la page détail
function MovieCardSimple({ movie, predictedRating }: { movie: Movie; predictedRating?: number }) {
  const router = useRouter();
  const cleanTitle = movie.title.replace(/\s*\(\d{4}\)/, "");
  const genres = movie.genres.split("|").filter(Boolean).slice(0, 2);
  const hue1 = ((movie.id * 137.508) % 360);

  return (
    <div
      className="bg-[var(--card-bg)] rounded-xl overflow-hidden border border-[var(--card-border)]
                 hover:bg-[var(--card-hover)] transition-all duration-300 
                 hover:scale-[1.03] hover:shadow-lg hover:shadow-yellow-500/5 cursor-pointer group"
      onClick={() => router.push(`/movies/${movie.id}`)}
    >
      <div
        className="h-28 flex items-center justify-center relative"
        style={{
          background: `linear-gradient(135deg, hsla(${hue1}, 70%, 40%, 0.3), hsla(${(hue1 + 60) % 360}, 70%, 50%, 0.2))`,
        }}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/40 to-amber-500/40 rounded-xl flex items-center justify-center text-base font-bold text-white/50 group-hover:scale-110 transition-transform duration-300">
          MR
        </div>
        {predictedRating && (
          <div className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-amber-500 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            ★ {predictedRating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[var(--text-primary)] text-sm font-medium truncate group-hover:text-yellow-400 transition-colors">
          {cleanTitle}
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-1 truncate">{genres.join(", ")}</p>
      </div>
    </div>
  );
}
