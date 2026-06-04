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
  XPSystemConfig,
  LevelCurve,
  LevelInfo,
  XPChangeResult,
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

---

## License

[MIT](./LICENSE)