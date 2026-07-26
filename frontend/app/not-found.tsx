import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in-up">
        <span className="text-8xl block">🎬</span>
        <h1 className="text-6xl font-bold text-white">404</h1>
        <h2 className="text-2xl text-gray-300">Page non trouvée</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Ce film n&apos;existe pas dans notre catalogue... ou peut-être que
          vous vous êtes perdu en chemin ?
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 
                     text-white rounded-xl font-medium hover:opacity-90 
                     transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
