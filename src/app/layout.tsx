// src/app/layout.tsx
import type { Metadata } from "next";
import { Syne, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-dm-serif",
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "SIBA Academic Repository",
    template: "%s — SIBA Repository",
  },
  description:
    "The official academic resource repository for SIBA students. Access notes, slides, books, past papers, and assignments for all programs.",
  keywords: ["SIBA", "academic", "repository", "BBA", "THP", "study materials"],
  openGraph: {
    title: "SIBA Academic Repository",
    description: "Access academic resources for BBA and THP programs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSerif.variable} ${jetbrains.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
