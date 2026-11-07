import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "xp-level-system — Your next level",
  description:
    "Build progression experiences with TypeScript: an interactive playground, integration examples, XP curves, achievements, and prestige.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
