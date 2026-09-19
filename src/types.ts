/**
 * Curve formula used to calculate XP thresholds per level.
 *
 * - `linear`      → xp = base * level
 * - `quadratic`   → xp = base * level²
 * - `exponential` → xp = base * multiplier^level
 * - `custom`      → supply your own `customFormula`
 */
export type LevelCurve = "linear" | "quadratic" | "exponential" | "custom";

/** A named tier (Bronze, Silver, Gold, ...) tied to a minimum level. */
export interface RankDefinition {
  /** Display name, e.g. `"Gold"`. */
  name: string;
  /** Level at which this rank starts applying. */
  minLevel: number;
  /** Optional hex/CSS color for UI badges, e.g. `"#FFD700"`. */
  color?: string;
  /** Optional icon identifier (emoji, icon name, URL — consumer-defined). */
  icon?: string;
}

/** Resolved rank information for a given level. */
export interface RankInfo {
  name: string;
  minLevel: number;
  color?: string;
  icon?: string;
  /** The next rank the player will reach, or `null` if this is the highest rank. */
  next: RankDefinition | null;
  /** Progress toward the next rank, `0–100` (based on level distance). */
  progressToNext: number;
}

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

  /**
   * Optional named tiers (Bronze/Silver/Gold/...) used by `getRank()`.
   * Sorted internally by `minLevel`; a rank with `minLevel: 1` is
   * recommended so every level has a resolvable rank.
   */
  ranks?: RankDefinition[];
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

/** Options accepted by `addXP` / `removeXP`. */
export interface XPChangeOptions {
  /**
   * Multiplies the XP amount before applying it (e.g. `2` for a "double XP"
   * boost, `1.5` for a weekend bonus). Result is floored. Ignored by
   * `removeXP` if you don't want boosted losses — it still applies there
   * too for symmetry, so pass `1` explicitly if you need an exact removal.
   * @default 1
   */
  multiplier?: number;

  /** Free-form reason/source tag, forwarded to emitted events (e.g. `"quest:dragon-slay"`). */
  reason?: string;
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

  /** Reason tag passed via `options.reason`, if any. */
  reason?: string;
}

/** Events emitted by `XPSystem` during `addXP` / `removeXP` / `levelUp`. */
export interface XPSystemEvents {
  xpGained: XPChangeResult;
  xpLost: XPChangeResult;
  levelUp: XPChangeResult;
  levelDown: XPChangeResult;
  maxLevelReached: LevelInfo;
}

// ─── Achievements ───────────────────────────────────────────────────────────

/** Contextual data an achievement's `condition` is evaluated against. */
export interface AchievementContext {
  level: number;
  totalXP: number;
  prestige?: number;
  [key: string]: unknown;
}

/** Definition of a single achievement / badge. */
export interface AchievementDefinition {
  /** Stable unique identifier, e.g. `"reach-level-10"`. */
  id: string;
  /** Display name, e.g. `"Veteran"`. */
  name: string;
  description?: string;
  /** Icon identifier (emoji, icon name, URL — consumer-defined). */
  icon?: string;
  /** Predicate evaluated on every `evaluate()` call; unlocks once it returns `true`. */
  condition: (ctx: AchievementContext) => boolean;
  /** When `true`, hide name/description from `getLocked()` output until unlocked. */
  hidden?: boolean;
}

/** An achievement that has been unlocked, with the timestamp it happened. */
export interface UnlockedAchievement extends AchievementDefinition {
  unlockedAt: number;
}

/** Serializable snapshot of an `AchievementTracker`. */
export interface AchievementTrackerState {
  unlocked: Record<string, number>;
}

// ─── Player ─────────────────────────────────────────────────────────────────

/** Configuration for the optional prestige system on `Player`. */
export interface PrestigeConfig {
  /** Enables prestige. @default false */
  enabled?: boolean;
  /**
   * Level required before `player.prestige()` is allowed.
   * Defaults to the underlying `XPSystem`'s `maxLevel` (must be finite).
   */
  requiredLevel?: number;
  /** Maximum number of times a player may prestige. `Infinity` = no cap. @default Infinity */
  maxPrestige?: number;
  /**
   * Permanent XP-gain bonus granted per prestige, as a fraction
   * (e.g. `0.1` = +10% XP earned per prestige level).
   * @default 0
   */
  bonusPerPrestige?: number;
}

/** Configuration for constructing a `Player`. */
export interface PlayerConfig {
  /** Either a pre-built `XPSystem` instance or a config to build one internally. */
  xpSystem?: XPSystemConfig;
  /** Achievement definitions this player should be tracked against. */
  achievements?: AchievementDefinition[];
  /** Starting total XP. @default 0 */
  initialXP?: number;
  /** Starting prestige level. @default 0 */
  initialPrestige?: number;
  prestige?: PrestigeConfig;
}

/** Serializable snapshot of a `Player`'s state — safe to persist as JSON. */
export interface PlayerState {
  totalXP: number;
  prestige: number;
  unlockedAchievements: Record<string, number>;
}

/** Result of a successful `player.prestige()` call. */
export interface PrestigeResult {
  prestige: number;
  previousLevel: number;
}

/** Events emitted by `Player`. */
export interface PlayerEvents {
  xpGained: XPChangeResult;
  xpLost: XPChangeResult;
  levelUp: XPChangeResult;
  levelDown: XPChangeResult;
  maxLevelReached: LevelInfo;
  achievementUnlocked: UnlockedAchievement;
  prestige: PrestigeResult;
}

// ─── Leaderboard ────────────────────────────────────────────────────────────

/** Minimal shape required to rank an entry on a leaderboard. */
export interface LeaderboardEntry {
  id: string;
  totalXP: number;
}

/** A leaderboard entry enriched with its computed rank position and level. */
export type RankedLeaderboardEntry<T extends LeaderboardEntry> = T & {
  /** 1-based position. Ties share the same position (standard competition ranking). */
  position: number;
  level: number;
};
