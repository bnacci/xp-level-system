import { buildLeaderboard } from "xp-level-system";
import type { XPSystem } from "xp-level-system";
import { RIVAL_PLAYERS } from "@/lib/gameConfig";

export function Leaderboard({
  xpSystem,
  playerTotalXP,
}: {
  xpSystem: XPSystem;
  playerTotalXP: number;
}) {
  const board = buildLeaderboard(
    [...RIVAL_PLAYERS, { id: "you", name: "You", totalXP: playerTotalXP, avatar: "🧙" }],
    xpSystem
  );

  return (
    <div className="panel rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold text-slate-100">Leaderboard</h3>
      <ul className="mt-4 space-y-1.5">
        {board.map((entry) => (
          <li
            key={entry.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
              entry.id === "you"
                ? "bg-violet-500/15 ring-1 ring-violet-400/40"
                : "bg-white/[0.02]"
            }`}
          >
            <span className="w-6 shrink-0 text-center font-display font-bold text-slate-400">
              #{entry.position}
            </span>
            <span className="text-lg">{entry.avatar}</span>
            <span className="flex-1 truncate font-medium text-slate-100">{entry.name}</span>
            <span className="text-xs text-slate-400">Lv.{entry.level}</span>
            <span className="w-16 shrink-0 text-right text-xs font-semibold text-violet-300">
              {entry.totalXP.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
