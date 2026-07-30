"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, Movie, Rating } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { Check, LogOut, Star, Film } from "lucide-react";

interface EnrichedRating extends Rating {
  movie: Movie;
}

export default function ProfilePage() {
  const router = useRouter();
  const { success } = useToast();
  const [username, setUsername] = useState("");
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

    const fetchRatings = async () => {
      try {
        const ratings = await api.getUserRatings(parseInt(userId));
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
    success("Vous avez ete deconnecte");
    router.push("/");
  };

  const averageRating =
    userRatings.length > 0
      ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
      : "0";

  const totalRatings = userRatings.length;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* En-tete du profil */}
      <div className="bg-[var(--card-bg)] rounded-2xl p-6 border border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-[var(--color-1)] rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{username}</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {totalRatings} film{totalRatings > 1 ? "s" : ""} note{totalRatings > 1 ? "s" : ""} &bull; Moyenne : {averageRating}/5
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center space-x-1.5 border border-red-200 hover:border-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Deconnexion</span>
          </button>
        </div>

        {/* Stats minimales */}
        {totalRatings > 0 && (
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-[var(--card-border)]">
            <div className="flex items-center space-x-2 text-sm">
              <Star className="w-4 h-4 text-[var(--color-1)]" />
              <span className="text-[var(--text-secondary)]">{averageRating}/5 moyenne</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Film className="w-4 h-4 text-[var(--color-1)]" />
              <span className="text-[var(--text-secondary)]">{totalRatings} film{totalRatings > 1 ? "s" : ""}</span>
            </div>
          </div>
        )}
      </div>

      {/* Historique des notes */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
          Mes notes
        </h2>

        {loadingRatings ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 skeleton-pulse rounded-xl" />
            ))}
          </div>
        ) : userRatings.length === 0 ? (
          <div className="text-center py-10 bg-[var(--card-bg)] rounded-xl border border-[var(--card-border)]">
            <div className="w-12 h-12 bg-[var(--color-1)]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm mb-3">Aucune note pour le moment</p>
            <Link
              href="/"
              className="text-sm text-[var(--color-1)] hover:underline font-medium"
            >
              Parcourir le catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {userRatings.slice().reverse().map((rating) => {
              const yearMatch = rating.movie?.title.match(/\((\d{4})\)/);
              const cleanTitle = rating.movie?.title.replace(/\s*\(\d{4}\)/, "") || "Film inconnu";
              const genres = rating.movie?.genres.split("|").filter(Boolean) || [];

              return (
                <Link
                  key={rating.id}
                  href={`/movies/${rating.movie_id}`}
                  className="flex items-center justify-between bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--card-border)] hover:bg-[var(--card-hover)] transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {rating.movie?.poster_url ? (
                      <img
                        src={rating.movie.poster_url}
                        alt={cleanTitle}
                        className="w-10 h-14 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-[var(--color-1)]/20 rounded-lg flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
                        MR
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--color-1)] transition-colors">
                        {cleanTitle}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {genres.slice(0, 2).join(", ")}
                        {yearMatch && ` \u2022 ${yearMatch[1]}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0 ml-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-sm ${star <= rating.rating ? "text-[var(--color-1)]" : "text-gray-200"}`}
                      >
                        {'★'}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
