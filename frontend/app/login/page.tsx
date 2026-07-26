"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(email, password);
      localStorage.setItem("token", "authenticated");
      localStorage.setItem("userId", String(res.user_id));
      localStorage.setItem("username", res.username);
      router.push("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10">
        <div className="text-center mb-8">
          <span className="text-4xl">🎬</span>
          <h1 className="text-2xl font-bold text-white mt-2">Connexion</h1>
          <p className="text-gray-400 text-sm">
            Connectez-vous pour découvrir vos recommandations
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-3 mb-6">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="votre@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 
                         focus:ring-2 focus:ring-purple-500/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white rounded-lg font-medium hover:opacity-90 
                       transition-all duration-200 disabled:opacity-50
                       hover:shadow-lg hover:shadow-purple-500/25"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
