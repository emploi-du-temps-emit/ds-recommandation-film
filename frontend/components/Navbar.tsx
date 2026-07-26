"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsAuthenticated(!!token);
    };
    checkAuth();

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navLinks = (
    <>
      <Link
        href="/"
        onClick={closeMobile}
        className="text-gray-300 hover:text-white transition-colors"
      >
        Accueil
      </Link>
      {isAuthenticated ? (
        <>
          <Link
            href="/profile"
            onClick={closeMobile}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Mon profil
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg 
                       hover:bg-red-600/30 transition-all text-sm w-full md:w-auto"
          >
            Déconnexion
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={closeMobile}
          className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg 
                     hover:bg-purple-600/30 hover:text-purple-300 transition-all text-sm 
                     text-center"
        >
          Connexion
        </Link>
      )}
    </>
  );

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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">MR</div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              MovieReco
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-fade-in-up">
            <div className="flex flex-col space-y-3 pt-2 border-t border-white/10">
              {navLinks}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
