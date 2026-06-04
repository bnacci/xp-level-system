/**
 * Curve formula used to calculate XP thresholds per level.
 *
 * - `linear`      → xp = base * level
 * - `quadratic`   → xp = base * level²
 * - `exponential` → xp = base * multiplier^level
 * - `custom`      → supply your own `customFormula`
 */
export type LevelCurve = "linear" | "quadratic" | "exponential" | "custom";

/** Configuration passed when creating an XPSystem instance. */
export interface XPSystemConfig {
  /**
   * Base XP value used in curve calculations.
   * @default 100
   */
  baseXP?: number;

  /**
   * Multiplier used for the `exponential` curve.
   * @default 1.5
   */
  multiplier?: number;

  /**
   * Growth formula.
   * @default "quadratic"
   */
  curve?: LevelCurve;

  /**
   * Custom formula receiving the level number and returning the
   * **cumulative** XP required to reach that level from level 1.
   * Only used when `curve` is `"custom"`.
   */
  customFormula?: (level: number) => number;

  /**
   * Lowest possible level.
   * @default 1
   */
  minLevel?: number;

  /**
   * Highest possible level. `Infinity` means no cap.
   * @default Infinity
   */
  maxLevel?: number;
}

/** A fully resolved snapshot of a player's current progression state. */
export interface LevelInfo {
  /** Current level. */
  level: number;

  /** Next level (equals `level + 1`, or `maxLevel` when capped). */
  nextLevel: number;

  /** Total XP accumulated since ever. */
  totalXP: number;

  /** XP earned within the current level (resets at each level-up). */
  currentXP: number;

  /** XP needed to complete the current level and reach the next one. */
  xpToNextLevel: number;

  /**
   * Progress percentage inside the current level, `0–100`.
   * Always `100` when the player is at `maxLevel`.
   */
  progressPercent: number;

  /** Whether the player has reached the configured `maxLevel`. */
  isMaxLevel: boolean;
}

/** Result returned by `addXP` / `removeXP`. */
export interface XPChangeResult {
  /** Updated progression snapshot. */
  levelInfo: LevelInfo;

  /** Number of levels gained (positive) or lost (negative). */
  levelsChanged: number;

  /** Whether at least one level-up occurred. */
  didLevelUp: boolean;

  /** Whether at least one level-down occurred. */
  didLevelDown: boolean;

  /** XP delta actually applied (may differ from input if capped). */
  xpDelta: number;
}
