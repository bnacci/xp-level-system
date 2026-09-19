import { XPSystem } from "./XPSystem";
import { AchievementTracker } from "./AchievementTracker";
import { TypedEmitter } from "./EventEmitter";
import {
  PlayerConfig,
  PlayerEvents,
  PlayerState,
  PrestigeResult,
  LevelInfo,
  RankInfo,
  XPChangeResult,
  XPChangeOptions,
} from "./types";

/**
 * `Player` is a stateful, event-driven convenience wrapper around
 * `XPSystem` and `AchievementTracker` — the "batteries included" way to
 * model a game character: it holds `totalXP` internally, exposes
 * `level` / `rank` / `progress` getters, unlocks achievements
 * automatically as XP changes, and supports prestige resets.
 *
 * Unlike `XPSystem` (which is pure/stateless by design), `Player` owns
 * its state — call `toJSON()` to persist it and `Player.fromJSON()` to
 * restore it later (e.g. from a database row).
 *
 * @example
 * ```ts
 * const player = new Player({
 *   xpSystem: { baseXP: 100, curve: "quadratic", ranks: [...] },
 *   achievements: [levelAchievement("veteran", 10)],
 * });
 *
 * player.on("levelUp", (r) => console.log("Level up!", r.levelInfo.level));
 * player.on("achievementUnlocked", (a) => console.log("Unlocked:", a.name));
 *
 * player.gainXP(500);
 * ```
 */
export class Player extends TypedEmitter<PlayerEvents> {
  readonly xp: XPSystem;
  private achievements: AchievementTracker;
  private readonly prestigeConfig: Required<
    NonNullable<PlayerConfig["prestige"]>
  >;

  private _totalXP: number;
  private _prestige: number;

  constructor(config: PlayerConfig = {}) {
    super();
    this.xp = new XPSystem(config.xpSystem);
    this.achievements = new AchievementTracker(config.achievements ?? []);
    this._totalXP = Math.max(0, config.initialXP ?? 0);
    this._prestige = Math.max(0, config.initialPrestige ?? 0);

    const systemMaxLevel = config.xpSystem?.maxLevel ?? Infinity;
    this.prestigeConfig = {
      enabled: config.prestige?.enabled ?? false,
      requiredLevel: config.prestige?.requiredLevel ?? systemMaxLevel,
      maxPrestige: config.prestige?.maxPrestige ?? Infinity,
      bonusPerPrestige: config.prestige?.bonusPerPrestige ?? 0,
    };

    // Forward low-level XPSystem events so consumers only need `player.on(...)`.
    this.xp.on("xpGained", (r) => this.emit("xpGained", r));
    this.xp.on("xpLost", (r) => this.emit("xpLost", r));
    this.xp.on("levelUp", (r) => this.emit("levelUp", r));
    this.xp.on("levelDown", (r) => this.emit("levelDown", r));
    this.xp.on("maxLevelReached", (info) => this.emit("maxLevelReached", info));

    // Evaluate achievements against the starting state, so a player created
    // (or restored) with XP that already satisfies a condition — e.g. loaded
    // from a save, or constructed with a high `initialXP` — reports it as
    // unlocked immediately rather than only on the next `gainXP` call.
    this.checkAchievements();
  }

  // ─── Read-only state ────────────────────────────────────────────────────────

  get totalXP(): number {
    return this._totalXP;
  }

  get prestigeLevel(): number {
    return this._prestige;
  }

  get level(): number {
    return this.xp.levelFromXP(this._totalXP);
  }

  /** Full progression snapshot for the player's current XP. */
  get progress(): LevelInfo {
    return this.xp.getLevelInfo(this._totalXP);
  }

  /** Current rank/tier, or `null` if no `ranks` were configured on the `XPSystem`. */
  get rank(): RankInfo | null {
    return this.xp.getRank(this.level);
  }

  // ─── XP mutation ────────────────────────────────────────────────────────────

  /**
   * Grants XP to the player. Prestige bonus (if configured) is applied on
   * top of any `options.multiplier`. Automatically re-evaluates
   * achievements and emits `"achievementUnlocked"` for any newly earned.
   */
  gainXP(amount: number, options?: XPChangeOptions): XPChangeResult {
    const prestigeBonus = 1 + this.prestigeConfig.bonusPerPrestige * this._prestige;
    const effectiveMultiplier = (options?.multiplier ?? 1) * prestigeBonus;

    const result = this.xp.addXP(this._totalXP, amount, {
      ...options,
      multiplier: effectiveMultiplier,
    });
    this._totalXP = result.levelInfo.totalXP;
    this.checkAchievements();
    return result;
  }

  /** Removes XP from the player (e.g. a penalty). */
  loseXP(amount: number, options?: XPChangeOptions): XPChangeResult {
    const result = this.xp.removeXP(this._totalXP, amount, options);
    this._totalXP = result.levelInfo.totalXP;
    return result;
  }

  /** Directly sets the player's total XP (e.g. loading from a save). Does not emit change events. */
  setXP(totalXP: number): LevelInfo {
    this._totalXP = Math.max(0, totalXP);
    this.checkAchievements();
    return this.progress;
  }

  // ─── Prestige ───────────────────────────────────────────────────────────────

  /** Whether the player currently meets the requirements to prestige. */
  canPrestige(): boolean {
    if (!this.prestigeConfig.enabled) return false;
    if (this._prestige >= this.prestigeConfig.maxPrestige) return false;
    return this.level >= this.prestigeConfig.requiredLevel;
  }

  /**
   * Resets `totalXP` to `0` and increments the prestige counter, granting
   * a permanent XP-gain bonus for future `gainXP` calls (if configured via
   * `bonusPerPrestige`). Returns `null` if `canPrestige()` is `false`.
   */
  prestige(): PrestigeResult | null {
    if (!this.canPrestige()) return null;

    const previousLevel = this.level;
    this._totalXP = 0;
    this._prestige += 1;

    const result: PrestigeResult = { prestige: this._prestige, previousLevel };
    this.emit("prestige", result);
    this.checkAchievements();
    return result;
  }

  // ─── Achievements ───────────────────────────────────────────────────────────

  private checkAchievements(): void {
    const unlocked = this.achievements.evaluate({
      level: this.level,
      totalXP: this._totalXP,
      prestige: this._prestige,
    });
    for (const achievement of unlocked) {
      this.emit("achievementUnlocked", achievement);
    }
  }

  getUnlockedAchievements() {
    return this.achievements.getUnlocked();
  }

  getLockedAchievements() {
    return this.achievements.getLocked();
  }

  getAchievementCompletionPercent(): number {
    return this.achievements.getCompletionPercent();
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  /** Serializes the player's state — safe to store as JSON in a database. */
  toJSON(): PlayerState {
    return {
      totalXP: this._totalXP,
      prestige: this._prestige,
      unlockedAchievements: this.achievements.toJSON().unlocked,
    };
  }

  /** Restores a `Player` from a previous `toJSON()` snapshot. */
  static fromJSON(state: PlayerState, config: PlayerConfig = {}): Player {
    const player = new Player({
      ...config,
      initialXP: state.totalXP,
      initialPrestige: state.prestige,
    });
    player.achievements = AchievementTracker.fromJSON(
      { unlocked: state.unlockedAchievements ?? {} },
      config.achievements ?? []
    );
    player.checkAchievements();
    return player;
  }
}
