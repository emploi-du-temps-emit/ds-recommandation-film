"use client";

import { useState, useEffect } from "react";
import { api, MovieRecommendation } from "@/services/api";
import MovieCard from "./MovieCard";

export default function RecommendationsList() {
  const [recommendations, setRecommendations] = useState<
    MovieRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecs = async () => {
      try {
        const recs = await api.getRecommendations(parseInt(userId), 5);
        setRecommendations(recs);
      } catch (err: any) {
        if (err.response?.status === 400) {
          setError("Notez au moins 3 films pour obtenir des recommandations.");
        } else {
          setError("Impossible de charger les recommandations.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, []);

  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  if (!userId) return null;

  if (loading) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Pour vous
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="h-48 skeleton-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 skeleton-pulse rounded" />
                <div className="h-3 w-1/2 skeleton-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
          Recommandations
        </h2>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-center animate-scale-in">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Recommandé pour vous
        </h2>
        <span className="text-xs text-[var(--text-muted)] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
          IA • Prédictions personnalisées
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {recommendations.map((rec, index) => (
          <div
            key={rec.movie.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <MovieCard
              movie={rec.movie}
              predictedRating={rec.predicted_rating}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
