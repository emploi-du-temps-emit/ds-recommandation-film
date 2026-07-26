import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MovieReco - Système de recommandation de films",
  description:
    "Découvrez des films personnalisés grâce à notre système de recommandation basé sur l'intelligence artificielle.",
  keywords: ["films", "recommandation", "machine learning", "cinéma", "IA"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 text-white">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-white/10 py-6 text-center text-sm text-gray-500">
          <p>MovieReco &copy; {new Date().getFullYear()} - Propulsé par l&apos;IA</p>
        </footer>
      </body>
    </html>
  );
}
