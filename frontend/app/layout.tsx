import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/ToastContainer";
import ScrollToTop from "@/components/ScrollToTop";

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
      data-theme="dark"
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--text-primary)]">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="border-t border-[var(--footer-border)] py-8 text-center text-sm text-[var(--text-muted)]">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-[var(--color-1)] rounded-md flex items-center justify-center text-[8px] font-bold text-white">MR</div>
                    <span className="font-medium text-[var(--color-1)]">
                      MovieReco
                    </span>
                  </div>
                  <p>
                    &copy; {new Date().getFullYear()} - Propulsé par l&apos;IA &amp; le Machine Learning
                  </p>
                  <div className="flex items-center space-x-4 text-[var(--text-muted)]">
                    <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">À propos</span>
                    <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Confidentialité</span>
                    <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Contact</span>
                  </div>
                </div>
              </div>
            </footer>
            <ToastContainer />
            <ScrollToTop />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
