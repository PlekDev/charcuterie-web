import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Newsreader, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { SessionInit } from "@/components/auth/session-init";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-headline",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-label",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Charcutería Gourmet | Quesos y Embutidos Premium",
  description:
      "Descubre nuestra selección de quesos artesanales, jamones ibéricos, embutidos premium y tablas gourmet para cualquier ocasión.",
  keywords: [
    "Charcutería",
    "Quesos",
    "Jamón Serrano",
    "Embutidos",
    "Tablas Gourmet",
    "Productos Artesanales"
  ],
  authors: [{ name: "Charcutería Gourmet" }],
  openGraph: {
    title: "Charcutería Gourmet | Quesos y Embutidos Premium",
    description:
        "Los mejores quesos, jamones y embutidos seleccionados para nuestros clientes.",
    siteName: "Charcutería Gourmet",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${newsreader.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        <SessionInit />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
