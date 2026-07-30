"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("username");
      setIsAuthenticated(!!token);
      setUsername(user || "");
    };
    checkAuth();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Fermer le menu mobile au changement de page
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--nav-bg)] backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity group"
          >
            <div className="w-9 h-9 bg-[var(--color-1)] rounded-xl flex items-center justify-center text-xs font-bold text-white group-hover:scale-110 transition-transform duration-300">
              MR
            </div>
            <span className="text-[var(--color-1)] font-bold">
              MovieReco
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-[var(--color-1)]/15 text-[var(--color-1)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--color-1)]/10 hover:text-[var(--color-1)]"
              }`}
            >
              Accueil
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive("/profile")
                      ? "bg-[var(--color-1)]/15 text-[var(--color-1)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                  }`}
                >
                  Mon profil
                </Link>

                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-[var(--card-border)]">
                  <div className="w-8 h-8 bg-[var(--color-1)] rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {username ? username.charAt(0).toUpperCase() : "?"}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 font-medium"
                  >
                    Déconnexion
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-[var(--card-border)]">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium bg-[var(--color-2)] 
                             text-white rounded-lg hover:opacity-90 transition-all duration-200
                             hover:shadow-lg hover:shadow-[var(--color-1)]/25"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-5 animate-fade-in-down">
            <div className="flex flex-col space-y-2 pt-4 border-t border-[var(--card-border)]">
              <Link
                href="/"
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive("/")
                    ? "bg-[var(--color-1)]/15 text-[var(--color-1)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--color-1)]/10 hover:text-[var(--color-1)]"
                }`}
              >
                Accueil
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive("/profile")
                        ? "bg-[var(--color-1)]/15 text-[var(--color-1)]"
                        : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Mon profil
                  </Link>
                  <div className="flex items-center space-x-3 px-4 py-3 mt-2 border-t border-[var(--card-border)]">
                    <div className="w-8 h-8 bg-[var(--color-1)] rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {username ? username.charAt(0).toUpperCase() : "?"}
                    </div>
                    <span className="text-sm text-[var(--text-primary)] flex-1">{username}</span>
                  
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-4 pt-4 mt-2 border-t border-[var(--card-border)]">
                  <Link
                    href="/login"
                    className="w-full text-center px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="w-full text-center px-4 py-2.5 text-sm font-medium bg-[var(--color-2)] text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    S&apos;inscrire
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
