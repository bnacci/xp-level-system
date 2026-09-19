import type { LevelInfo } from "xp-level-system";

export function XPBar({ info }: { info: LevelInfo }) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="font-display text-sm tracking-wide text-slate-300">
          {info.isMaxLevel
            ? "MAX LEVEL"
            : `${info.currentXP.toLocaleString()} / ${info.xpToNextLevel.toLocaleString()} XP`}
        </span>
        <span className="text-xs text-slate-400">{info.progressPercent}%</span>
      </div>
      <div className="xp-bar-track relative h-4 w-full overflow-hidden rounded-full">
        <div
          className={`xp-bar-fill h-full animate-shimmer rounded-full transition-[width] duration-700 ease-out ${
            info.isMaxLevel ? "is-max" : ""
          }`}
          style={{ width: `${Math.max(info.progressPercent, info.totalXP > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}
