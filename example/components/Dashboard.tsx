"use client";

import { usePlayer } from "@/lib/usePlayer";
import { PlayerCard } from "./PlayerCard";
import { QuestList } from "./QuestList";
import { ControlPanel } from "./ControlPanel";
import { AchievementGrid } from "./AchievementGrid";
import { Leaderboard } from "./Leaderboard";
import { ToastFeed } from "./ToastFeed";

export default function Dashboard() {
  const { player, events, gainXP, prestige, canPrestige, reset } = usePlayer();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-violet-400">
            xp-level-system
          </p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Quest Board Demo</h1>
        </div>
        <a
          href="https://www.npmjs.com/package/xp-level-system"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          View on npm ↗
        </a>
      </header>

      <PlayerCard info={player.progress} rank={player.rank} prestigeLevel={player.prestigeLevel} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col gap-6">
          <QuestList onComplete={gainXP} />
          <ControlPanel canPrestige={canPrestige} onPrestige={prestige} onReset={reset} />
          <AchievementGrid
            unlocked={player.getUnlockedAchievements()}
            locked={player.getLockedAchievements()}
            completionPercent={player.getAchievementCompletionPercent()}
          />
        </div>

        <Leaderboard xpSystem={player.xp} playerTotalXP={player.totalXP} />
      </div>

      <ToastFeed events={events} />

      <footer className="mt-6 text-center text-xs text-slate-500">
        Built with{" "}
        <a
          className="underline hover:text-slate-300"
          href="https://www.npmjs.com/package/xp-level-system"
          target="_blank"
          rel="noreferrer"
        >
          xp-level-system
        </a>{" "}
        — a zero-dependency XP, leveling, ranks, achievements &amp; prestige engine for
        TypeScript. Progress is saved to your browser&apos;s local storage.
      </footer>
    </main>
  );
}
