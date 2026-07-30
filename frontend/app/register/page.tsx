"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useToast } from "@/context/ToastContext";
import { AlertCircle, User, Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Force du mot de passe
  const getPasswordStrength = (pwd: string): { label: string; color: string; width: string } => {
    if (pwd.length === 0) return { label: "", color: "", width: "0%" };
    if (pwd.length < 6) return { label: "Faible", color: "bg-red-500", width: "25%" };
    if (pwd.length < 8) return { label: "Moyen", color: "bg-yellow-500", width: "50%" };
    if (/(?=.*[A-Z])(?=.*[0-9])/.test(pwd)) return { label: "Fort", color: "bg-green-500", width: "100%" };
    return { label: "Bien", color: "bg-blue-500", width: "75%" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.length < 3) {
      setError("Le nom d'utilisateur doit contenir au moins 3 caractères");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      // 1. Créer le compte
      const user = await api.register(username, email, password);

      // 2. Auto-login avec JWT
      const loginRes = await api.login(email, password);
      localStorage.setItem("token", loginRes.access_token);
      localStorage.setItem("userId", String(loginRes.user_id));
      localStorage.setItem("username", loginRes.username);

      success(`Bienvenue ${loginRes.username} !`);
      router.push("/");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Erreur lors de l'inscription";
      setError(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in-up">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-1)] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-lg shadow-[var(--color-1)]/20 mb-4">
            MR
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Inscription</h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Créez votre compte pour commencer
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
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full pl-11 pr-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] 
                             rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                             focus:outline-none focus:border-[var(--input-focus)] 
                             focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all"
                  placeholder="JeanDupont"
                  autoComplete="username"
                />
              </div>
            </div>

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
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] 
                             rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                             focus:outline-none focus:border-[var(--input-focus)] 
                             focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all"
                  placeholder="Au moins 6 caractères"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] 
                             hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 animate-fade-in-down">
                  <div className="h-1.5 bg-[var(--skeleton-bg)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${password.length < 6 ? "text-red-400" : "text-green-400"}`}>
                    {strength.label}
                    {password.length < 6 && ` (${password.length}/6 min)`}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <ShieldCheck className={`w-5 h-5 ${passwordsMatch ? "text-green-400" : "text-[var(--text-muted)]"}`} />
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full pl-11 pr-12 py-3 bg-[var(--input-bg)] border 
                             rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)]
                             focus:outline-none focus:border-[var(--input-focus)] 
                             focus:ring-2 focus:ring-[var(--input-focus)]/20 transition-all
                             ${!passwordsMatch && confirmPassword.length > 0 ? "border-red-500" : "border-[var(--input-border)]"}`}
                  placeholder="Répétez le mot de passe"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] 
                             hover:text-[var(--text-primary)] transition-colors"
                  aria-label={showConfirm ? "Masquer" : "Afficher"}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-xs text-red-400 mt-1 animate-fade-in-down">Les mots de passe ne correspondent pas</p>
              )}
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
                  <span>Inscription...</span>
                </span>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--text-secondary)] text-sm mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="text-[var(--color-1)] hover:text-[var(--color-1)] underline font-medium transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
