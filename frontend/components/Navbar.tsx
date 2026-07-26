"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Vérifier l'authentification
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Détecter le scroll
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gray-900/95 backdrop-blur-md shadow-lg shadow-purple-900/20"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🎬</span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MovieReco
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Accueil
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all text-sm"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 hover:text-purple-300 transition-all text-sm"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
