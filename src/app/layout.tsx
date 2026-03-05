import type { Metadata } from "next";
import { Orbitron, Space_Grotesk } from "next/font/google";
import "./globals.css";
import LaserEyesWrapper from "@/providers/LaserEyesWrapper";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ORDVORD — Ordinal Battle Arena",
  description: "Pick your Bitcoin Ordinal. Enter the arena. Destroy your opponent.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        <LaserEyesWrapper>{children}</LaserEyesWrapper>
      </body>
    </html>
  );
}
