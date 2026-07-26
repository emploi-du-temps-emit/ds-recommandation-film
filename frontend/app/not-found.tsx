import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in-up max-w-lg">
        {/* Animated icon */}
        <div className="relative mx-auto w-32 h-32">
          <div className="w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center text-5xl font-bold text-white/30 mx-auto relative z-10 backdrop-blur-sm">
            ?
          </div>
          {/* Orbiting dots */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "10s", animationDirection: "reverse" }}>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s" }}>
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>

        <div>
          <h1 className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
            404
          </h1>
          <h2 className="text-2xl text-[var(--text-primary)] font-semibold mt-2">
            Page non trouvée
          </h2>
        </div>

        <p className="text-[var(--text-secondary)] leading-relaxed">
          Ce film n&apos;existe pas dans notre catalogue... ou peut-être que
          vous vous êtes perdu en chemin dans les méandres du Machine Learning ?
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                       text-white rounded-xl font-medium hover:opacity-90 
                       transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25
                       active:scale-95"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] 
                       rounded-xl font-medium border border-[var(--card-border)]
                       hover:bg-[var(--card-hover)] transition-all duration-200
                       active:scale-95"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
