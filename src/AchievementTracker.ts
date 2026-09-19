import {
  AchievementContext,
  AchievementDefinition,
  AchievementTrackerState,
  UnlockedAchievement,
} from "./types";

/**
 * Tracks a set of achievement/badge definitions against a stream of
 * context snapshots (level, XP, prestige, or any custom stat you pass in).
 *
 * Framework-agnostic and persistence-friendly: serialize with `toJSON()`
 * and restore with `fromJSON()`.
 *
 * @example
 * ```ts
 * const tracker = new AchievementTracker([
 *   { id: "first-steps", name: "First Steps", condition: (c) => c.level >= 2 },
 *   { id: "veteran", name: "Veteran", condition: (c) => c.level >= 10 },
 * ]);
 *
 * const unlocked = tracker.evaluate({ level: 2, totalXP: 100 });
 * console.log(unlocked); // [{ id: "first-steps", ... , unlockedAt: 173... }]
 * ```
 */
export class AchievementTracker {
  private readonly definitions: Map<string, AchievementDefinition>;
  private readonly unlockedAt: Map<string, number> = new Map();

  constructor(definitions: AchievementDefinition[] = []) {
    this.definitions = new Map(definitions.map((def) => [def.id, def]));
  }

  /** Registers an additional achievement definition. */
  register(definition: AchievementDefinition): void {
    this.definitions.set(definition.id, definition);
  }

  /**
   * Evaluates every not-yet-unlocked achievement's `condition` against
   * `context`. Returns only the achievements that became unlocked by
   * this call (empty array if none did).
   */
  evaluate(context: AchievementContext): UnlockedAchievement[] {
    const newlyUnlocked: UnlockedAchievement[] = [];

    for (const definition of this.definitions.values()) {
      if (this.unlockedAt.has(definition.id)) continue;
      if (definition.condition(context)) {
        const timestamp = Date.now();
        this.unlockedAt.set(definition.id, timestamp);
        newlyUnlocked.push({ ...definition, unlockedAt: timestamp });
      }
    }

    return newlyUnlocked;
  }

  /** Whether the given achievement id has been unlocked. */
  isUnlocked(id: string): boolean {
    return this.unlockedAt.has(id);
  }

  /** All unlocked achievements, most recently unlocked first. */
  getUnlocked(): UnlockedAchievement[] {
    return Array.from(this.unlockedAt.entries())
      .map(([id, unlockedAt]) => ({ ...this.definitions.get(id)!, unlockedAt }))
      .sort((a, b) => b.unlockedAt - a.unlockedAt);
  }

  /**
   * All achievements not yet unlocked. `hidden` achievements have their
   * `name`/`description`/`icon` stripped so UIs don't spoil them.
   */
  getLocked(): AchievementDefinition[] {
    return Array.from(this.definitions.values())
      .filter((def) => !this.unlockedAt.has(def.id))
      .map((def) =>
        def.hidden
          ? { ...def, name: "???", description: undefined, icon: undefined }
          : def
      );
  }

  /** Fraction of registered achievements unlocked, `0–100`. */
  getCompletionPercent(): number {
    if (this.definitions.size === 0) return 0;
    return Math.floor((this.unlockedAt.size / this.definitions.size) * 100);
  }

  /** Clears all unlock progress (definitions stay registered). */
  reset(): void {
    this.unlockedAt.clear();
  }

  /** Serializes unlock state (not the definitions) for persistence. */
  toJSON(): AchievementTrackerState {
    return { unlocked: Object.fromEntries(this.unlockedAt) };
  }

  /** Restores unlock state previously produced by `toJSON()`. */
  static fromJSON(
    state: AchievementTrackerState,
    definitions: AchievementDefinition[] = []
  ): AchievementTracker {
    const tracker = new AchievementTracker(definitions);
    for (const [id, timestamp] of Object.entries(state.unlocked ?? {})) {
      tracker.unlockedAt.set(id, timestamp);
    }
    return tracker;
  }
}

// ─── Convenience factories ───────────────────────────────────────────────────

/** Shorthand for an achievement that unlocks at a given level. */
export function levelAchievement(
  id: string,
  level: number,
  meta: Omit<AchievementDefinition, "id" | "condition"> = { name: id }
): AchievementDefinition {
  return { id, condition: (ctx) => ctx.level >= level, ...meta };
}

/** Shorthand for an achievement that unlocks at a given total XP amount. */
export function xpAchievement(
  id: string,
  totalXP: number,
  meta: Omit<AchievementDefinition, "id" | "condition"> = { name: id }
): AchievementDefinition {
  return { id, condition: (ctx) => ctx.totalXP >= totalXP, ...meta };
}

/** Shorthand for an achievement that unlocks at a given prestige count. */
export function prestigeAchievement(
  id: string,
  prestige: number,
  meta: Omit<AchievementDefinition, "id" | "condition"> = { name: id }
): AchievementDefinition {
  return { id, condition: (ctx) => (ctx.prestige ?? 0) >= prestige, ...meta };
}
