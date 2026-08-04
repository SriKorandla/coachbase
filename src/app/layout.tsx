import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { AppNav } from "@/components/AppNav";
import { CoachProvider } from "@/lib/coach-context";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coachbase",
  description: "Coach-facing PT client roster, check-ins, and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${syne.variable} ${figtree.variable} h-full`}>
      <body className="min-h-full antialiased">
        <CoachProvider>
          <AppNav />
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            {children}
          </main>
        </CoachProvider>
      </body>
    </html>
  );
}
