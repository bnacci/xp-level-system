import { XPSystem } from "./XPSystem";
import { LeaderboardEntry, RankedLeaderboardEntry } from "./types";

/**
 * Sorts entries by `totalXP` (descending) and assigns each a `position`
 * (1-based, standard competition ranking — ties share the same position
 * and the next position skips accordingly, e.g. `1, 2, 2, 4`) plus its
 * derived `level` from the given `XPSystem`.
 *
 * Pure function — does not mutate `entries`.
 *
 * @example
 * ```ts
 * const sys = new XPSystem({ baseXP: 100 });
 * const board = buildLeaderboard(
 *   [{ id: "a", totalXP: 900 }, { id: "b", totalXP: 1600 }],
 *   sys
 * );
 * // [{ id: "b", totalXP: 1600, position: 1, level: 5 },
 * //  { id: "a", totalXP: 900,  position: 2, level: 4 }]
 * ```
 */
export function buildLeaderboard<T extends LeaderboardEntry>(
  entries: T[],
  xpSystem: XPSystem
): RankedLeaderboardEntry<T>[] {
  const sorted = [...entries].sort((a, b) => b.totalXP - a.totalXP);

  let lastXP: number | null = null;
  let lastPosition = 0;

  return sorted.map((entry, index) => {
    if (lastXP === null || entry.totalXP !== lastXP) {
      lastPosition = index + 1;
      lastXP = entry.totalXP;
    }
    return {
      ...entry,
      position: lastPosition,
      level: xpSystem.levelFromXP(entry.totalXP),
    };
  });
}
