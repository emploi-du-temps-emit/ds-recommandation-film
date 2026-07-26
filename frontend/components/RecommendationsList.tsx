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
        <h2 className="text-3xl font-bold text-white mb-6">🎯 Pour vous</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="text-3xl font-bold text-white mb-6">🎯 Pour vous</h2>
        <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 text-center">
          <p className="text-yellow-400 text-sm">{error}</p>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">🎯 Recommandé pour vous</h2>
        <span className="text-sm text-gray-500">
          Basé sur vos évaluations
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
