"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { AlertCircle, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Veuillez entrer un email valide");
      return;
    }
    if (password.length < 3) {
      setError("Mot de passe trop court");
      return;
    }

    setLoading(true);

    try {
      const res = await api.login(email, password);
      localStorage.setItem("token", res.access_token);
      localStorage.setItem("userId", String(res.user_id));
      localStorage.setItem("username", res.username);
      success(`Bienvenue ${res.username} !`);
      router.push("/");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Email ou mot de passe incorrect";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in-up">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Connexion</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Connectez-vous pour découvrir vos recommandations
          </p>
        </div>

        {/* Card */}
        <div className="bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-[var(--card-border)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 animate-scale-in">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] 
                             rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                             focus:outline-none focus:border-[var(--input-focus)] 
                             focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all"
                  placeholder="votre@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] 
                             rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                             focus:outline-none focus:border-[var(--input-focus)] 
                             focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] 
                             hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[var(--color-2)] 
                         text-white rounded-xl font-medium hover:opacity-90 
                         transition-all duration-200 disabled:opacity-50
                         hover:shadow-lg hover:shadow-[var(--color-1)]/25
                         active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion...</span>
                </span>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-[var(--color-1)] hover:text-[var(--color-1)] underline font-medium transition-colors"
          >
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
