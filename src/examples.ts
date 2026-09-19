import { XPSystem } from "./XPSystem";
import { Player } from "./Player";
import { AchievementTracker, levelAchievement, xpAchievement } from "./AchievementTracker";
import { buildLeaderboard } from "./leaderboard";

// ─── helpers ──────────────────────────────────────────────────────────────────
const section = (title: string) =>
  console.log(`\n${"─".repeat(60)}\n  ${title}\n${"─".repeat(60)}`);

const show = (label: string, value: unknown) =>
  console.log(`  ${label.padEnd(30)}`, value);

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Default quadratic curve  (baseXP = 100)
//    Level threshold: xp = 100 * (level - 1)²
// ═══════════════════════════════════════════════════════════════════════════════
section("1 — Quadratic curve (default)");

const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

// XP → Level
const samples = [0, 99, 100, 399, 400, 899, 900, 1599, 1600];
for (const xp of samples) {
  const info = sys.getLevelInfo(xp);
  console.log(
    `  ${String(xp).padStart(5)} XP → ${sys.format(info)}`
  );
}

// Level → XP
section("2 — Level → cumulative XP threshold");
for (let lvl = 1; lvl <= 8; lvl++) {
  show(`Level ${lvl} starts at`, `${sys.xpForLevel(lvl).toLocaleString()} XP`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. addXP — normal gain
// ═══════════════════════════════════════════════════════════════════════════════
section("3 — addXP (level-up scenario)");

let totalXP = 0;
const gains = [350, 250, 500, 1000];
for (const gain of gains) {
  const result = sys.addXP(totalXP, gain);
  totalXP = result.levelInfo.totalXP;
  console.log(
    `  +${gain} XP → ${sys.format(result.levelInfo)}` +
      (result.didLevelUp ? `  🎉 LEVEL UP x${result.levelsChanged}` : "")
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. removeXP — demotion
// ═══════════════════════════════════════════════════════════════════════════════
section("4 — removeXP (demotion scenario)");

let xp2 = 1500; // starts at level 4
for (const loss of [200, 500, 400]) {
  const result = sys.removeXP(xp2, loss);
  xp2 = result.levelInfo.totalXP;
  console.log(
    `  -${loss} XP → ${sys.format(result.levelInfo)}` +
      (result.didLevelDown ? `  ⬇ LEVEL DOWN x${Math.abs(result.levelsChanged)}` : "")
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. levelUp() direct promotion
// ═══════════════════════════════════════════════════════════════════════════════
section("5 — Direct levelUp()");

let xp3 = 450; // level 3
for (let i = 0; i < 3; i++) {
  const result = sys.levelUp(xp3);
  xp3 = result.levelInfo.totalXP;
  console.log(`  After levelUp(): ${sys.format(result.levelInfo)}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. LevelInfo fields in detail
// ═══════════════════════════════════════════════════════════════════════════════
section("6 — Full LevelInfo snapshot at 1 000 XP");

const snapshot = sys.getLevelInfo(1000);
show("level", snapshot.level);
show("nextLevel", snapshot.nextLevel);
show("totalXP", snapshot.totalXP);
show("currentXP", snapshot.currentXP);
show("xpToNextLevel", snapshot.xpToNextLevel);
show("progressPercent", `${snapshot.progressPercent}%`);
show("isMaxLevel", snapshot.isMaxLevel);

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Linear curve
// ═══════════════════════════════════════════════════════════════════════════════
section("7 — Linear curve (baseXP = 500)");

const linearSys = new XPSystem({ baseXP: 500, curve: "linear" });
for (let lvl = 1; lvl <= 6; lvl++) {
  show(`Level ${lvl} starts at`, `${linearSys.xpForLevel(lvl)} XP`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Exponential curve
// ═══════════════════════════════════════════════════════════════════════════════
section("8 — Exponential curve (baseXP = 100, multiplier = 2)");

const expSys = new XPSystem({ baseXP: 100, curve: "exponential", multiplier: 2 });
for (let lvl = 1; lvl <= 6; lvl++) {
  show(`Level ${lvl} starts at`, `${expSys.xpForLevel(lvl)} XP`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. Custom formula  (classic RPG: level * (level + 1) * 50)
// ═══════════════════════════════════════════════════════════════════════════════
section("9 — Custom formula");

const customSys = new XPSystem({
  curve: "custom",
  customFormula: (level) => level * (level + 1) * 50,
});
for (let lvl = 1; lvl <= 6; lvl++) {
  show(`Level ${lvl} starts at`, `${customSys.xpForLevel(lvl)} XP`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 10. maxLevel cap
// ═══════════════════════════════════════════════════════════════════════════════
section("10 — maxLevel cap at 5");

const cappedSys = new XPSystem({ baseXP: 100, curve: "quadratic", maxLevel: 5 });
const capResult = cappedSys.addXP(1500, 9999);
show("After +9 999 XP:", sys.format(capResult.levelInfo));
show("isMaxLevel:", capResult.levelInfo.isMaxLevel);
show("levelsChanged:", capResult.levelsChanged);

// ═══════════════════════════════════════════════════════════════════════════════
// 11. Events
// ═══════════════════════════════════════════════════════════════════════════════
section("11 — Events (on/once/off)");

const eventSys = new XPSystem({ baseXP: 100, curve: "quadratic" });
eventSys.on("levelUp", (r) => console.log(`  📣 event levelUp → level ${r.levelInfo.level}`));
eventSys.on("maxLevelReached", (info) => console.log(`  📣 event maxLevelReached → ${info.level}`));
eventSys.addXP(0, 500, { reason: "quest:tutorial" });

// ═══════════════════════════════════════════════════════════════════════════════
// 12. Ranks / Tiers
// ═══════════════════════════════════════════════════════════════════════════════
section("12 — Ranks / Tiers");

const rankedSys = new XPSystem({
  baseXP: 100,
  curve: "quadratic",
  ranks: [
    { name: "Bronze", minLevel: 1, color: "#cd7f32" },
    { name: "Silver", minLevel: 5, color: "#c0c0c0" },
    { name: "Gold", minLevel: 10, color: "#ffd700" },
  ],
});
[1, 5, 7, 10].forEach((lvl) => {
  const rank = rankedSys.getRank(lvl)!;
  console.log(
    `  Level ${lvl} → ${rank.name} (next: ${rank.next?.name ?? "—"}, ${rank.progressToNext}%)`
  );
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. Achievements
// ═══════════════════════════════════════════════════════════════════════════════
section("13 — Achievements");

const tracker = new AchievementTracker([
  levelAchievement("first-steps", 2, { name: "First Steps" }),
  xpAchievement("grinder", 1000, { name: "Grinder" }),
]);
console.log("  Unlocked:", tracker.evaluate({ level: 4, totalXP: 1000 }).map((a) => a.name));
console.log("  Completion:", `${tracker.getCompletionPercent()}%`);

// ═══════════════════════════════════════════════════════════════════════════════
// 14. Player — stateful character with ranks, achievements & prestige
// ═══════════════════════════════════════════════════════════════════════════════
section("14 — Player (stateful, event-driven)");

const player = new Player({
  xpSystem: { baseXP: 100, curve: "quadratic", maxLevel: 5 },
  achievements: [levelAchievement("veteran", 3, { name: "Veteran" })],
  prestige: { enabled: true, bonusPerPrestige: 0.1 },
});
player.on("achievementUnlocked", (a) => console.log(`  🏆 achievement unlocked: ${a.name}`));
player.on("prestige", (p) => console.log(`  ⭐ prestige ${p.prestige}!`));

player.gainXP(900); // level 4, unlocks "veteran"
show("player.level", player.level);
player.setXP(player.xp.xpForLevel(5)); // reach max level to allow prestige
show("canPrestige()", player.canPrestige());
player.prestige();
show("player.prestigeLevel", player.prestigeLevel);
const boosted = player.gainXP(100); // +10% from prestige bonus
show("boosted xpDelta (100 base)", boosted.xpDelta);

// ═══════════════════════════════════════════════════════════════════════════════
// 15. Leaderboard
// ═══════════════════════════════════════════════════════════════════════════════
section("15 — Leaderboard");

const board = buildLeaderboard(
  [
    { id: "alice", totalXP: 1600, name: "Alice" },
    { id: "bob", totalXP: 900, name: "Bob" },
    { id: "carol", totalXP: 900, name: "Carol" },
  ],
  sys
);
board.forEach((entry) =>
  console.log(`  #${entry.position} ${entry.name} — level ${entry.level} (${entry.totalXP} XP)`)
);

console.log("\n");
