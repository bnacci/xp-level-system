import { describe, it, expect } from "vitest";
import { buildLeaderboard } from "../leaderboard";
import { XPSystem } from "../XPSystem";

describe("buildLeaderboard", () => {
  const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

  it("sorts entries by totalXP descending", () => {
    const board = buildLeaderboard(
      [
        { id: "a", totalXP: 100 },
        { id: "b", totalXP: 900 },
        { id: "c", totalXP: 400 },
      ],
      sys
    );
    expect(board.map((e) => e.id)).toEqual(["b", "c", "a"]);
  });

  it("assigns 1-based positions", () => {
    const board = buildLeaderboard(
      [
        { id: "a", totalXP: 100 },
        { id: "b", totalXP: 900 },
      ],
      sys
    );
    expect(board[0].position).toBe(1);
    expect(board[1].position).toBe(2);
  });

  it("ties share the same position and the next position skips", () => {
    const board = buildLeaderboard(
      [
        { id: "a", totalXP: 500 },
        { id: "b", totalXP: 500 },
        { id: "c", totalXP: 100 },
      ],
      sys
    );
    const byId = Object.fromEntries(board.map((e) => [e.id, e.position]));
    expect(byId.a).toBe(1);
    expect(byId.b).toBe(1);
    expect(byId.c).toBe(3);
  });

  it("attaches the derived level for each entry", () => {
    const board = buildLeaderboard([{ id: "a", totalXP: 900 }], sys);
    expect(board[0].level).toBe(4);
  });

  it("preserves extra fields on each entry", () => {
    const board = buildLeaderboard(
      [{ id: "a", totalXP: 100, name: "Alice" }],
      sys
    );
    expect(board[0].name).toBe("Alice");
  });

  it("does not mutate the input array", () => {
    const input = [
      { id: "a", totalXP: 100 },
      { id: "b", totalXP: 900 },
    ];
    buildLeaderboard(input, sys);
    expect(input[0].id).toBe("a");
  });

  it("returns an empty array for empty input", () => {
    expect(buildLeaderboard([], sys)).toEqual([]);
  });
});
