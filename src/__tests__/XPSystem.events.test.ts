import { describe, it, expect, vi } from "vitest";
import { XPSystem } from "../XPSystem";

const quad = () => new XPSystem({ baseXP: 100, curve: "quadratic" });

describe("XPSystem events", () => {
  it("emits xpGained on every addXP call", () => {
    const sys = quad();
    const listener = vi.fn();
    sys.on("xpGained", listener);

    sys.addXP(0, 50);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].xpDelta).toBe(50);
  });

  it("emits levelUp only when a level boundary is crossed", () => {
    const sys = quad();
    const levelUp = vi.fn();
    sys.on("levelUp", levelUp);

    sys.addXP(0, 50); // no level up
    expect(levelUp).not.toHaveBeenCalled();

    sys.addXP(50, 50); // crosses 100 → level 2
    expect(levelUp).toHaveBeenCalledTimes(1);
  });

  it("emits maxLevelReached exactly once when the cap is first hit", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const maxed = vi.fn();
    sys.on("maxLevelReached", maxed);

    sys.addXP(0, 999); // reaches max level 3 (400 XP cap)
    expect(maxed).toHaveBeenCalledTimes(1);

    sys.addXP(400, 999); // already maxed — should not fire again
    expect(maxed).toHaveBeenCalledTimes(1);
  });

  it("emits xpLost and levelDown on removeXP", () => {
    const sys = quad();
    const xpLost = vi.fn();
    const levelDown = vi.fn();
    sys.on("xpLost", xpLost);
    sys.on("levelDown", levelDown);

    sys.removeXP(400, 1); // 400 → 399, level 3 → 2

    expect(xpLost).toHaveBeenCalledTimes(1);
    expect(levelDown).toHaveBeenCalledTimes(1);
  });

  it("off() unsubscribes a listener", () => {
    const sys = quad();
    const listener = vi.fn();
    sys.on("xpGained", listener);
    sys.off("xpGained", listener);

    sys.addXP(0, 50);
    expect(listener).not.toHaveBeenCalled();
  });

  it("on() returns an unsubscribe function", () => {
    const sys = quad();
    const listener = vi.fn();
    const unsubscribe = sys.on("xpGained", listener);
    unsubscribe();

    sys.addXP(0, 50);
    expect(listener).not.toHaveBeenCalled();
  });

  it("once() fires only a single time", () => {
    const sys = quad();
    const listener = vi.fn();
    sys.once("xpGained", listener);

    sys.addXP(0, 10);
    sys.addXP(10, 10);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("removeAllListeners clears subscriptions", () => {
    const sys = quad();
    const listener = vi.fn();
    sys.on("xpGained", listener);
    sys.removeAllListeners();

    sys.addXP(0, 10);
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("XPSystem addXP multiplier", () => {
  it("applies a multiplier to the XP amount before adding", () => {
    const sys = quad();
    const result = sys.addXP(0, 50, { multiplier: 2 });
    expect(result.levelInfo.totalXP).toBe(100);
    expect(result.xpDelta).toBe(100);
  });

  it("floors fractional multiplier results", () => {
    const sys = quad();
    const result = sys.addXP(0, 3, { multiplier: 1.5 }); // 4.5 → 4
    expect(result.xpDelta).toBe(4);
  });

  it("defaults to multiplier 1 when omitted", () => {
    const sys = quad();
    const result = sys.addXP(0, 50);
    expect(result.xpDelta).toBe(50);
  });

  it("forwards the reason tag onto the result", () => {
    const sys = quad();
    const result = sys.addXP(0, 50, { reason: "quest:dragon" });
    expect(result.reason).toBe("quest:dragon");
  });

  it("respects maxLevel cap even with a multiplier applied", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 3 });
    const result = sys.addXP(0, 1000, { multiplier: 10 });
    expect(result.levelInfo.level).toBe(3);
    expect(result.levelInfo.totalXP).toBe(sys.xpForLevel(3));
  });
});

describe("XPSystem.getRank", () => {
  const ranks = [
    { name: "Bronze", minLevel: 1, color: "#cd7f32" },
    { name: "Silver", minLevel: 5, color: "#c0c0c0" },
    { name: "Gold", minLevel: 10, color: "#ffd700" },
  ];

  it("returns null when no ranks are configured", () => {
    expect(quad().getRank(5)).toBeNull();
  });

  it("resolves the correct tier for a given level", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", ranks });
    expect(sys.getRank(1)!.name).toBe("Bronze");
    expect(sys.getRank(4)!.name).toBe("Bronze");
    expect(sys.getRank(5)!.name).toBe("Silver");
    expect(sys.getRank(9)!.name).toBe("Silver");
    expect(sys.getRank(10)!.name).toBe("Gold");
    expect(sys.getRank(999)!.name).toBe("Gold");
  });

  it("exposes the next rank and progress toward it", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", ranks });
    const info = sys.getRank(7)!; // Silver (5) → Gold (10), 2/5 = 40%
    expect(info.next?.name).toBe("Gold");
    expect(info.progressToNext).toBe(40);
  });

  it("next is null and progress is 100 at the highest rank", () => {
    const sys = new XPSystem({ baseXP: 100, curve: "quadratic", ranks });
    const info = sys.getRank(50)!;
    expect(info.next).toBeNull();
    expect(info.progressToNext).toBe(100);
  });

  it("returns null below the lowest configured rank", () => {
    const sys = new XPSystem({
      baseXP: 100,
      curve: "quadratic",
      ranks: [{ name: "Silver", minLevel: 5 }],
    });
    expect(sys.getRank(1)).toBeNull();
  });

  it("accepts ranks in any order and sorts them internally", () => {
    const sys = new XPSystem({
      baseXP: 100,
      curve: "quadratic",
      ranks: [ranks[2], ranks[0], ranks[1]],
    });
    expect(sys.getRank(1)!.name).toBe("Bronze");
    expect(sys.getRank(10)!.name).toBe("Gold");
  });
});
