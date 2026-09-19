import type { LevelInfo, RankInfo } from "xp-level-system";
import { XPBar } from "./XPBar";
import { RankBadge } from "./RankBadge";

export function PlayerCard({
  info,
  rank,
  prestigeLevel,
}: {
  info: LevelInfo;
  rank: RankInfo | null;
  prestigeLevel: number;
}) {
  return (
    <div className="panel rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-center gap-5">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/30 to-cyan-400/20 text-4xl ring-1 ring-white/10">
          🧙
          <span className="absolute -bottom-2 -right-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-ink-950 bg-violet-500 px-1 text-xs font-bold text-white shadow-glow">
            {info.level}
          </span>
        </div>

        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl font-bold tracking-wide text-shimmer">Hero</h2>
            <RankBadge rank={rank} />
            {prestigeLevel > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                ⭐ Prestige {prestigeLevel}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {info.totalXP.toLocaleString()} XP total
            {info.isMaxLevel ? " — max level reached" : ` • Level ${info.level} → ${info.nextLevel}`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <XPBar info={info} />
      </div>
    </div>
  );
}
