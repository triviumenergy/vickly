import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "Vickly · Time tracking simple y gratuito",
  description:
    "Vickly te ayuda a vos o a tu equipo a saber en qué se les va el tiempo. 100% gratuito.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${interTight.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
