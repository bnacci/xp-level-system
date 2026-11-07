export interface DocSection {
  id: string;
  title: string;
  group: "Getting started" | "Core concepts" | "Integrations";
  paragraphs: string[];
  examples?: { name: string; code: string }[];
  table?: { headers: string[]; rows: string[][] };
  note?: string;
}

export const docs: DocSection[] = [
  {
    id: "installation",
    title: "Installation",
    group: "Getting started",
    paragraphs: [
      "xp-level-system is a zero-dependency TypeScript package for XP, levels, ranks, achievements, and prestige. Use it in a browser, a Node.js service, or any framework that runs JavaScript.",
      "Install the package, then choose XPSystem for calculations with state you already own, or Player for a stateful progression model. Both include TypeScript declarations.",
    ],
    examples: [{ name: "terminal", code: "npm install xp-level-system" }],
    table: {
      headers: ["Choose", "When to use it"],
      rows: [
        [
          "XPSystem",
          "You store totalXP yourself and need level calculations, ranks, and typed events.",
        ],
        [
          "Player",
          "You want XP state, achievements, ranks, and prestige connected for you.",
        ],
        [
          "AchievementTracker",
          "You need standalone badges, including custom context conditions.",
        ],
      ],
    },
  },
  {
    id: "quick-start",
    title: "Your first level-up",
    group: "Getting started",
    paragraphs: [
      "Levels start at 1. With baseXP: 100 and a quadratic curve, level 2 begins at 100 total XP, level 3 at 400, and level 4 at 900. XPSystem does not retain your current XP: pass the accumulated total into each calculation.",
    ],
    examples: [
      {
        name: "quick-start.ts",
        code: `import { XPSystem } from "xp-level-system";

const system = new XPSystem({ baseXP: 100, curve: "quadratic" });
const result = system.addXP(350, 100);

result.levelInfo.totalXP; // 450
result.levelInfo.level;   // 3
result.didLevelUp;        // true
result.levelsChanged;    // 1

const info = system.getLevelInfo(450);
info.currentXP;          // 50 earned within level 3
info.xpToNextLevel;      // 500: the full span of level 3
info.progressPercent;   // 10
const remaining = info.isMaxLevel
  ? 0
  : info.xpToNextLevel - info.currentXP; // 450`,
      },
    ],
    note: "xpToNextLevel is the size of the current level, not the remaining XP. Subtract currentXP to show how much is left. At the level cap, remaining XP is 0 and progressPercent is 100.",
  },
  {
    id: "configuration",
    title: "Configuration & curves",
    group: "Core concepts",
    paragraphs: [
      "Every curve returns the cumulative XP required to reach a level. Set maxLevel to give your experience an endpoint. The exponential curve's multiplier controls difficulty growth; the multiplier passed to gainXP or addXP controls rewards.",
    ],
    table: {
      headers: ["Option", "Default", "Meaning"],
      rows: [
        ["baseXP", "100", "Base value for built-in curves."],
        ["curve", '"quadratic"', "linear, quadratic, exponential, or custom."],
        ["multiplier", "1.5", "Growth factor for the exponential curve."],
        ["minLevel", "1", "Lowest level."],
        [
          "maxLevel",
          "Infinity",
          "Highest level; use a finite value for capped progression.",
        ],
        [
          "customFormula",
          "—",
          "Required for a custom curve; returns total XP for a level.",
        ],
        ["ranks", "[]", "Named tiers with minLevel thresholds."],
      ],
    },
    examples: [
      {
        name: "curves.ts",
        code: `import { XPSystem } from "xp-level-system";

// Linear: baseXP * (level - 1)
const linear = new XPSystem({ curve: "linear", baseXP: 100 });
linear.xpForLevel(4); // 300

// Quadratic: baseXP * (level - 1) ** 2
const quadratic = new XPSystem({ curve: "quadratic", baseXP: 100 });
quadratic.xpForLevel(4); // 900

// Exponential: baseXP * (multiplier ** (level - 1) - 1)
const exponential = new XPSystem({
  curve: "exponential", baseXP: 100, multiplier: 2,
});
exponential.xpForLevel(4); // 700

// Custom: keep cumulative thresholds increasing.
const custom = new XPSystem({
  curve: "custom",
  customFormula: (level) => 75 * (level - 1) ** 2,
  maxLevel: 20,
});`,
      },
    ],
  },
  {
    id: "xp-system",
    title: "XPSystem API",
    group: "Core concepts",
    paragraphs: [
      "XPSystem calculates progression without storing a player's XP. Mutation helpers return XPChangeResult with levelInfo, xpDelta, levelsChanged, didLevelUp, didLevelDown, and an optional reason tag. A single reward can cross several levels.",
    ],
    table: {
      headers: ["Method", "Returns / behavior"],
      rows: [
        [
          "getLevelInfo(totalXP)",
          "LevelInfo: level, nextLevel, totalXP, currentXP, xpToNextLevel, progressPercent, isMaxLevel.",
        ],
        ["xpForLevel(level)", "Cumulative XP threshold for a level."],
        ["levelFromXP(totalXP)", "Level derived from total XP."],
        [
          "xpRequiredForLevel(level)",
          "Difference between this level's threshold and the next.",
        ],
        [
          "addXP(totalXP, amount, options?)",
          "XPChangeResult after granting XP.",
        ],
        [
          "removeXP(totalXP, amount, options?)",
          "XPChangeResult after removing XP; total cannot go below 0.",
        ],
        [
          "levelUp(totalXP)",
          "Promotes to the next level; unchanged at the cap.",
        ],
        ["getRank(level)", "RankInfo, or null when no rank applies."],
        ["format(info)", "A human-readable level/progress string."],
      ],
    },
    examples: [
      {
        name: "rewards.ts",
        code: `import { XPSystem } from "xp-level-system";
const system = new XPSystem({ baseXP: 100 });

const reward = system.addXP(400, 100, {
  multiplier: 2,
  reason: "lesson:complete",
});
reward.xpDelta;           // 200
reward.levelInfo.totalXP; // 600

const penalty = system.removeXP(600, 50, { reason: "penalty" });
penalty.levelInfo.totalXP; // 550

system.xpForLevel(3);        // 400 total XP
system.xpRequiredForLevel(3); // 500 XP from level 3 to 4`,
      },
    ],
    note: "Reward multipliers are floored after multiplication. removeXP also accepts a multiplier; pass 1 for an exact penalty. Persist the returned totalXP if XPSystem owns your calculations.",
  },
  {
    id: "player",
    title: "Player API",
    group: "Core concepts",
    paragraphs: [
      "Player holds totalXP internally and composes XPSystem, AchievementTracker, ranks, and optional prestige. Provide initialXP and initialPrestige when starting with existing progress, or use Player.fromJSON to restore a full save.",
    ],
    examples: [
      {
        name: "player.ts",
        code: `import { Player, levelAchievement } from "xp-level-system";

const player = new Player({
  xpSystem: { baseXP: 100, curve: "quadratic", maxLevel: 10 },
  achievements: [
    levelAchievement("first", 2, { name: "First leap" }),
  ],
});

const result = player.gainXP(100, { reason: "first-lesson" });
player.level;       // 2
player.totalXP;     // 100
player.progress;    // LevelInfo
player.rank;        // null (no ranks configured)
player.getUnlockedAchievements(); // First leap
const saved = player.toJSON();`,
      },
    ],
    table: {
      headers: ["Member", "Purpose"],
      rows: [
        [
          "totalXP / level / progress / rank",
          "Read the current XP, derived level, LevelInfo, and RankInfo.",
        ],
        [
          "xp / prestigeLevel",
          "Underlying XPSystem and current prestige count.",
        ],
        [
          "gainXP(amount, options?)",
          "Apply rewards and evaluate achievements; returns XPChangeResult.",
        ],
        [
          "loseXP(amount, options?)",
          "Apply a penalty; returns XPChangeResult.",
        ],
        [
          "setXP(totalXP)",
          "Set XP directly and evaluate achievements; no XP-change events.",
        ],
        [
          "canPrestige() / prestige()",
          "Check eligibility; reset XP and increment prestige, or return null if ineligible.",
        ],
        [
          "getUnlockedAchievements() / getLockedAchievements()",
          "Read unlocked or remaining achievement definitions.",
        ],
        ["getAchievementCompletionPercent()", "Integer completion percentage."],
        [
          "toJSON() / Player.fromJSON(state, config)",
          "Serialize progress or restore with the same definitions.",
        ],
      ],
    },
  },
  {
    id: "ranks",
    title: "Ranks & tiers",
    group: "Core concepts",
    paragraphs: [
      "Ranks map level thresholds to names, colors, and icons. Start with a rank at minLevel: 1 so every player belongs to a tier. The package sorts definitions by minLevel. progressToNext is based on level distance, not XP distance.",
    ],
    examples: [
      {
        name: "ranks.ts",
        code: `import { XPSystem } from "xp-level-system";

const system = new XPSystem({
  ranks: [
    { name: "Explorer", minLevel: 1, color: "#6246d9" },
    { name: "Maker", minLevel: 3, color: "#698838" },
    { name: "Legend", minLevel: 6, color: "#ad4d7c" },
  ],
});

const rank = system.getRank(4);
rank?.name;           // "Maker"
rank?.next?.name;     // "Legend"
rank?.progressToNext; // 33 (one of three levels)
// At the highest tier, next is null.`,
      },
    ],
  },
  {
    id: "achievements",
    title: "Achievements",
    group: "Core concepts",
    paragraphs: [
      "Use levelAchievement, xpAchievement, and prestigeAchievement for common milestones. Add a condition for custom rules. Player evaluates achievements at construction, on gainXP, on setXP, on prestige, and when restoring state. An unlocked achievement stays unlocked.",
      "Use AchievementTracker directly when your conditions need extra context such as lessonsCompleted. Call evaluate(context) yourself; it returns only newly unlocked achievements. Hidden achievements have their name masked as ??? and their description/icon removed from getLocked().",
    ],
    examples: [
      {
        name: "achievements.ts",
        code: `import {
  AchievementTracker, levelAchievement, xpAchievement,
  prestigeAchievement,
} from "xp-level-system";

import type { AchievementContext } from "xp-level-system";

const definitions = [
  levelAchievement("veteran", 10, { name: "Veteran" }),
  xpAchievement("grinder", 1000, { name: "Getting started" }),
  prestigeAchievement("reborn", 1, { name: "Reborn" }),
  {
    id: "student", name: "Study streak",
    condition: (context: AchievementContext) =>
      Number(context.lessonsCompleted ?? 0) >= 5,
  },
];
const tracker = new AchievementTracker(definitions);
tracker.evaluate({ level: 1, totalXP: 0, lessonsCompleted: 5 });
tracker.isUnlocked("student"); // true
tracker.getCompletionPercent(); // 25
const saved = tracker.toJSON();
const restored = AchievementTracker.fromJSON(saved, definitions);`,
      },
    ],
    note: "AchievementTracker also exposes register(), getUnlocked(), getLocked(), and reset(). Saved data contains IDs and unlock timestamps; keep the definitions in your application configuration.",
  },
  {
    id: "events",
    title: "Events & multipliers",
    group: "Core concepts",
    paragraphs: [
      "XPSystem and Player emit typed events synchronously. on() returns an unsubscribe function. once() listens for one occurrence; off(event, listener) removes a specific listener and removeAllListeners(event?) removes all matching subscriptions.",
      "Use the event payload for the updated LevelInfo. XP events are forwarded while the Player mutation is running, so read the final Player state or persist it after gainXP returns.",
    ],
    table: {
      headers: ["Event", "Payload", "Available on"],
      rows: [
        ["xpGained / xpLost", "XPChangeResult", "XPSystem, Player"],
        ["levelUp / levelDown", "XPChangeResult", "XPSystem, Player"],
        ["maxLevelReached", "LevelInfo", "XPSystem, Player"],
        ["achievementUnlocked", "UnlockedAchievement", "Player"],
        ["prestige", "PrestigeResult", "Player"],
      ],
    },
    examples: [
      {
        name: "events.ts",
        code: `import { Player } from "xp-level-system";
const player = new Player();

const unsubscribe = player.on("levelUp", (result) => {
  console.log("New level:", result.levelInfo.level);
});
player.once("xpGained", (result) => console.log(result.reason));

player.gainXP(100, { multiplier: 2, reason: "weekend" });
const updatedState = player.toJSON(); // Read after mutation.
unsubscribe(); // In React, do this in your effect cleanup.`,
      },
    ],
  },
  {
    id: "prestige",
    title: "Prestige",
    group: "Core concepts",
    paragraphs: [
      "Prestige starts a new run while keeping achievements. Set enabled: true and a reachable requiredLevel. A successful prestige() resets totalXP to 0, increments prestigeLevel, and returns { prestige, previousLevel }; an ineligible call returns null.",
      "The reward multiplier is options.multiplier × (1 + bonusPerPrestige × prestigeLevel). With one prestige and a 10% bonus, a 100 XP reward becomes 110; double XP makes it 220.",
    ],
    examples: [
      {
        name: "prestige.ts",
        code: `import { Player } from "xp-level-system";

const player = new Player({
  xpSystem: { baseXP: 100, maxLevel: 6 },
  prestige: {
    enabled: true,
    requiredLevel: 6,
    bonusPerPrestige: 0.1,
    maxPrestige: 5,
  },
});
player.gainXP(2500); // Level 6
if (player.canPrestige()) player.prestige();
player.totalXP;       // 0
player.prestigeLevel; // 1
player.gainXP(100, { multiplier: 2 }).xpDelta; // 220`,
      },
    ],
    note: "Defaults: enabled is false, bonusPerPrestige is 0, maxPrestige is Infinity, and requiredLevel uses the XP system's maxLevel. Set a finite reachable threshold.",
  },
  {
    id: "persistence",
    title: "Save & restore",
    group: "Integrations",
    paragraphs: [
      "The package does not access localStorage, your database, or your network. XPSystem only needs totalXP; Player needs the full PlayerState: totalXP, prestige, and unlockedAchievements. Persist after the mutation completes.",
      "Restore with the same configuration and achievement IDs. JSON does not contain functions such as achievement conditions or customFormula. Validate external data before passing it to fromJSON.",
    ],
    examples: [
      {
        name: "persistence.ts",
        code: `import { Player, levelAchievement } from "xp-level-system";

const config = {
  xpSystem: { baseXP: 100, maxLevel: 10 },
  achievements: [levelAchievement("first", 2)],
};
const player = new Player(config);
player.gainXP(100);
const snapshot = player.toJSON();
// { totalXP: 100, prestige: 0, unlockedAchievements: { first: ... } }

// Browser only: call after mount or from an event handler.
localStorage.setItem("progress", JSON.stringify(snapshot));
const restored = Player.fromJSON(snapshot, config);
restored.level; // 2

// Server integration: store snapshot in your database instead.
// Grant rewards only after validating the completed action.`,
      },
    ],
  },
  {
    id: "react",
    title: "React & Next.js",
    group: "Integrations",
    paragraphs: [
      "Keep a stable Player instance and mirror its progress into React state after each action. Player is mutable; calling gainXP alone does not trigger a React render. In Next.js, put browser interactions in a client component.",
      "This example creates the same initial state on server and client. If restoring from localStorage, read it in useEffect after mount, handle parse/storage errors, and update the rendered state. Remove event subscriptions in the effect cleanup.",
    ],
    examples: [
      {
        name: "Progress.tsx",
        code: `"use client";

import { useState } from "react";
import { Player } from "xp-level-system";

export function Progress() {
  const [player] = useState(() => new Player({
    xpSystem: { baseXP: 100, maxLevel: 10 },
  }));
  const [progress, setProgress] = useState(player.progress);

  function completeLesson() {
    const result = player.gainXP(100, { reason: "lesson:complete" });
    setProgress(result.levelInfo);
    // Save player.toJSON() here, after the mutation.
  }

  return (
    <section>
      <p>Level {progress.level} · {progress.totalXP} XP</p>
      <button onClick={completeLesson}>Complete a lesson</button>
    </section>
  );
}`,
      },
    ],
  },
  {
    id: "leaderboard",
    title: "Leaderboard",
    group: "Integrations",
    paragraphs: [
      "buildLeaderboard(entries, xpSystem) returns a new array sorted by totalXP descending, enriched with position and level. It preserves your extra fields and does not mutate the input. Ties share a competition ranking: 1, 2, 2, 4.",
    ],
    examples: [
      {
        name: "leaderboard.ts",
        code: `import { XPSystem, buildLeaderboard } from "xp-level-system";

const system = new XPSystem({ baseXP: 100 });
const board = buildLeaderboard([
  { id: "luna", name: "Luna", totalXP: 1600 },
  { id: "nico", name: "Nico", totalXP: 900 },
  { id: "you", name: "You", totalXP: 900 },
], system);

board.map(({ name, position, level }) => ({ name, position, level }));
// Luna: position 1, level 5
// Nico: position 2, level 4
// You:  position 2, level 4`,
      },
    ],
  },
  {
    id: "types",
    title: "TypeScript exports",
    group: "Integrations",
    paragraphs: [
      "Public types are available from the package root. TypedEmitter is also exported for building your own typed event sources. The package publishes CommonJS and ES modules; import from xp-level-system rather than internal paths.",
    ],
    examples: [
      {
        name: "types.ts",
        code: `import type {
  XPSystemConfig, LevelCurve, LevelInfo,
  XPChangeResult, XPChangeOptions, XPSystemEvents,
  RankDefinition, RankInfo,
  AchievementContext, AchievementDefinition,
  UnlockedAchievement, AchievementTrackerState,
  PlayerConfig, PlayerState, PlayerEvents,
  PrestigeConfig, PrestigeResult,
  LeaderboardEntry, RankedLeaderboardEntry,
} from "xp-level-system";`,
      },
    ],
  },
];
