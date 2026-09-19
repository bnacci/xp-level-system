import { describe, it, expect, vi } from "vitest";
import { Player } from "../Player";
import { levelAchievement, xpAchievement } from "../AchievementTracker";

describe("Player", () => {
  it("starts at 0 XP / level 1 by default", () => {
    const player = new Player({ xpSystem: { baseXP: 100 } });
    expect(player.totalXP).toBe(0);
    expect(player.level).toBe(1);
    expect(player.prestigeLevel).toBe(0);
  });

  it("accepts an initial XP amount", () => {
    const player = new Player({ xpSystem: { baseXP: 100 }, initialXP: 400 });
    expect(player.level).toBe(3);
  });

  it("gainXP increases totalXP and level", () => {
    const player = new Player({ xpSystem: { baseXP: 100, curve: "quadratic" } });
    player.gainXP(400);
    expect(player.totalXP).toBe(400);
    expect(player.level).toBe(3);
  });

  it("loseXP decreases totalXP and can trigger level-down", () => {
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic" },
      initialXP: 400,
    });
    player.loseXP(1);
    expect(player.level).toBe(2);
  });

  it("setXP jumps directly to a given total", () => {
    const player = new Player({ xpSystem: { baseXP: 100, curve: "quadratic" } });
    player.setXP(900);
    expect(player.level).toBe(4);
  });

  it("progress mirrors XPSystem.getLevelInfo", () => {
    const player = new Player({ xpSystem: { baseXP: 100, curve: "quadratic" } });
    player.gainXP(1000);
    expect(player.progress.level).toBe(4);
    expect(player.progress.currentXP).toBe(100);
  });

  it("rank reflects the configured XPSystem ranks", () => {
    const player = new Player({
      xpSystem: {
        baseXP: 100,
        curve: "quadratic",
        ranks: [
          { name: "Bronze", minLevel: 1 },
          { name: "Silver", minLevel: 5 },
        ],
      },
    });
    expect(player.rank?.name).toBe("Bronze");
    player.gainXP(1600); // level 5
    expect(player.rank?.name).toBe("Silver");
  });

  it("rank is null without ranks configured", () => {
    const player = new Player({ xpSystem: { baseXP: 100 } });
    expect(player.rank).toBeNull();
  });

  it("forwards XPSystem events (levelUp)", () => {
    const player = new Player({ xpSystem: { baseXP: 100, curve: "quadratic" } });
    const levelUp = vi.fn();
    player.on("levelUp", levelUp);
    player.gainXP(100);
    expect(levelUp).toHaveBeenCalledTimes(1);
  });

  it("unlocks achievements automatically as XP/level changes", () => {
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements: [levelAchievement("lvl2", 2), xpAchievement("xp1000", 1000)],
    });
    const unlocked = vi.fn();
    player.on("achievementUnlocked", unlocked);

    player.gainXP(1000); // level 4, 1000 XP total → both should unlock

    expect(unlocked).toHaveBeenCalledTimes(2);
    expect(player.getUnlockedAchievements().map((a) => a.id).sort()).toEqual([
      "lvl2",
      "xp1000",
    ]);
  });

  it("getLockedAchievements / getAchievementCompletionPercent stay in sync", () => {
    const player = new Player({
      xpSystem: { baseXP: 100 },
      achievements: [levelAchievement("a", 2), levelAchievement("b", 3)],
    });
    expect(player.getAchievementCompletionPercent()).toBe(0);
    player.gainXP(100); // level 2
    expect(player.getAchievementCompletionPercent()).toBe(50);
    expect(player.getLockedAchievements().map((a) => a.id)).toEqual(["b"]);
  });
});

describe("Player prestige", () => {
  const makePlayer = () =>
    new Player({
      xpSystem: { baseXP: 100, curve: "quadratic", maxLevel: 3 },
      prestige: { enabled: true, bonusPerPrestige: 0.1 },
    });

  it("canPrestige is false before reaching the required level", () => {
    const player = makePlayer();
    expect(player.canPrestige()).toBe(false);
  });

  it("canPrestige is true once the required level is reached", () => {
    const player = makePlayer();
    player.setXP(player.xp.xpForLevel(3));
    expect(player.canPrestige()).toBe(true);
  });

  it("prestige() resets XP to 0, increments prestige, and emits an event", () => {
    const player = makePlayer();
    player.setXP(player.xp.xpForLevel(3));
    const onPrestige = vi.fn();
    player.on("prestige", onPrestige);

    const result = player.prestige();

    expect(result).not.toBeNull();
    expect(result!.prestige).toBe(1);
    expect(result!.previousLevel).toBe(3);
    expect(player.totalXP).toBe(0);
    expect(player.prestigeLevel).toBe(1);
    expect(onPrestige).toHaveBeenCalledTimes(1);
  });

  it("prestige() returns null and no-ops when requirements aren't met", () => {
    const player = makePlayer();
    expect(player.prestige()).toBeNull();
    expect(player.prestigeLevel).toBe(0);
  });

  it("prestige() is disabled by default", () => {
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic", maxLevel: 3 },
    });
    player.setXP(player.xp.xpForLevel(3));
    expect(player.canPrestige()).toBe(false);
    expect(player.prestige()).toBeNull();
  });

  it("applies bonusPerPrestige as a permanent XP multiplier", () => {
    const player = makePlayer();
    player.setXP(player.xp.xpForLevel(3));
    player.prestige(); // prestige 1 → +10% XP

    const result = player.gainXP(100);
    expect(result.xpDelta).toBe(110);
  });

  it("respects maxPrestige", () => {
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic", maxLevel: 2 },
      prestige: { enabled: true, maxPrestige: 1 },
    });
    player.setXP(player.xp.xpForLevel(2));
    expect(player.prestige()).not.toBeNull();

    player.setXP(player.xp.xpForLevel(2));
    expect(player.canPrestige()).toBe(false);
    expect(player.prestige()).toBeNull();
  });
});

describe("Player retroactive achievement evaluation", () => {
  it("unlocks already-satisfied achievements when constructed with a high initialXP", () => {
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements: [levelAchievement("lvl2", 2), xpAchievement("xp1000", 1000)],
      initialXP: 1000, // level 4 — both conditions already true at construction time
    });

    expect(player.getUnlockedAchievements().map((a) => a.id).sort()).toEqual([
      "lvl2",
      "xp1000",
    ]);
    expect(player.getAchievementCompletionPercent()).toBe(100);
  });

  it("fromJSON re-evaluates achievements not captured in the saved snapshot", () => {
    const achievements = [levelAchievement("lvl2", 2), xpAchievement("xp1000", 1000)];
    // Simulates state that was set directly (e.g. a DB migration) without ever
    // going through gainXP, so unlockedAchievements was never populated.
    const restored = Player.fromJSON(
      { totalXP: 1000, prestige: 0, unlockedAchievements: {} },
      { xpSystem: { baseXP: 100, curve: "quadratic" }, achievements }
    );

    expect(restored.getUnlockedAchievements().map((a) => a.id).sort()).toEqual([
      "lvl2",
      "xp1000",
    ]);
  });
});

describe("Player persistence", () => {
  it("round-trips totalXP, prestige, and achievements via toJSON/fromJSON", () => {
    const achievements = [levelAchievement("lvl2", 2)];
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements,
    });
    player.gainXP(150); // level 2, unlocks "lvl2"

    const snapshot = player.toJSON();
    const restored = Player.fromJSON(snapshot, {
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements,
    });

    expect(restored.totalXP).toBe(150);
    expect(restored.level).toBe(2);
    expect(restored.getUnlockedAchievements().map((a) => a.id)).toEqual(["lvl2"]);
  });

  it("a restored player does not re-fire already-unlocked achievements", () => {
    const achievements = [levelAchievement("lvl2", 2)];
    const player = new Player({
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements,
    });
    player.gainXP(150);

    const restored = Player.fromJSON(player.toJSON(), {
      xpSystem: { baseXP: 100, curve: "quadratic" },
      achievements,
    });

    const unlocked = vi.fn();
    restored.on("achievementUnlocked", unlocked);
    restored.gainXP(1); // still level 2, condition already true but already unlocked
    expect(unlocked).not.toHaveBeenCalled();
  });
});
