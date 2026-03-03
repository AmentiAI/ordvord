import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORDVORD — Ordinal Battle Arena",
  description: "Pick your Bitcoin Ordinal. Enter the arena. Destroy your opponent.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
