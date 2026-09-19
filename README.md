# xp-level-system

A zero-dependency, fully typed TypeScript package for XP-based leveling systems.

🌎 Language:
- 🇺🇸 English (this document)
- 🇧🇷 Portuguese: [README.pt-BR.md](./README.pt-BR.md)

---

## Installation

```bash
npm install xp-level-system
# or
yarn add xp-level-system
```

---

## Quick Start

```ts
import { XPSystem } from "xp-level-system";

const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

// XP → Level
const info = sys.getLevelInfo(1000);
console.log(info.level);           // 4
console.log(info.progressPercent); // 14%

// Level → Required total XP
console.log(sys.xpForLevel(3));    // 400
```

---

## Configuration (`XPSystemConfig`)

| Option | Type | Default | Description |
|---------|---------|---------|---------|
| `baseXP` | `number` | `100` | Base XP used in calculations |
| `multiplier` | `number` | `1.5` | Multiplier used by the `exponential` curve |
| `curve` | `LevelCurve` | `"quadratic"` | Growth formula |
| `customFormula` | `(level) => number` | — | Custom formula (required when `curve = "custom"`) |
| `minLevel` | `number` | `1` | Minimum level |
| `maxLevel` | `number` | `Infinity` | Maximum level cap |

### Available Curves

| Curve | Formula (total XP required to reach `level`) |
|---------|---------|
| `linear` | `baseXP × (level − 1)` |
| `quadratic` | `baseXP × (level − 1)²` |
| `exponential` | `baseXP × (multiplier^(level−1) − 1)` |
| `custom` | `customFormula(level)` |

---

## API

### `getLevelInfo(totalXP): LevelInfo`

Returns a complete progression snapshot based on accumulated XP.

```ts
const info = sys.getLevelInfo(1000);

info.level           // 4      — current level
info.nextLevel       // 5      — next level
info.totalXP         // 1000   — accumulated XP
info.currentXP       // 100    — XP within current level
info.xpToNextLevel   // 700    — XP required to level up
info.progressPercent // 14     — percentage (0–100)
info.isMaxLevel      // false  — whether max level has been reached
```

### `xpForLevel(level): number`

Returns the **total accumulated XP** required to be at `level`.

```ts
sys.xpForLevel(1) // 0
sys.xpForLevel(3) // 400
sys.xpForLevel(5) // 1600
```

### `levelFromXP(totalXP): number`

Converts total XP into a level.

```ts
sys.levelFromXP(1000) // 4
sys.levelFromXP(400)  // 3
```

### `addXP(currentTotalXP, amount): XPChangeResult`

Adds XP and returns the result, including how many levels were gained.

```ts
const result = sys.addXP(350, 500);

result.levelInfo      // Updated LevelInfo
result.levelsChanged  // +2 (gained 2 levels)
result.didLevelUp     // true
result.xpDelta        // 500
```

### `removeXP(currentTotalXP, amount): XPChangeResult`

Removes XP and returns the result, including how many levels were lost.

```ts
const result = sys.removeXP(1500, 700);

result.levelInfo      // Updated LevelInfo
result.levelsChanged  // -1 (lost 1 level)
result.didLevelDown   // true
result.xpDelta        // -700
```

### `levelUp(currentTotalXP): XPChangeResult`

Promotes the player directly to the next level (useful for admin actions).
Returns an unchanged state if already at `maxLevel`.

```ts
const result = sys.levelUp(450);
result.levelInfo.level // 4 (was level 3)
```

### `xpRequiredForLevel(level): number`

Returns the XP required **within** a specific level (delta between two thresholds).

```ts
sys.xpRequiredForLevel(3) // 500 (from 400 to 900)
```

### `format(info): string`

Formats a `LevelInfo` object into a user-friendly string.

```ts
sys.format(info) // "Level 4 (100 / 700 XP — 14%)"
```

---

## Events

`XPSystem` (and `Player`, below) emit events on every mutation, so you can drive UI
feedback — toasts, sound effects, confetti — without polling.

```ts
const sys = new XPSystem({ baseXP: 100, curve: "quadratic" });

sys.on("xpGained", (result) => console.log(`+${result.xpDelta} XP`));
sys.on("levelUp", (result) => console.log(`🎉 Level ${result.levelInfo.level}!`));
sys.on("maxLevelReached", (info) => console.log(`Max level reached: ${info.level}`));

sys.addXP(0, 500);
```

Available events: `xpGained`, `xpLost`, `levelUp`, `levelDown`, `maxLevelReached`.
Every `on()` call returns an unsubscribe function; `once()` and `removeAllListeners()`
are also available.

### XP multipliers & reason tags

```ts
// Double-XP weekend event
sys.addXP(currentXP, 100, { multiplier: 2, reason: "event:double-xp" });

// Quest reward, tagged for analytics/logging
sys.addXP(currentXP, 250, { reason: "quest:dragon-slay" });
```

---

## Ranks & Tiers

Configure named tiers (Bronze/Silver/Gold, or anything else) and resolve the current
one — plus the next tier and progress toward it — from a level:

```ts
const sys = new XPSystem({
  baseXP: 100,
  curve: "quadratic",
  ranks: [
    { name: "Bronze", minLevel: 1, color: "#cd7f32" },
    { name: "Silver", minLevel: 5, color: "#c0c0c0" },
    { name: "Gold", minLevel: 10, color: "#ffd700" },
    { name: "Diamond", minLevel: 20, color: "#b9f2ff" },
  ],
});

const rank = sys.getRank(7);
rank.name             // "Silver"
rank.next.name         // "Gold"
rank.progressToNext    // 40  (2 of 5 levels toward Gold)
```

---

## Achievements

`AchievementTracker` is a standalone, persistence-friendly badge engine — use it directly,
or let `Player` (below) drive it automatically.

```ts
import { AchievementTracker, levelAchievement, xpAchievement } from "xp-level-system";

const tracker = new AchievementTracker([
  levelAchievement("veteran", 10, { name: "Veteran", icon: "🎖️" }),
  xpAchievement("grinder", 10_000, { name: "Grinder", icon: "⚔️" }),
  { id: "secret", name: "???", hidden: true, condition: (ctx) => ctx.totalXP > 99_999 },
]);

const unlocked = tracker.evaluate({ level: 10, totalXP: 900 });
// → [{ id: "veteran", name: "Veteran", icon: "🎖️", unlockedAt: 1699999999999 }]

tracker.getCompletionPercent(); // 33
tracker.getLocked();            // remaining achievements (hidden ones show "???")

// Persist / restore
const saved = tracker.toJSON();
const restored = AchievementTracker.fromJSON(saved, definitions);
```

---

## `Player` — a complete, stateful game character

`XPSystem` is deliberately stateless (you own the persistence). `Player` is the batteries-
included alternative: it holds `totalXP` internally, wires up ranks/achievements/prestige,
and emits events automatically — the fastest way to model a game character.

```ts
import { Player, levelAchievement } from "xp-level-system";

const player = new Player({
  xpSystem: {
    baseXP: 100,
    curve: "quadratic",
    ranks: [
      { name: "Bronze", minLevel: 1 },
      { name: "Silver", minLevel: 5 },
      { name: "Gold", minLevel: 10 },
    ],
  },
  achievements: [levelAchievement("veteran", 10, { name: "Veteran" })],
  prestige: { enabled: true, requiredLevel: 10, bonusPerPrestige: 0.1 },
});

player.on("levelUp", (r) => console.log(`Level ${r.levelInfo.level}!`));
player.on("achievementUnlocked", (a) => console.log(`Unlocked: ${a.name}`));
player.on("prestige", (p) => console.log(`Prestige ${p.prestige}!`));

player.gainXP(500);              // grants XP, auto-checks achievements
player.level;                    // current level
player.rank;                     // current RankInfo | null
player.progress;                 // full LevelInfo snapshot
player.canPrestige();            // true once requiredLevel is reached
player.prestige();               // resets XP to 0, +1 prestige, permanent XP bonus

// Persistence — store `player.toJSON()` in your database, restore later:
const saved = player.toJSON();   // { totalXP, prestige, unlockedAchievements }
const restored = Player.fromJSON(saved, sameConfig);
```

---

## Leaderboard

Pure helper for ranking players by XP (standard competition ranking — ties share a
position):

```ts
import { buildLeaderboard } from "xp-level-system";

const board = buildLeaderboard(
  [
    { id: "alice", totalXP: 1600, name: "Alice" },
    { id: "bob", totalXP: 900, name: "Bob" },
  ],
  sys
);
// [{ id: "alice", ..., position: 1, level: 5 },
//  { id: "bob",   ..., position: 2, level: 4 }]
```

---

## Curve Examples

### Quadratic (default)

```
Level 1 →      0 XP
Level 2 →    100 XP
Level 3 →    400 XP
Level 4 →    900 XP
Level 5 →  1,600 XP
```

### Linear (`baseXP: 500`)

```
Level 1 →      0 XP
Level 2 →    500 XP
Level 3 →  1,000 XP
Level 4 →  1,500 XP
```

### Exponential (`baseXP: 100, multiplier: 2`)

```
Level 1 →      0 XP
Level 2 →    100 XP
Level 3 →    300 XP
Level 4 →    700 XP
Level 5 →  1,500 XP
Level 6 →  3,100 XP
```

### Custom

```ts
const sys = new XPSystem({
  curve: "custom",
  customFormula: (level) => level * (level + 1) * 50,
});
```

---

## Exported Types

```ts
import type {
  // Core
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
  XPChangeOptions,
  XPSystemEvents,
  // Ranks
  RankDefinition,
  RankInfo,
  // Achievements
  AchievementContext,
  AchievementDefinition,
  UnlockedAchievement,
  AchievementTrackerState,
  // Player
  PlayerConfig,
  PlayerState,
  PrestigeConfig,
  PrestigeResult,
  PlayerEvents,
  // Leaderboard
  LeaderboardEntry,
  RankedLeaderboardEntry,
} from "xp-level-system";
```

---

## Database Integration

Persist only `totalXP` — every other field is derived from it:

```ts
// Save
await db.user.update({ totalXP: result.levelInfo.totalXP });

// Load
const user = await db.user.findUnique({ where: { id } });
const info = sys.getLevelInfo(user.totalXP);
```

When using `Player`, persist `player.toJSON()` instead (it also captures prestige and
unlocked achievements):

```ts
// Save
await db.user.update({ progression: player.toJSON() });

// Load
const user = await db.user.findUnique({ where: { id } });
const player = Player.fromJSON(user.progression, config);
```

---

## Live Demo

The [`example/`](./example) folder contains a full Next.js "game dashboard" — animated XP
bar, rank badges, achievement grid, prestige button, and a leaderboard — built entirely on
top of this package. Deploy it to Vercel in one click:

```bash
cd example
npm install
npm run dev
```

See [`example/README.md`](./example/README.md) for the Vercel deploy instructions.

---

## License

[MIT](./LICENSE)