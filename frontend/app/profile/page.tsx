"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

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

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="bg-[var(--card-bg)] backdrop-blur-lg rounded-2xl p-8 border border-[var(--card-border)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-20 h-20 bg-[var(--color-1)] rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-[var(--color-1)]/20">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-[var(--background)] rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                {username}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
