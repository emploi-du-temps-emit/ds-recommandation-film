"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RecommendationsList from "@/components/RecommendationsList";
import { api, Movie, Rating } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import RatingStars from "@/components/RatingStars";

export default function ProfilePage() {
  const router = useRouter();
  const { success } = useToast();
  const [username, setUsername] = useState("");
  // Type pour une note enrichie avec les infos du film
  interface EnrichedRating extends Rating {
    movie: Movie;
  }

  const [userRatings, setUserRatings] = useState<EnrichedRating[]>([]);
  const [loadingRatings, setLoadingRatings] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const user = localStorage.getItem("username");

    if (!userId) {
      router.push("/login");
      return;
    }

    setUsername(user || "Utilisateur");

    // Charger les notes de l'utilisateur
    const fetchRatings = async () => {
      try {
        const ratings = await api.getUserRatings(parseInt(userId));
        // Enrichir avec les infos des films
        const enriched = await Promise.all(
          ratings.map(async (r): Promise<EnrichedRating | null> => {
            try {
              const movie = await api.getMovie(r.movie_id);
              return { ...r, movie };
            } catch {
              return null;
            }
          })
        );
        setUserRatings(enriched.filter((r): r is EnrichedRating => r !== null));
      } catch {
        // Silently handle
      } finally {
        setLoadingRatings(false);
      }
    };

    fetchRatings();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    success("Vous avez été déconnecté");
    router.push("/");
  };

  const handleRemoveRating = async (movieId: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      await api.rateMovie(parseInt(userId), movieId, 0);
      setUserRatings((prev) => prev.filter((r) => r.movie_id !== movieId));
      success("Note retirée");
    } catch {
      // Silently handle
    }
  };

  const averageRating =
    userRatings.length > 0
      ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
      : "0";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* En-tête du profil amélioré */}
      <div className="bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl p-8 border border-[var(--card-border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/20">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-[var(--background)] rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {username}
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {userRatings.length} film{userRatings.length > 1 ? "s" : ""} noté
                {userRatings.length > 1 ? "s" : ""} &nbsp;•&nbsp; Moyenne : {averageRating}/5
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-500/10 text-red-400 rounded-xl 
                       hover:bg-red-500/20 transition-all duration-200 text-sm font-medium
                       border border-red-500/20 hover:border-red-500/30
                       flex items-center space-x-2 self-start"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-purple-400">{userRatings.length}</span>
            <p className="text-[var(--text-muted)] text-xs mt-1">Notes données</p>
          </div>
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-yellow-400">{averageRating}</span>
            <p className="text-[var(--text-muted)] text-xs mt-1">Note moyenne</p>
          </div>
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-pink-400">
              {userRatings.length >= 3 ? "✓" : userRatings.length}
            </span>
            <p className="text-[var(--text-muted)] text-xs mt-1">/3 pour les recos</p>
          </div>
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-emerald-400">
              {userRatings.length >= 3 ? "✓" : "—"}
            </span>
            <p className="text-[var(--text-muted)] text-xs mt-1">Recommandations</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">Progression recommandations</span>
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {Math.min(userRatings.length, 3)}/3 films notés
            </span>
          </div>
          <div className="h-2 bg-[var(--skeleton-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((userRatings.length / 3) * 100, 100)}%` }}
            />
          </div>
          {userRatings.length < 3 && (
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Notez encore {3 - userRatings.length} film{3 - userRatings.length > 1 ? "s" : ""} pour activer les recommandations
            </p>
          )}
        </div>
      </div>

      {/* Notes récentes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Mes notes
          </h2>
          <span className="text-sm text-[var(--text-muted)]">
            {userRatings.length} film{userRatings.length > 1 ? "s" : ""}
          </span>
        </div>

        {loadingRatings ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 skeleton-pulse rounded-xl" />
            ))}
          </div>
        ) : userRatings.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] mb-2">Aucune note pour le moment</p>
            <Link
              href="/"
              className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
            >
              Parcourir le catalogue →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {userRatings.slice().reverse().map((rating) => {
              const yearMatch = rating.movie?.title.match(/\((\d{4})\)/);
              const cleanTitle = rating.movie?.title.replace(/\s*\(\d{4}\)/, "") || "Film inconnu";
              const genres = rating.movie?.genres.split("|").filter(Boolean) || [];

              return (
                <div
                  key={rating.id}
                  className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)]
                             hover:bg-[var(--card-hover)] transition-all duration-200
                             flex items-center justify-between group"
                >
                  <Link
                    href={`/movies/${rating.movie_id}`}
                    className="flex items-center space-x-4 flex-1 min-w-0"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center text-sm font-bold text-white/60 shrink-0">
                      MR
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--text-primary)] font-medium text-sm truncate group-hover:text-purple-400 transition-colors">
                        {cleanTitle}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                        {genres.slice(0, 2).join(", ")}
                        {yearMatch && ` • ${yearMatch[1]}`}
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center space-x-4 shrink-0">
                    <RatingStars
                      initialRating={rating.rating}
                      onRate={(newRating) => {
                        if (newRating === 0) handleRemoveRating(rating.movie_id);
                        else api.rateMovie(rating.user_id, rating.movie_id, newRating);
                      }}
                      size="sm"
                    />
                    <button
                      onClick={() => handleRemoveRating(rating.movie_id)}
                      className="text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1"
                      aria-label="Retirer la note"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recommandations personnalisées */}
      <RecommendationsList />
    </div>
  );
}
