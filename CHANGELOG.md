# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-19

Fully backward-compatible — no breaking changes from 1.0.0.

### Added
- **Events** — `XPSystem` now extends a zero-dependency `TypedEmitter`. Subscribe with
  `.on("xpGained" | "xpLost" | "levelUp" | "levelDown" | "maxLevelReached", ...)`,
  plus `.once()`, `.off()`, `removeAllListeners()`.
- **Ranks / Tiers** — pass `ranks: RankDefinition[]` to `XPSystem` (Bronze/Silver/Gold-style
  tiers) and call `sys.getRank(level)` to get the current tier, the next one, and progress
  toward it.
- **XP multiplier & reason tag** — `addXP` / `removeXP` accept a third `options` argument:
  `{ multiplier, reason }`, for double-XP boosts, weekend events, and quest-sourced XP.
- **`AchievementTracker`** — standalone, persistence-friendly achievement/badge engine with
  `evaluate()`, `getUnlocked()`, `getLocked()` (with `hidden` achievement support),
  `getCompletionPercent()`, and `toJSON()`/`fromJSON()`. Ships with `levelAchievement()`,
  `xpAchievement()`, and `prestigeAchievement()` factory helpers.
- **`Player`** — a new stateful, event-driven convenience class wrapping `XPSystem` +
  `AchievementTracker`: holds `totalXP` internally, exposes `level` / `rank` / `progress`
  getters, auto-unlocks achievements, supports an optional **prestige** system
  (`canPrestige()` / `prestige()` with a permanent `bonusPerPrestige` XP multiplier), and
  round-trips through `toJSON()` / `Player.fromJSON()` for database persistence.
- **`buildLeaderboard()`** — pure helper that ranks a list of `{ id, totalXP }` entries by
  XP (standard competition ranking — ties share a position) and attaches each entry's
  derived level.
- 65 additional unit tests (138 total) covering every new module.

### Changed
- `package.json` description/keywords updated to reflect the broader feature set.

### Added
- `XPSystem` class with configurable leveling curves
- Supported curves: `linear`, `quadratic`, `exponential`, `custom`
- `getLevelInfo(totalXP)` — full snapshot derived from total XP
- `xpForLevel(level)` — bidirectional: level → cumulative XP threshold
- `levelFromXP(totalXP)` — bidirectional: XP → level
- `addXP(total, amount)` — adds XP, returns delta with level-up detection
- `removeXP(total, amount)` — removes XP, returns delta with level-down detection
- `levelUp(total)` — direct level promotion
- `xpRequiredForLevel(level)` — XP delta inside a specific level
- `format(info)` — human-readable string
- `maxLevel` cap support
- `minLevel` offset support
- Full TypeScript types exported: `LevelInfo`, `XPChangeResult`, `XPSystemConfig`, `LevelCurve`
- 73 unit tests with Vitest
- CJS + ESM dual build
