import { describe, it, expect } from "vitest";
import {
  AchievementTracker,
  levelAchievement,
  xpAchievement,
  prestigeAchievement,
} from "../AchievementTracker";

describe("AchievementTracker", () => {
  it("unlocks an achievement whose condition is met", () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: (ctx) => ctx.level >= 2 },
    ]);

    const unlocked = tracker.evaluate({ level: 2, totalXP: 100 });
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe("a");
    expect(tracker.isUnlocked("a")).toBe(true);
  });

  it("does not re-unlock an already-unlocked achievement", () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: () => true },
    ]);

    expect(tracker.evaluate({ level: 1, totalXP: 0 })).toHaveLength(1);
    expect(tracker.evaluate({ level: 1, totalXP: 0 })).toHaveLength(0);
  });

  it("only returns achievements unlocked by the current evaluate() call", () => {
    const tracker = new AchievementTracker([
      { id: "low", name: "Low", condition: (ctx) => ctx.level >= 1 },
      { id: "high", name: "High", condition: (ctx) => ctx.level >= 10 },
    ]);

    const first = tracker.evaluate({ level: 1, totalXP: 0 });
    expect(first.map((a) => a.id)).toEqual(["low"]);

    const second = tracker.evaluate({ level: 10, totalXP: 0 });
    expect(second.map((a) => a.id)).toEqual(["high"]);
  });

  it("getUnlocked returns unlocked achievements newest first", async () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: () => true },
      { id: "b", name: "B", condition: () => true },
    ]);
    tracker.evaluate({ level: 1, totalXP: 0 });

    const unlocked = tracker.getUnlocked();
    expect(unlocked.map((a) => a.id).sort()).toEqual(["a", "b"]);
  });

  it("getLocked hides name/description/icon for hidden achievements", () => {
    const tracker = new AchievementTracker([
      {
        id: "secret",
        name: "Secret Achievement",
        description: "shh",
        icon: "🤫",
        hidden: true,
        condition: () => false,
      },
    ]);

    const locked = tracker.getLocked();
    expect(locked[0].name).toBe("???");
    expect(locked[0].description).toBeUndefined();
    expect(locked[0].icon).toBeUndefined();
  });

  it("getLocked excludes already-unlocked achievements", () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: () => true },
      { id: "b", name: "B", condition: () => false },
    ]);
    tracker.evaluate({ level: 1, totalXP: 0 });

    const locked = tracker.getLocked();
    expect(locked.map((a) => a.id)).toEqual(["b"]);
  });

  it("getCompletionPercent reflects unlocked ratio", () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: () => true },
      { id: "b", name: "B", condition: () => false },
      { id: "c", name: "C", condition: () => false },
      { id: "d", name: "D", condition: () => false },
    ]);
    tracker.evaluate({ level: 1, totalXP: 0 });
    expect(tracker.getCompletionPercent()).toBe(25);
  });

  it("getCompletionPercent is 0 with no achievements registered", () => {
    expect(new AchievementTracker().getCompletionPercent()).toBe(0);
  });

  it("reset() clears unlock progress without dropping definitions", () => {
    const tracker = new AchievementTracker([
      { id: "a", name: "A", condition: () => true },
    ]);
    tracker.evaluate({ level: 1, totalXP: 0 });
    expect(tracker.isUnlocked("a")).toBe(true);

    tracker.reset();
    expect(tracker.isUnlocked("a")).toBe(false);
    expect(tracker.evaluate({ level: 1, totalXP: 0 })).toHaveLength(1);
  });

  it("register() adds a new achievement definition after construction", () => {
    const tracker = new AchievementTracker();
    tracker.register({ id: "a", name: "A", condition: () => true });
    expect(tracker.evaluate({ level: 1, totalXP: 0 })).toHaveLength(1);
  });

  it("round-trips through toJSON/fromJSON", () => {
    const definitions = [{ id: "a", name: "A", condition: () => true }];
    const tracker = new AchievementTracker(definitions);
    tracker.evaluate({ level: 1, totalXP: 0 });

    const snapshot = tracker.toJSON();
    const restored = AchievementTracker.fromJSON(snapshot, definitions);

    expect(restored.isUnlocked("a")).toBe(true);
    expect(restored.getUnlocked()[0].unlockedAt).toBe(
      tracker.getUnlocked()[0].unlockedAt
    );
  });
});

describe("achievement factories", () => {
  it("levelAchievement unlocks based on level", () => {
    const def = levelAchievement("lvl10", 10, { name: "Level 10" });
    expect(def.condition({ level: 9, totalXP: 0 })).toBe(false);
    expect(def.condition({ level: 10, totalXP: 0 })).toBe(true);
  });

  it("xpAchievement unlocks based on total XP", () => {
    const def = xpAchievement("xp1000", 1000, { name: "Grinder" });
    expect(def.condition({ level: 1, totalXP: 999 })).toBe(false);
    expect(def.condition({ level: 1, totalXP: 1000 })).toBe(true);
  });

  it("prestigeAchievement unlocks based on prestige count", () => {
    const def = prestigeAchievement("p1", 1, { name: "Reborn" });
    expect(def.condition({ level: 1, totalXP: 0 })).toBe(false);
    expect(def.condition({ level: 1, totalXP: 0, prestige: 1 })).toBe(true);
  });
});
