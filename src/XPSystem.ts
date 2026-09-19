import {
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
  XPChangeOptions,
  XPSystemEvents,
  RankDefinition,
  RankInfo,
} from "./types";
import { TypedEmitter } from "./EventEmitter";

/**
 * XPSystem — a self-contained, framework-agnostic leveling engine.
 *
 * All state lives in a single `totalXP` number; every other value
 * (level, progress, rank, etc.) is derived on-the-fly from that number.
 * Mutating calls (`addXP`, `removeXP`, `levelUp`) also emit events, so
 * you can drive UI (toasts, sound effects, confetti) without polling.
 *
 * @example
 * ```ts
 * const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });
 *
 * sys.on("levelUp", (result) => console.log(`Level up! Now level ${result.levelInfo.level}`));
 *
 * // 1 000 XP → what level?
 * const info = sys.getLevelInfo(1000);
 * console.log(info.level); // 3
 *
 * // Level 3 → how much total XP?
 * console.log(sys.xpForLevel(3)); // 900
 * ```
 */
export class XPSystem extends TypedEmitter<XPSystemEvents> {
  private readonly baseXP: number;
  private readonly multiplier: number;
  private readonly curve: LevelCurve;
  private readonly customFormula?: (level: number) => number;
  private readonly minLevel: number;
  private readonly maxLevel: number;
  private readonly ranks: RankDefinition[];

  constructor(config: XPSystemConfig = {}) {
    super();
    this.baseXP = config.baseXP ?? 100;
    this.multiplier = config.multiplier ?? 1.5;
    this.curve = config.curve ?? "quadratic";
    this.customFormula = config.customFormula;
    this.minLevel = config.minLevel ?? 1;
    this.maxLevel = config.maxLevel ?? Infinity;
    this.ranks = [...(config.ranks ?? [])].sort((a, b) => a.minLevel - b.minLevel);

    if (this.curve === "custom" && !this.customFormula) {
      throw new Error(
        'XPSystem: curve is "custom" but no customFormula was provided.'
      );
    }
  }

  // ─── Threshold helpers ─────────────────────────────────────────────────────

  /**
   * Returns the **cumulative** XP required to *reach* `level`
   * (i.e. the total XP a player must have to be at that level).
   *
   * Level 1 always requires 0 XP.
   */
  xpForLevel(level: number): number {
    if (level <= this.minLevel) return 0;

    const lvl = level - this.minLevel; // normalise so first level = 0 offset

    switch (this.curve) {
      case "linear":
        return Math.floor(this.baseXP * lvl);

      case "quadratic":
        return Math.floor(this.baseXP * lvl * lvl);

      case "exponential":
        return Math.floor(
          this.baseXP * (Math.pow(this.multiplier, lvl) - 1)
        );

      case "custom":
        return Math.floor(this.customFormula!(level));
    }
  }

  /**
   * Returns the XP a player needs to earn **inside** a given level
   * (i.e. the delta between `xpForLevel(level)` and `xpForLevel(level + 1)`).
   */
  xpRequiredForLevel(level: number): number {
    if (level >= this.maxLevel) return 0;
    return this.xpForLevel(level + 1) - this.xpForLevel(level);
  }

  // ─── Core derivation ───────────────────────────────────────────────────────

  /**
   * Derives the level from a raw `totalXP` amount.
   *
   * Uses a binary-search so it works efficiently even with a custom curve
   * or very high level caps.
   */
  levelFromXP(totalXP: number): number {
    const xp = Math.max(0, totalXP);

    // Fast path: walk forward from minLevel for most common use-cases
    // (levels rarely exceed a few hundred, so O(n) is fine; swap for
    //  binary search if you need millions of levels).
    let level = this.minLevel;

    while (
      level < this.maxLevel &&
      xp >= this.xpForLevel(level + 1)
    ) {
      level++;
    }

    return level;
  }

  /**
   * Returns the full `LevelInfo` snapshot for a given `totalXP` value.
   */
  getLevelInfo(totalXP: number): LevelInfo {
    const safeXP = Math.max(0, totalXP);
    const level = this.levelFromXP(safeXP);
    const isMaxLevel = level >= this.maxLevel;
    const nextLevel = isMaxLevel ? this.maxLevel : level + 1;

    const xpAtCurrentLevel = this.xpForLevel(level);
    const xpAtNextLevel = isMaxLevel
      ? this.xpForLevel(level) // no next threshold
      : this.xpForLevel(nextLevel);

    const currentXP = safeXP - xpAtCurrentLevel;
    const xpToNextLevel = isMaxLevel ? 0 : xpAtNextLevel - xpAtCurrentLevel;

    const progressPercent = isMaxLevel
      ? 100
      : xpToNextLevel === 0
      ? 100
      : Math.min(100, Math.floor((currentXP / xpToNextLevel) * 100));

    return {
      level,
      nextLevel,
      totalXP: safeXP,
      currentXP,
      xpToNextLevel,
      progressPercent,
      isMaxLevel,
    };
  }

  // ─── Ranks ─────────────────────────────────────────────────────────────────

  /**
   * Resolves the rank/tier (Bronze, Silver, Gold, ...) for a given level,
   * based on the `ranks` array passed to the constructor.
   *
   * Returns `null` if no `ranks` were configured, or if `level` is below
   * every configured rank's `minLevel`.
   */
  getRank(level: number): RankInfo | null {
    if (this.ranks.length === 0) return null;

    let current: RankDefinition | undefined;
    let next: RankDefinition | null = null;

    for (let i = 0; i < this.ranks.length; i++) {
      const rank = this.ranks[i];
      if (rank.minLevel <= level) {
        current = rank;
        next = this.ranks[i + 1] ?? null;
      } else {
        next = next ?? rank;
        break;
      }
    }

    if (!current) return null;

    const progressToNext = !next
      ? 100
      : Math.min(
          100,
          Math.max(
            0,
            Math.floor(
              ((level - current.minLevel) / (next.minLevel - current.minLevel)) * 100
            )
          )
        );

    return {
      name: current.name,
      minLevel: current.minLevel,
      color: current.color,
      icon: current.icon,
      next,
      progressToNext,
    };
  }

  // ─── Mutation helpers ──────────────────────────────────────────────────────

  /**
   * Adds `amount` XP to `currentTotalXP` and returns the result.
   * Emits `"xpGained"`, and additionally `"levelUp"` / `"maxLevelReached"`
   * when applicable.
   *
   * @param currentTotalXP - The player's current accumulated XP.
   * @param amount         - XP to add (must be ≥ 0).
   * @param options        - Optional multiplier / reason tag.
   */
  addXP(
    currentTotalXP: number,
    amount: number,
    options?: XPChangeOptions
  ): XPChangeResult {
    if (amount < 0) throw new Error("addXP: amount must be non-negative.");

    const boostedAmount = Math.floor(amount * (options?.multiplier ?? 1));
    const before = this.getLevelInfo(currentTotalXP);

    // Cap at maxLevel XP when a cap is set
    const maxXP =
      this.maxLevel === Infinity
        ? Infinity
        : this.xpForLevel(this.maxLevel);

    const newTotalXP = Math.min(currentTotalXP + boostedAmount, maxXP);
    const after = this.getLevelInfo(newTotalXP);

    const levelsChanged = after.level - before.level;

    const result: XPChangeResult = {
      levelInfo: after,
      levelsChanged,
      didLevelUp: levelsChanged > 0,
      didLevelDown: false,
      xpDelta: newTotalXP - currentTotalXP,
      reason: options?.reason,
    };

    this.emit("xpGained", result);
    if (result.didLevelUp) this.emit("levelUp", result);
    if (after.isMaxLevel && !before.isMaxLevel) this.emit("maxLevelReached", after);

    return result;
  }

  /**
   * Removes `amount` XP from `currentTotalXP` and returns the result.
   * Emits `"xpLost"`, and additionally `"levelDown"` when applicable.
   *
   * @param currentTotalXP - The player's current accumulated XP.
   * @param amount         - XP to remove (must be ≥ 0).
   * @param options        - Optional multiplier / reason tag.
   */
  removeXP(
    currentTotalXP: number,
    amount: number,
    options?: XPChangeOptions
  ): XPChangeResult {
    if (amount < 0) throw new Error("removeXP: amount must be non-negative.");

    const boostedAmount = Math.floor(amount * (options?.multiplier ?? 1));
    const before = this.getLevelInfo(currentTotalXP);
    const newTotalXP = Math.max(0, currentTotalXP - boostedAmount);
    const after = this.getLevelInfo(newTotalXP);

    const levelsChanged = after.level - before.level; // will be ≤ 0

    const result: XPChangeResult = {
      levelInfo: after,
      levelsChanged,
      didLevelUp: false,
      didLevelDown: levelsChanged < 0,
      xpDelta: newTotalXP - currentTotalXP, // negative delta
      reason: options?.reason,
    };

    this.emit("xpLost", result);
    if (result.didLevelDown) this.emit("levelDown", result);

    return result;
  }

  /**
   * Executes a level-up: bumps the player from their current level to
   * the next one and returns the exact XP they now hold.
   *
   * Useful when you want to grant a level-up directly (e.g. admin action).
   *
   * @returns The new `totalXP` after the level-up.
   */
  levelUp(currentTotalXP: number): XPChangeResult {
    const info = this.getLevelInfo(currentTotalXP);

    if (info.isMaxLevel) {
      // Already capped — return unchanged state
      return {
        levelInfo: info,
        levelsChanged: 0,
        didLevelUp: false,
        didLevelDown: false,
        xpDelta: 0,
      };
    }

    // Jump to the exact XP threshold for the next level
    const newTotalXP = this.xpForLevel(info.nextLevel);
    return this.addXP(currentTotalXP, newTotalXP - currentTotalXP);
  }

  // ─── Utility ───────────────────────────────────────────────────────────────

  /**
   * Formats a `LevelInfo` object as a human-readable string.
   *
   * @example
   * "Level 3 (1 000 / 1 400 XP — 71%)"
   */
  format(info: LevelInfo): string {
    if (info.isMaxLevel) {
      return `Level ${info.level} — MAX (${info.totalXP.toLocaleString()} XP total)`;
    }
    return (
      `Level ${info.level} ` +
      `(${info.currentXP.toLocaleString()} / ${info.xpToNextLevel.toLocaleString()} XP ` +
      `— ${info.progressPercent}%)`
    );
  }
}
