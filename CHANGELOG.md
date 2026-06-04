# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-01

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
