import type { Metadata } from "next";
import "./globals.css";
import LaserEyesWrapper from "@/providers/LaserEyesWrapper";

export const metadata: Metadata = {
  title: "ORDVORD — Ordinal Battle Arena",
  description: "Pick your Bitcoin Ordinal. Enter the arena. Destroy your opponent.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LaserEyesWrapper>{children}</LaserEyesWrapper>
      </body>
    </html>
  );
}
