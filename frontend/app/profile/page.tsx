"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RecommendationsList from "@/components/RecommendationsList";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const user = localStorage.getItem("username");

    if (!userId) {
      router.push("/login");
      return;
    }

    setUsername(user || "Utilisateur");
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    router.push("/");
  };

  return (
    <div className="space-y-10">
      {/* En-tête du profil */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Bienvenue, {username}
              </h1>
              <p className="text-gray-400 text-sm">
                Notez des films pour obtenir des recommandations personnalisées
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg 
                       hover:bg-red-600/30 transition-all text-sm"
          >
            Déconnexion
          </button>
        </div>

        {/* Quick tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <span className="text-2xl text-yellow-400">★</span>
            <p className="text-gray-300 text-sm mt-1">Notez 3+ films</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <span className="text-2xl text-purple-400">◆</span>
            <p className="text-gray-300 text-sm mt-1">L&apos;IA analyse</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <span className="text-2xl text-pink-400">▶</span>
            <p className="text-gray-300 text-sm mt-1">Recommandations</p>
          </div>
        </div>
      </div>

      {/* Recommandations personnalisées */}
      <RecommendationsList />
    </div>
  );
}
