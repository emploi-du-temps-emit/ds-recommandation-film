"use client";

import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-xl 
                 bg-[var(--color-2)] 
                 text-white shadow-lg shadow-[var(--color-1)]/25
                 flex items-center justify-center
                 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-[var(--color-1)]/40
                 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
      aria-label="Retour en haut"
    >
      <ChevronUp className="w-5 h-5" strokeWidth={2.5} />
    </button>
  );
}
