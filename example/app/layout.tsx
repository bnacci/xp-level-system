import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "xp-level-system — Quest Board Demo",
  description:
    "A live game-dashboard demo built on the xp-level-system npm package: XP, levels, ranks, achievements, prestige and a leaderboard.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
