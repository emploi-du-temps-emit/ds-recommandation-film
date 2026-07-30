"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RecommendationsList from "@/components/RecommendationsList";
import { api, Movie, Rating } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import RatingStars from "@/components/RatingStars";
import { Check, LogOut, Star, Trash2 } from "lucide-react";

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
              <div className="w-20 h-20 bg-[var(--color-1)] rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[var(--color-1)]/20">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-[var(--background)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
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
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-[var(--color-1)]">{userRatings.length}</span>
            <p className="text-[var(--text-muted)] text-xs mt-1">Notes données</p>
          </div>
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-yellow-400">{averageRating}</span>
            <p className="text-[var(--text-muted)] text-xs mt-1">Note moyenne</p>
          </div>
          <div className="bg-[var(--skeleton-bg)] rounded-xl p-4 text-center">
            <span className="text-2xl font-bold text-[var(--color-2)]">
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
              className="h-full bg-[var(--color-1)] rounded-full transition-all duration-1000"
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
            <div className="w-16 h-16 bg-[var(--color-1)]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] mb-2">Aucune note pour le moment</p>
            <Link
              href="/"
              className="text-[var(--color-1)] hover:text-[var(--color-3)] text-sm font-medium transition-colors"
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
                    <div className="w-12 h-12 bg-[var(--color-1)]/30 rounded-xl flex items-center justify-center text-sm font-bold text-white/60 shrink-0">
                      MR
                    </div>
                    <div className="min-w-0">
                      <p className="text-[var(--text-primary)] font-medium text-sm truncate group-hover:text-[var(--color-1)] transition-colors">
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
                      <Trash2 className="w-4 h-4" />
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
