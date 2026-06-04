import { describe, it, expect, beforeEach } from "vitest";
import { XPSystem } from "../XPSystem";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/** Default quadratic system used across most tests. baseXP=100, curve=quadratic
 *
 *  Level thresholds:
 *    Lvl 1 →     0 XP
 *    Lvl 2 →   100 XP  (delta 100)
 *    Lvl 3 →   400 XP  (delta 300)
 *    Lvl 4 →   900 XP  (delta 500)
 *    Lvl 5 → 1 600 XP  (delta 700)
 */
const quad = () => new XPSystem({ baseXP: 100, curve: "quadratic" });

// ─── xpForLevel ───────────────────────────────────────────────────────────────

describe("xpForLevel", () => {
  describe("quadratic curve", () => {
    it("level 1 always requires 0 XP", () => {
      expect(quad().xpForLevel(1)).toBe(0);
    });

    it.each([
      [2, 100],
      [3, 400],
      [4, 900],
      [5, 1_600],
      [6, 2_500],
    ])("level %i → %i XP", (level, expected) => {
      expect(quad().xpForLevel(level)).toBe(expected);
    });
  });

  describe("linear curve", () => {
    const sys = new XPSystem({ baseXP: 500, curve: "linear" });

    it.each([
      [1, 0],
      [2, 500],
      [3, 1_000],
      [4, 1_500],
    ])("level %i → %i XP", (level, expected) => {
      expect(sys.xpForLevel(level)).toBe(expected);
    });
  });

  describe("exponential curve", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "exponential", multiplier: 2 });

    it("level 1 requires 0 XP", () => {
      expect(sys.xpForLevel(1)).toBe(0);
    });

    it.each([
      [2, 100],   // 100*(2^1 - 1) = 100
      [3, 300],   // 100*(2^2 - 1) = 300
      [4, 700],   // 100*(2^3 - 1) = 700
      [5, 1_500], // 100*(2^4 - 1) = 1500
    ])("level %i → %i XP", (level, expected) => {
      expect(sys.xpForLevel(level)).toBe(expected);
    });
  });

  describe("custom formula", () => {
    const sys = new XPSystem({
      curve: "custom",
      customFormula: (level) => level * (level + 1) * 50,
    });

    // level 1 (minLevel) always short-circuits to 0 — by design.
    it("level 1 (minLevel) always returns 0 regardless of formula", () => {
      expect(sys.xpForLevel(1)).toBe(0);
    });

    it.each([
      [2, 300],    // floor(2*3*50) = 300
      [3, 600],    // floor(3*4*50) = 600
      [4, 1_000],  // floor(4*5*50) = 1000
    ])("level %i → %i XP (custom)", (level, expected) => {
      expect(sys.xpForLevel(level)).toBe(expected);
    });
  });

  describe("minLevel offset", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", minLevel: 5 });

    it("minLevel itself requires 0 XP", () => {
      expect(sys.xpForLevel(5)).toBe(0);
    });

    it("minLevel + 1 requires baseXP", () => {
      expect(sys.xpForLevel(6)).toBe(100);
    });
  });
});

// ─── xpRequiredForLevel ───────────────────────────────────────────────────────

describe("xpRequiredForLevel", () => {
  it("returns the delta between consecutive thresholds", () => {
    const sys = quad();
    expect(sys.xpRequiredForLevel(1)).toBe(100); // 100 - 0
    expect(sys.xpRequiredForLevel(2)).toBe(300); // 400 - 100
    expect(sys.xpRequiredForLevel(3)).toBe(500); // 900 - 400
  });

  it("returns 0 when level === maxLevel", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 5 });
    expect(sys.xpRequiredForLevel(5)).toBe(0);
  });
});

// ─── levelFromXP ──────────────────────────────────────────────────────────────

describe("levelFromXP", () => {
  it("0 XP → level 1", () => {
    expect(quad().levelFromXP(0)).toBe(1);
  });

  it("negative XP treated as 0", () => {
    expect(quad().levelFromXP(-500)).toBe(1);
  });

  it.each([
    [99,    1],
    [100,   2],
    [399,   2],
    [400,   3],
    [899,   3],
    [900,   4],
    [1_599, 4],
    [1_600, 5],
  ])("%i XP → level %i", (xp, level) => {
    expect(quad().levelFromXP(xp)).toBe(level);
  });

  it("caps at maxLevel even with excess XP", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    expect(sys.levelFromXP(999_999)).toBe(3);
  });

  it("xpForLevel and levelFromXP are inverses of each other", () => {
    const sys = quad();
    for (let lvl = 1; lvl <= 8; lvl++) {
      const xp = sys.xpForLevel(lvl);
      expect(sys.levelFromXP(xp)).toBe(lvl);
    }
  });
});

// ─── getLevelInfo ─────────────────────────────────────────────────────────────

describe("getLevelInfo", () => {
  it("returns correct snapshot at level boundary (1 600 XP = level 5)", () => {
    const info = quad().getLevelInfo(1_600);
    expect(info.level).toBe(5);
    expect(info.nextLevel).toBe(6);
    expect(info.totalXP).toBe(1_600);
    expect(info.currentXP).toBe(0);
    expect(info.xpToNextLevel).toBe(900); // 2500 - 1600
    expect(info.progressPercent).toBe(0);
    expect(info.isMaxLevel).toBe(false);
  });

  it("calculates mid-level progress correctly (1 000 XP)", () => {
    const info = quad().getLevelInfo(1_000);
    // level 4: threshold 900, next 1600, delta 700
    expect(info.level).toBe(4);
    expect(info.currentXP).toBe(100);         // 1000 - 900
    expect(info.xpToNextLevel).toBe(700);     // 1600 - 900
    expect(info.progressPercent).toBe(14);    // floor(100/700*100)
  });

  it("negative XP resolves to level 1 at 0 XP", () => {
    const info = quad().getLevelInfo(-100);
    expect(info.level).toBe(1);
    expect(info.totalXP).toBe(0);
  });

  it("isMaxLevel is false below cap", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 5 });
    expect(sys.getLevelInfo(500).isMaxLevel).toBe(false);
  });

  it("isMaxLevel is true when capped", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 5 });
    const info = sys.getLevelInfo(1_600);
    expect(info.isMaxLevel).toBe(true);
    expect(info.progressPercent).toBe(100);
    expect(info.xpToNextLevel).toBe(0);
  });

  it("progressPercent is always 0–100", () => {
    const sys = quad();
    [0, 50, 100, 400, 900, 1_600, 5_000].forEach((xp) => {
      const { progressPercent } = sys.getLevelInfo(xp);
      expect(progressPercent).toBeGreaterThanOrEqual(0);
      expect(progressPercent).toBeLessThanOrEqual(100);
    });
  });

  it("nextLevel equals level + 1 when not capped", () => {
    const sys = quad();
    [0, 100, 400, 900].forEach((xp) => {
      const info = sys.getLevelInfo(xp);
      expect(info.nextLevel).toBe(info.level + 1);
    });
  });

  it("currentXP + xpForLevel(level) equals totalXP", () => {
    const sys = quad();
    [0, 150, 450, 950, 1_200].forEach((xp) => {
      const info = sys.getLevelInfo(xp);
      expect(info.currentXP + sys.xpForLevel(info.level)).toBe(info.totalXP);
    });
  });
});

// ─── addXP ────────────────────────────────────────────────────────────────────

describe("addXP", () => {
  it("adds XP without level change", () => {
    const result = quad().addXP(0, 50);
    expect(result.levelInfo.totalXP).toBe(50);
    expect(result.didLevelUp).toBe(false);
    expect(result.levelsChanged).toBe(0);
    expect(result.xpDelta).toBe(50);
  });

  it("triggers a single level-up", () => {
    const result = quad().addXP(0, 100); // 0 → 100 = level 2
    expect(result.levelInfo.level).toBe(2);
    expect(result.didLevelUp).toBe(true);
    expect(result.levelsChanged).toBe(1);
  });

  it("triggers multiple level-ups in one call", () => {
    const result = quad().addXP(0, 1_600); // 0 → 1600 = level 5
    expect(result.levelInfo.level).toBe(5);
    expect(result.levelsChanged).toBe(4);
    expect(result.didLevelUp).toBe(true);
  });

  it("never exceeds maxLevel XP", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const result = sys.addXP(0, 999_999);
    expect(result.levelInfo.level).toBe(3);
    expect(result.levelInfo.totalXP).toBe(sys.xpForLevel(3));
  });

  it("xpDelta reflects actual XP added (respects cap)", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const cap = sys.xpForLevel(3); // 400
    const result = sys.addXP(300, 999_999);
    expect(result.xpDelta).toBe(cap - 300);
  });

  it("throws on negative amount", () => {
    expect(() => quad().addXP(0, -1)).toThrow("addXP: amount must be non-negative.");
  });

  it("adding 0 XP returns unchanged state", () => {
    const result = quad().addXP(500, 0);
    expect(result.levelInfo.totalXP).toBe(500);
    expect(result.levelsChanged).toBe(0);
    expect(result.xpDelta).toBe(0);
  });

  it("didLevelDown is always false", () => {
    expect(quad().addXP(0, 5_000).didLevelDown).toBe(false);
  });
});

// ─── removeXP ────────────────────────────────────────────────────────────────

describe("removeXP", () => {
  it("removes XP without level change", () => {
    const result = quad().removeXP(200, 50);
    expect(result.levelInfo.totalXP).toBe(150);
    expect(result.didLevelDown).toBe(false);
    expect(result.levelsChanged).toBe(0);
  });

  it("triggers a single level-down", () => {
    const result = quad().removeXP(400, 1); // 400 → 399 = level 2
    expect(result.levelInfo.level).toBe(2);
    expect(result.didLevelDown).toBe(true);
    expect(result.levelsChanged).toBe(-1);
  });

  it("triggers multiple level-downs in one call", () => {
    const result = quad().removeXP(1_600, 1_600); // 1600 → 0 = level 1
    expect(result.levelInfo.level).toBe(1);
    expect(result.levelsChanged).toBe(-4);
    expect(result.didLevelDown).toBe(true);
  });

  it("never goes below 0 XP", () => {
    const result = quad().removeXP(50, 999_999);
    expect(result.levelInfo.totalXP).toBe(0);
    expect(result.levelInfo.level).toBe(1);
  });

  it("xpDelta is negative", () => {
    const result = quad().removeXP(500, 200);
    expect(result.xpDelta).toBe(-200);
  });

  it("throws on negative amount", () => {
    expect(() => quad().removeXP(100, -1)).toThrow("removeXP: amount must be non-negative.");
  });

  it("removing 0 XP returns unchanged state", () => {
    const result = quad().removeXP(500, 0);
    expect(result.levelInfo.totalXP).toBe(500);
    expect(result.levelsChanged).toBe(0);
    expect(result.xpDelta).toBe(0);
  });

  it("didLevelUp is always false", () => {
    expect(quad().removeXP(0, 0).didLevelUp).toBe(false);
  });
});

// ─── levelUp ──────────────────────────────────────────────────────────────────

describe("levelUp", () => {
  it("promotes to exactly the next level threshold", () => {
    const sys = quad();
    const result = sys.levelUp(0); // level 1 → 2, threshold 100
    expect(result.levelInfo.level).toBe(2);
    expect(result.levelInfo.totalXP).toBe(100);
    expect(result.levelInfo.currentXP).toBe(0);
    expect(result.didLevelUp).toBe(true);
    expect(result.levelsChanged).toBe(1);
  });

  it("works from mid-level XP (no double jump)", () => {
    const sys = quad();
    // Currently at 150 XP (level 2, mid); levelUp → 400 XP (level 3)
    const result = sys.levelUp(150);
    expect(result.levelInfo.level).toBe(3);
    expect(result.levelInfo.totalXP).toBe(400);
  });

  it("chaining levelUp three times advances three levels", () => {
    const sys = quad();
    let xp = 0;
    for (let i = 0; i < 3; i++) {
      const result = sys.levelUp(xp);
      xp = result.levelInfo.totalXP;
    }
    expect(sys.getLevelInfo(xp).level).toBe(4);
  });

  it("is a no-op at maxLevel", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const atMax = sys.xpForLevel(3);
    const result = sys.levelUp(atMax);
    expect(result.levelInfo.level).toBe(3);
    expect(result.levelsChanged).toBe(0);
    expect(result.didLevelUp).toBe(false);
    expect(result.xpDelta).toBe(0);
  });
});

// ─── format ───────────────────────────────────────────────────────────────────

describe("format", () => {
  it("returns correct string for mid-level state", () => {
    const sys = quad();
    const info = sys.getLevelInfo(1_000); // level 4, 100/700 XP, 14%
    expect(sys.format(info)).toBe("Level 4 (100 / 700 XP — 14%)");
  });

  it("returns MAX string when at maxLevel", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const info = sys.getLevelInfo(9_999);
    expect(sys.format(info)).toContain("MAX");
    expect(sys.format(info)).toContain("Level 3");
  });
});

// ─── Constructor validation ───────────────────────────────────────────────────

describe("constructor", () => {
  it("throws when curve=custom but no customFormula provided", () => {
    expect(() => new XPSystem({ curve: "custom" })).toThrow(
      'XPSystem: curve is "custom" but no customFormula was provided.'
    );
  });

  it("applies default values when no config is passed", () => {
    const sys = new XPSystem();
    expect(sys.xpForLevel(2)).toBe(100); // baseXP=100, quadratic
    expect(sys.levelFromXP(0)).toBe(1);  // minLevel=1
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("XP exactly at boundary is the new level, not the old one", () => {
    // 400 XP is exactly the threshold for level 3
    expect(quad().levelFromXP(400)).toBe(3);
    expect(quad().levelFromXP(399)).toBe(2);
  });

  it("getLevelInfo is pure — calling it does not mutate state", () => {
    const sys = quad();
    sys.getLevelInfo(1_000);
    sys.getLevelInfo(1_000);
    expect(sys.getLevelInfo(1_000).level).toBe(4);
  });

  it("addXP then removeXP same amount restores original XP", () => {
    const sys = quad();
    const start = 450;
    const after = sys.addXP(start, 300).levelInfo.totalXP;
    const restored = sys.removeXP(after, 300).levelInfo.totalXP;
    expect(restored).toBe(start);
  });

  it("very large XP does not overflow for quadratic", () => {
    const sys = quad();
    const info = sys.getLevelInfo(1_000_000_000);
    expect(info.level).toBeGreaterThan(1);
    expect(Number.isFinite(info.level)).toBe(true);
  });

  it("progressPercent at exact level boundary is 0%", () => {
    expect(quad().getLevelInfo(400).progressPercent).toBe(0); // exactly level 3
  });

  it("progressPercent one XP before next threshold approaches 100%", () => {
    // level 3 needs 500 XP to advance (400→900), so 899 XP = 499/500 = 99%
    const info = quad().getLevelInfo(899);
    expect(info.progressPercent).toBe(99);
  });
});
