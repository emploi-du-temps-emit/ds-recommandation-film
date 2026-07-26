"use client";

import axios from "axios";

// Types
export interface Movie {
  id: number;
  title: string;
  genres: string;
  poster_url?: string;
  overview?: string;
  release_year?: number;
}

export interface Rating {
  id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  created_at?: string;
}

export interface MovieRecommendation {
  movie: Movie;
  predicted_rating: number;
  reason: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

// Client Axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'auth
client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercepteur pour gérer les erreurs
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // === Authentification ===
  login: async (email: string, password: string) => {
    const res = await client.post("/login", { email, password });
    return res.data;
  },

  register: async (username: string, email: string, password: string) => {
    const res = await client.post("/users", { username, email, password });
    return res.data;
  },

  // === Films ===
  getMovies: async (skip = 0, limit = 20): Promise<Movie[]> => {
    const res = await client.get(`/movies?skip=${skip}&limit=${limit}`);
    return res.data;
  },

  getMovie: async (id: number): Promise<Movie> => {
    const res = await client.get(`/movies/${id}`);
    return res.data;
  },

  searchMovies: async (query: string): Promise<Movie[]> => {
    const res = await client.get(`/movies?skip=0&limit=10`);
    // Note: à améliorer avec une vraie route de recherche
    return res.data.filter((m: Movie) =>
      m.title.toLowerCase().includes(query.toLowerCase())
    );
  },

  // === Évaluations ===
  rateMovie: async (userId: number, movieId: number, rating: number) => {
    const res = await client.post("/ratings", {
      user_id: userId,
      movie_id: movieId,
      rating,
    });
    return res.data;
  },

  // === Recommandations ===
  getRecommendations: async (
    userId: number,
    n = 5
  ): Promise<MovieRecommendation[]> => {
    const res = await client.get(`/recommendations/${userId}?n=${n}`);
    return res.data;
  },

  // === Stats ===
  getStats: async () => {
    const res = await client.get("/stats");
    return res.data;
  },
};
